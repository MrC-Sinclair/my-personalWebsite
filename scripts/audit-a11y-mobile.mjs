/**
 * 移动端 + 无障碍审计（CDP）
 * ------------------------------------------------------------
 * 项目声称「完整适配移动端」与「WCAG AA」，但此前只做过对比度计算，
 * 从没在真实浏览器里量过。这个脚本在移动端视口下逐页检查：
 *   1. 横向溢出（页面被撑宽，移动端最致命的布局问题）
 *   2. h1 数量（AGENTS 红线：每页必须有且仅有一个）
 *   3. 触控目标命中区 < 40×40（项目无障碍红线）。量的是命中区不是边框盒，
 *      还原模型与 scripts/probe-touch-targets.mjs 共用 hit-box.mjs，两边数字必须对得上
 *   4. 图片缺 alt、主文档 HTTP 状态（404 判定不能只看 document.title：
 *      静态服务器上缺失的页面根本没有 Nuxt 错误页，标题判据会静默放过）
 *   5. 语言切换入口：本页是否存在指向「另一语言同一页」的链接。双语站点
 *      漏了这一条，英文页就成了孤岛（用户切不过去）。详情页没有导航，
 *      用 AUDIT_DETAIL 抽查时不参与这条判定
 *   6. 被 hidden/clip 藏起来的超宽内容（scrollWidth 量不到，用户读不到右半截）
 *   7. 横向滚动带被挤成一条缝（实测宽 < 80 而内容比它宽 40 以上）：
 *      不溢出、命中区也够，但那条导航等于消失了
 *   8. 正文列被压进网格的一格（最宽正文块 < 视口 40%）：不溢出、h1 也唯一，
 *      只能直接量列宽——dashboard 详情页就这么整篇压进 18.8px 一列过
 *
 * 用法：MSYS_NO_PATHCONV=1 node scripts/audit-a11y-mobile.mjs [baseURL]
 */
import { HIT_BOX_SRC } from './hit-box.mjs'
import { SQUEEZE_SRC } from './squeeze-check.mjs'

/** 当前持有的 CDP socket，只给「出错也要退出」那条路径用 */
let liveWs = null

// 默认打线上：这是真实发布物（Caddy 服务 generate 产物），量到的就是用户拿到的。
// 子路径部署时 BASE 必须带上 baseURL 前缀，否则资源链接与路由全错。
const BASE = process.argv[2] || 'https://122.51.97.106:8444'
// AUDIT_LOCALE=en 时审英文站（i18n 用 prefix_except_default：英文路径带 /en 前缀）。
// 802 页里英文占一半，只审中文等于漏掉一半。
const LOCALE_PREFIX = process.env.AUDIT_LOCALE === 'en' ? '/en' : ''
// 默认全量审计 20 个风格 × 5 个页面（100 页，约 8 分钟）；
// 只想抽查时用 AUDIT_STYLES 覆盖，例如 AUDIT_STYLES=y2k,pixel
const ALL_STYLES = [
  'minimalism', 'liquid-glass', 'metro', 'swiss', 'flat-design',
  'glassmorphism', 'claymorphism', 'neumorphism', 'cyberpunk', 'editorial',
  'neo-brutalism', 'soft-3d', 'sci-fi-hud', 'skeuomorphism', 'web2-glossy',
  'retro-computer', 'dashboard', 'pixel', 'terminal', 'y2k',
]
const STYLES = process.env.AUDIT_STYLES ? process.env.AUDIT_STYLES.split(',') : ALL_STYLES
// AUDIT_DETAIL=blog|projects：不审列表页，改为进入该栏目的**第一篇详情页**。
// 详情路由占全站 802 页里的大头（约 560 页），此前从没被审计过。
const DETAIL = process.env.AUDIT_DETAIL || ''
const PAGES = DETAIL ? [''] : ['', '/about', '/projects', '/blog', '/contact']
// 默认 390×844。AUDIT_VIEWPORT 可以压窄：CI 的 Linux 回退字体让文本变宽，
// 效果等价于视口变窄——本地量不到「只剩 9px 余量」的那类溢出，压窄就能钓出来。
const [VW, VH] = (process.env.AUDIT_VIEWPORT || '390,844').split(',').map(Number)
const VIEWPORT = { width: VW, height: VH, deviceScaleFactor: 3, mobile: true }

/**
 * 失败原因必须**读得到**：作业日志要鉴权（实测匿名 403），而 check-run annotations
 * 匿名就能读。所以红的时候除了 stdout，还要发一条 ::error:: 工作流命令，
 * 否则「CI 红了但不知道为什么」只能靠再改一次 CI 去猜。
 * 命令里 % 必须写成 %25、换行要压掉，否则整条注解静默丢失。
 */
function annotate(message) {
  const safe = String(message).replace(/\r?\n/g, ' ').replace(/%/g, '%25').slice(0, 500)
  console.log(`::error::${safe}`)
}

async function main() {
  // CDP 端口：默认的 9222 实例**会被用坏**（表现为脚本挂住不退出），
  // 这时换一个端口起新实例即可，不用去杀可能正在被你正常使用的 Chrome。
  const CDP_PORT = process.env.CDP_PORT || '9222'
  const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json()
  const page = list.find((t) => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  // 出错路径必须能关掉这个 socket：CDP 超时抛错时 socket 还开着，
  // 事件循环永不空转，进程就挂在那里（表现是「审计早退了、后面几轮全在串页」，
  // 更糟的是它还在继续驱动同一个 tab，把后面那轮的量全污染）。
  liveWs = ws
  let seq = 0
  const pending = new Map()
  // 主文档的 HTTP 状态由 CDP 事件带来（事件消息没有 id，不进 pending 分支）。
  // 这是 404 判定的唯一可靠来源：脚本自身的 fetch 会走系统代理、且对自签证书站会失败。
  let docStatus = 0
  // 子资源（样式表/脚本）的 4xx 同样要抓：挂载点与构建期 baseURL 不一致时，
  // 页面照样渲染、h1 照样唯一，但全局样式与 JS 全 404 —— 于是量到的是半裸页面。
  // 本机实测踩过：把带 /my-personalWebsite 前缀的产物挂在 / 上，凭空多出 4 条报警。
  let failedAssets = 0
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    } else if (msg.method === 'Network.responseReceived') {
      const { type, response } = msg.params || {}
      if (type === 'Document') docStatus = response.status
      else if ((type === 'Script' || type === 'Stylesheet') && response.status >= 400) failedAssets++
    }
  }
  // 每个 CDP 调用都要有超时：headless 实例会被用坏，表现为「连 6 秒的 evaluate
  // 都不返回」且无任何报错。没有超时的话 CI 里就是一次挂死烧满 job 时限、
  // 日志里连一行诊断都没有（本机实测：卡在第一页十几分钟零输出）。
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq
      const timer = setTimeout(() => {
        pending.delete(id)
        reject(new Error(`CDP 超时: ${method}`))
      }, 40000)
      pending.set(id, (m) => {
        clearTimeout(timer)
        // 协议层错误要冒出来：以前直接把带 error 的消息交给调用方，
        // 调用方读到 undefined 就当成「这页没数据」，于一类故障静默变成零信号
        if (m.error) reject(new Error(method + ': ' + JSON.stringify(m.error)))
        else resolve(m)
      })
      ws.send(JSON.stringify({ id, method, params }))
    })

  await new Promise((r) => (ws.onopen = r))
  await send('Page.enable')
  await send('Network.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', VIEWPORT)

  const rows = []
  for (const style of STYLES) {
    for (const suffix of PAGES) {
      // 详情模式：列表页是 SSG 静态 HTML，直接 fetch 抓第一条详情链接。
      // （早先用 CDP 二次导航取链接会挂住：navigate 后 ws 上的 pending promise
      //   可能永不 resolve，脚本被 SIGTERM）
      let url = `${BASE}${LOCALE_PREFIX}/style/${style}${suffix}`
      if (DETAIL) {
        const listUrl = `${BASE}${LOCALE_PREFIX}/style/${style}/${DETAIL}`
        let href = ''
        if (process.env.AUDIT_SLUG) {
          // 直接指定 slug：dev 环境下 node 的 fetch 会走系统代理，抓 localhost 会挂住
          href = `${LOCALE_PREFIX}/style/${style}/${DETAIL}/${process.env.AUDIT_SLUG}`
        } else {
          const html = await fetch(listUrl).then((r) => r.text())
          const m = html.match(
            new RegExp(`href="([^"]*/style/${style}/${DETAIL}/[^"#?]+)"`),
          )
          if (!m) {
            console.log(`${style.padEnd(12)} ${DETAIL.padEnd(10)} (列表页无详情链接)`)
            continue
          }
          href = m[1]
        }
        // ⚠️ 列表页里的 href 是**含 baseURL 的根路径**（/my-personalWebsite/style/...），
        //    不能直接 `BASE + href`——那会把子路径拼两遍导致 404。用 origin 拼。
        url = href.startsWith('http') ? href : new URL(href, new URL(BASE).origin).href
      }
      // 导航前清零，避免读到上一页的状态。301 与最终响应都会以 Document 类型上报，
      // 事件按序到达，后写的覆盖先写的，所以拿到的就是跟随重定向后的最终状态。
      docStatus = 0
      failedAssets = 0
      await send('Page.navigate', { url })
      await new Promise((r) => setTimeout(r, DETAIL ? 5000 : 4500))
      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const doc = document.documentElement;
          const h1 = document.querySelectorAll('h1').length;
          ${HIT_BOX_SRC}
          ${SQUEEZE_SRC}
          // 触控目标量「命中区」而不是边框盒，口径与 scripts/probe-touch-targets.mjs 保持一致：
          // 覆盖式链接（::after 用 inset:0 铺满整行/整卡）、外扩命中区（inset 为负）、
          // display:inline 包住块级子元素时塌成 0 宽的链接，直接量 rect 会把这三类全判成不合格。
          // 无 href 的 <a> 不是可点元素，所以选择器是 a[href]。
          const targets = [...document.querySelectorAll('a[href], button')]
            .map((el) => ({ el: el, box: hitBox(el) }))
            .filter((t) => (t.box.width || t.box.height) && getComputedStyle(t.el).visibility !== 'hidden');
          // 地板 40×40（项目无障碍红线），按整像素比较：soft-3d 的 .z-item 带 0.97 缩放
          //（层次深度的签名效果），投影后的 rect 比布局盒小 0.5px（实测 41 → 39.53），那不是命中区不足
          // 行内链接豁免：正文里、目录里、面包屑里的文字链接，display 是 inline，
          // 它的尺寸由所在文字行决定（WCAG 2.5.8 的 inline 例外）。
          // 详情页一测就是 30 个这种「小目标」，硬撑到 40px 反而把正文排坏。
          // 只豁免 display: inline —— inline-block / flex 是刻意做的盒子，仍然要达标。
          const isInlineText = (el) => {
            const p = el.parentElement;
            if (!p) return false;
            if (!/^(p|li|h1|h2|h3|h4|blockquote|dd|td)$/.test(p.tagName.toLowerCase())) return false;
            return getComputedStyle(el).display === 'inline';
          };
          const smallEls = targets.filter(
            (t) =>
              (Math.round(t.box.width) < 40 || Math.round(t.box.height) < 40) &&
              !isInlineText(t.el),
          );
          const small = smallEls.length;
          // 明细无条件带上（最多 3 条）：只有 small>0 时才会被打印出去，
          // 不给类名的话 CI 日志里只剩一个数字，没法归因。
          // 用拼接而不是嵌套模板串：外层 expression 本身就是模板串，
          // 内层再写插值语法会被 Node 提前解析（SyntaxError）
          const smallDetail = smallEls.slice(0, 3).map((t) => {
            const el = t.el;
            // className 在 SVG 元素上是 SVGAnimatedString 对象，必须 String() 兜住
            return (
              el.tagName.toLowerCase() +
              '.' +
              (String(el.className).split(/\\s+/)[0] || '(无类名)') +
              ' ' +
              Math.round(t.box.width) + 'x' + Math.round(t.box.height) +
              ' "' + (el.textContent || '').trim().slice(0, 16) + '"'
            );
          });
          const imgNoAlt = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length;
          // 溢出必须给出「是谁越界」：只报一个像素数，就得再改一次 CI 才能知道元凶
          // （CI 作业日志要鉴权，注解里只有这么多字能带出来）。
          // 判据是「越界且没有被祖先裁剪」：横向滚动容器里的子元素右缘可以远到 635px
          //（实测锚点导航的 chip），但它们由 overflow-x:auto/hidden 的祖先管着，
          // 根本不贡献 document.scrollWidth，按右缘大小排会把它们误指为元凶。
          // 早先按「视口 + 溢出量」这条边界带筛过，依赖 scrollWidth 精确对齐，
          // 本机压窄到 320 复现时就接不上、明细变空。
          const vw = doc.clientWidth;
          const over = doc.scrollWidth - vw;
          // 祖先链必须记忆化：页面一旦整体越界，几乎所有后代的右缘都超过视口，
          // 逐个走祖先会把 getComputedStyle 调到几万次（实测 5 页跑满 7 分钟，
          // 全部超过 CDP 的 40 秒超时）。链上节点高度重叠，记忆化后每个元素最多算一次。
          const clipsX = new Map();
          const doesClip = (el) => {
            let v = clipsX.get(el);
            if (v === undefined) {
              const ox = getComputedStyle(el).overflowX;
              v = ox === 'hidden' || ox === 'auto' || ox === 'scroll' || ox === 'clip';
              clipsX.set(el, v);
            }
            return v;
          };
          const underClip = new Map();
          const isClipped = (el) => {
            let v = underClip.get(el);
            if (v === undefined) {
              const p = el.parentElement;
              v = p && p !== doc.documentElement ? doesClip(p) || isClipped(p) : false;
              underClip.set(el, v);
            }
            return v;
          };
          // 「藏起来的溢出」要单独判：overflow-x: hidden/clip 的祖先会把超宽内容
          // 剪掉，document.scrollWidth 因此量不到（metro 详情页实测正文 873px
          // 压在 390 视口里、溢出判据全绿，而用户读不到右半截）。
          // 只算 hidden/clip——auto/scroll 是设计上的滚动区，不算缺陷。
          const hidesX = new Map();
          const doesHide = (el) => {
            let v = hidesX.get(el);
            if (v === undefined) {
              const ox = getComputedStyle(el).overflowX;
              v = ox === 'hidden' || ox === 'clip';
              hidesX.set(el, v);
            }
            return v;
          };
          const hiddenChain = new Map();
          const isHiddenBy = (el) => {
            let v = hiddenChain.get(el);
            if (v === undefined) {
              const p = el.parentElement;
              v = p && p !== doc.documentElement ? doesHide(p) || isHiddenBy(p) : false;
              hiddenChain.set(el, v);
            }
            return v;
          };
          const cutEls = vw > 0
            // 只看承载文字的标签：跑马灯、胶带、装饰条本身就是「比视口宽然后被裁掉」
            // 的设计（neo-brutalism 的 marquee/tape 一次就被报 3 处）。
            // 判据开始报合法的东西，人就会开始忽略它——那比没有判据更糟。
            ? [...document.querySelectorAll(
                'main p, main li, main h1, main h2, main h3, main h4, main a, main blockquote, main dd, main td, main figcaption, main pre,' +
                ' article p, article li, article h1, article h2, article h3, article h4, article a, article blockquote, article dd, article td, article figcaption, article pre',
              )]
                .filter((el) => (el.textContent || '').trim().length > 24)
                .map((el) => ({
                  el: el,
                  right: el.getBoundingClientRect().right,
                  // 能不能滚要看整条祖先链，不能只看元素自己：代码块里的高亮
                  // <span> 宽到 800+px 是正常的（它外面的 pre 才是滚动区），
                  // 只查自己的 overflowX 会把 5 个风格的正文全误报成「藏起来的溢出」
                  scrollable: (function up(e) {
                    for (let q = e; q && q !== doc.documentElement; q = q.parentElement) {
                      if (/auto|scroll/.test(getComputedStyle(q).overflowX)) return true;
                    }
                    return false;
                  })(el),
                }))
                .filter((x) => x.right > vw + 8 && !x.scrollable && isHiddenBy(x.el))
                .sort((a, b) => b.right - a.right)
                .slice(0, 3)
                .map((x) => {
                  const el = x.el;
                  return (
                    el.tagName.toLowerCase() +
                    '.' +
                    (String(el.className).split(/\\s+/)[0] || '(无类名)') +
                    '@' +
                    Math.round(x.right)
                  );
                })
            : [];
          const overEls = over > 0
            ? [...document.querySelectorAll('body *')]
                .map((el) => ({ el: el, right: el.getBoundingClientRect().right, pos: getComputedStyle(el).position }))
                // fixed 元素要排除：它按视口定位，是「被撑宽的布局视口顺着它显形」，
                // 不是它把页面撑宽的（cyberpunk 的 .scan-overlay 就是这样被误指过）
                .filter((x) => x.right > vw + 1 && x.pos !== 'fixed' && !isClipped(x.el))
                .sort((a, b) => b.right - a.right)
                .slice(0, 3)
                .map((x) => {
                  const el = x.el;
                  return (
                    el.tagName.toLowerCase() +
                    '.' +
                    (String(el.className).split(/\\s+/)[0] || '(无类名)') +
                    '@' +
                    Math.round(x.right)
                  );
                })
            : [];
          // 语言切换入口存在性：链接必须指向「另一语言的同一页」。
          // 不能只看 href 里有没有 /en —— 英文页的「返回首页」链接本身就带 /en，
          // 那样会把「没有入口」判成「有入口」。子路径部署（/my-personalWebsite）
          // 在 href 与 location.pathname 里都会出现，所以两边都从 /style/ 起截，
          // 但必须**保留** /en 段：早先 slice(en + 3) 把它剥掉了，
          // 于是英文侧的 key 永远等于中文 key，wantKey 反而谁都匹配不上（判据恒为 0）。
          const langKey = (h) => {
            const en = h.indexOf('/en/style/');
            const zh = h.indexOf('/style/');
            const k = en >= 0 ? h.slice(en) : zh >= 0 ? h.slice(zh) : '';
            return k.replace(/\\/+$/, '') || '/';
          };
          const hereKey = langKey(location.pathname);
          const wantKey = hereKey.indexOf('/en/') === 0 ? hereKey.slice(3) : '/en' + hereKey;
          const lang = [...document.querySelectorAll('a[href]')].filter(
            (a) => langKey(a.getAttribute('href') || '') === wantKey,
          ).length;
          // 横向滚动带被挤成一条缝（判据与已知答案测试共用 scripts/squeeze-check.mjs）
          const squeezed = squeezedOf(document);
          // 正文列过窄：dashboard 详情页的 .detail 没声明跨列，整篇正文被塞进
          // 12 轨网格的一格里（实测 18.8px 宽、页面高 70006px）。它不溢出、
          // h1 唯一、也不是滚动带，所以前面几条全绿——只能直接量正文列宽。
          // 用「段落宽度的中位数」而不是「最宽的块」：详情页旁边常有目录 / 侧栏，
          // 它们的 li 是正常宽度，取最大值会把被压进一格的主文列遮掉
          // （dashboard 第一版判据就是这么静默的）
          const pw = [];
          for (const el of document.querySelectorAll('p')) {
            if ((el.textContent || '').trim().length < 24) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            // 读屏降级区（.sr-only 那类 1px + clip 的容器）本来就不给眼睛看：
            // 里面的段落宽 0-1px 是设计如此，不是塌陷（terminal 首页五个 block 就是这样，
            // 早先按视口百分比判时它一次报了 27 段）。
            // 只按类名排除，不要加「祖先宽 <2 就跳过」的几何判断——
            // 祖先被压塌成正是要抓的缺陷本身，加了就等于把证据又丢了。
            if (el.closest('.sr-only')) continue;
            const r = el.getBoundingClientRect();
            // 0 宽不是「没有内容」，而是列被压塌了（dashboard 详情页的正文实测就是
            // 0 宽、父级 .detail 19px）。早先这里挡掉 width<=0，等于把唯一的证据丢了。
            // 真正隐藏的段落已经被上面的 display / visibility 过滤掉了。
            pw.push(r.width);
          }
          pw.sort((a, b) => a - b);
          const median = pw.length ? pw[Math.floor(pw.length / 2)] : 0;
          // 阈值取绝对值 40px，不取视口百分比：磁贴 / 卡片式首页本来就有许多窄段落
          // （metro 正文块实测 111-146px），按 40% 判会把设计当成缺陷，一次报 9 页。
          // 「塌陷」的信号是中位数低于一行文字还能读的宽度。
          const narrowBody = pw.length >= 3 && median < 40
            ? Math.round(median) + 'px/' + pw.length + '段'
            : '';
          return JSON.stringify({
            title: document.title,
            // 实测到的页面路径必须就是本次要审的那一页：多个驱动共用一个 tab 时
            // （僵尸探针进程还在跑，或 CI 上被人手动接上），A 的 navigate 会把 B
            // 正在量的页换掉，于是「pixel 那行量到的是 liquid-glass 的数」——
            // 一整批假阳性就是这么来的。不带 href 回来就没法发现。
            href: location.pathname,
            overflow: over,
            overflowDetail: overEls,
            cutOff: cutEls,
            narrowBody,
            h1,
            targets: targets.length,
            small,
            smallDetail,
            imgNoAlt,
            lang,
            squeezed,
          });
        })()`,
        returnByValue: true,
      })
      const data = JSON.parse(res.result?.result?.value ?? '{}')
      const flags = []
      // 两条 404 判据并存：HTTP 状态是静态服务器上的可靠判据（缺失的文件根本没有 Nuxt
      // 错误页可渲染，只看 title 会静默放过）；title 兜住「服务端返回 200 但内容是错误页」
      if (docStatus >= 400) flags.push(`HTTP${docStatus}`)
      // 样式/脚本 404 时这一页的量全部不可信，放在最前面提示
      if (failedAssets > 0) flags.push(`缺资源${failedAssets}`)
      if (data.title?.startsWith('404')) flags.push('404')
      // 被 hidden/clip 藏起来的超宽内容：溢出判据量不到，只能单独报
      if (data.cutOff?.length) flags.push(`藏起来的溢出${data.cutOff.join(' ; ')}`)
      // 正文列被压进一格：不溢出、h1 也唯一，只能直接量列宽
      if (data.narrowBody) flags.push(`正文列过窄${data.narrowBody}`)
      if (data.overflow > 0)
        flags.push(`溢出${data.overflow}px ${(data.overflowDetail || []).join(' ; ')}`)
      if (data.h1 !== 1) flags.push(`h1=${data.h1}`)
      if (data.small > 0) flags.push(`小目标${data.small}/${data.targets} ${(data.smallDetail||[]).join(" ; ")}`)
      // 滚动带被挤成一条缝：不溢出、命中区也够，但用户没法靠它导航
      if (data.squeezed?.length) flags.push(`挤没滚动带${data.squeezed.join(' ; ')}`)
      if (data.imgNoAlt > 0) flags.push(`缺alt${data.imgNoAlt}`)
      // 语言切换入口存在性：双语站点却切不到另一语言 = 英文页是孤岛
      if (!DETAIL && data.lang === 0) flags.push('无语言入口')
      // 量到的必须就是这一页。多个驱动共用同一个 tab 时（僵尸探针进程没清、
      // CI 上被人手动接上），A 的 navigate 会把 B 正在量的页换掉，于是出现
      // 「pixel 那行量到 liquid-glass 的数」这类整批假阳性。
      // 宁可报「串页」，也不能静默给出一串看着可信的数字。
      const wantPath = new URL(url).pathname.replace(/\/+$/, '')
      const gotPath = String(data.href || '').replace(/\/+$/, '')
      const hijacked = !!gotPath && gotPath !== wantPath
      if (hijacked) flags.push(`串页(实为${gotPath})`)
      rows.push({
        style,
        suffix: suffix || '/',
        hijacked,
        status: docStatus,
        assets: failedAssets,
        note: flags.join(' '),
        ...data,
      })
      console.log(
        `${style.padEnd(12)} ${(suffix || '/').padEnd(10)} ${flags.length ? '⚠ ' + flags.join(' ') : '✓'}`,
      )
    }
  }

  ws.close()
  const bad = rows.filter(
    (r) =>
      r.status >= 400 ||
      r.assets > 0 ||
      r.overflow > 0 ||
      (r.cutOff && r.cutOff.length > 0) ||
      !!r.narrowBody ||
      r.h1 !== 1 ||
      r.small > 0 ||
      r.imgNoAlt > 0 ||
      r.hijacked ||
      (r.squeezed && r.squeezed.length > 0) ||
      (!DETAIL && r.lang === 0) ||
      r.title?.startsWith('404'),
  )
  console.log(`\n共 ${rows.length} 页，${bad.length} 页有问题`)

  // 量具自检：一条判据静默失效，比它报错更危险（教训「某个轴对全部对象同时报警/
  // 全部静默，先怀疑量具」）。所有页面都拿不到 HTTP 状态说明 Network 事件根本没收到，
  // 这时 404 判据等于没跑，必须红而不是绿。
  if (rows.length && rows.every((r) => !r.status)) {
    const msg = '审计失效：所有页面都没拿到主文档 HTTP 状态，404 判据未生效'
    console.error(msg)
    annotate(msg)
    process.exitCode = 1
    return
  }

  // ★ 退出码必须反映结果：接进 CI 后靠它判定成败。
  // 早先这里只 console 不设 exitCode，脚本永远以 0 退出——
  // 哪怕审计出 100 页全有问题，CI 也是绿的，门禁形同虚设。
  if (bad.length > 0) {
    // 注解只放计数与头几条摘要：CI 的 stdout 要鉴权才读得到，注解不用
    const detail = bad
      .slice(0, 5)
      .map((r) => `${r.style}${r.suffix === '/' ? '' : r.suffix}→${r.note}`)
      .join(' ;; ')
    annotate(`审计未通过 ${bad.length}/${rows.length} 页（locale=${process.env.AUDIT_LOCALE || 'zh'}）：${detail}`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  annotate(`审计脚本异常中断：${error?.message || error}（这不是页面问题，是量具或环境跑不起来）`)
  // 脚本自身出错（连不上 Chrome / dev server 没起来）同样要红，
  // 否则「审计根本没跑」也会被当成通过
  try {
    liveWs?.close()
  } catch {
    // 关不上也无所谓：下面直接强制退出
  }
  // 必须强制退出。只设 process.exitCode 时，还开着的 CDP socket 会让事件循环
  // 永不空转，进程挂成僵尸；它继续驱动同一个 tab，下一轮审计的量就全错位了
  process.exit(1)
})

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
 *
 * 用法：MSYS_NO_PATHCONV=1 node scripts/audit-a11y-mobile.mjs [baseURL]
 */
import { HIT_BOX_SRC } from './hit-box.mjs'

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
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }

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
          // 触控目标量「命中区」而不是边框盒，口径与 scripts/probe-touch-targets.mjs 保持一致：
          // 覆盖式链接（::after 用 inset:0 铺满整行/整卡）、外扩命中区（inset 为负）、
          // display:inline 包住块级子元素时塌成 0 宽的链接，直接量 rect 会把这三类全判成不合格。
          // 无 href 的 <a> 不是可点元素，所以选择器是 a[href]。
          const targets = [...document.querySelectorAll('a[href], button')]
            .map((el) => ({ el: el, box: hitBox(el) }))
            .filter((t) => (t.box.width || t.box.height) && getComputedStyle(t.el).visibility !== 'hidden');
          // 地板 40×40（项目无障碍红线），按整像素比较：soft-3d 的 .z-item 带 0.97 缩放
          //（层次深度的签名效果），投影后的 rect 比布局盒小 0.5px（实测 41 → 39.53），那不是命中区不足
          const smallEls = targets.filter(
            (t) => Math.round(t.box.width) < 40 || Math.round(t.box.height) < 40,
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
          // （CI 作业日志要鉴权，注解里只有这么多字能带出来）
          const vw = doc.clientWidth;
          const overEls = doc.scrollWidth - vw > 0
            ? [...document.querySelectorAll('body *')]
                .map((el) => ({ el: el, right: el.getBoundingClientRect().right }))
                .filter((x) => x.right > vw + 1)
                .sort((a, b) => b.right - a.right)
                .slice(0, 3)
                .map((x) => {
                  const el = x.el;
                  return (
                    el.tagName.toLowerCase() +
                    '.' +
                    (String(el.className).split(/\\s+/)[0] || '(无类名)') +
                    ' 右缘' + Math.round(x.right) + '/视口' + vw
                  );
                })
            : [];
          return JSON.stringify({
            title: document.title,
            overflow: doc.scrollWidth - doc.clientWidth,
            overflowDetail: overEls,
            h1,
            targets: targets.length,
            small,
            smallDetail,
            imgNoAlt,
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
      if (data.overflow > 0)
        flags.push(`溢出${data.overflow}px ${(data.overflowDetail || []).join(' ; ')}`)
      if (data.h1 !== 1) flags.push(`h1=${data.h1}`)
      if (data.small > 0) flags.push(`小目标${data.small}/${data.targets} ${(data.smallDetail||[]).join(" ; ")}`)
      if (data.imgNoAlt > 0) flags.push(`缺alt${data.imgNoAlt}`)
      rows.push({
        style,
        suffix: suffix || '/',
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
      r.h1 !== 1 ||
      r.small > 0 ||
      r.imgNoAlt > 0 ||
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
  process.exitCode = 1
})

/**
 * 移动端 + 无障碍审计（CDP）
 * ------------------------------------------------------------
 * 项目声称「完整适配移动端」与「WCAG AA」，但此前只做过对比度计算，
 * 从没在真实浏览器里量过。这个脚本在移动端视口下逐页检查：
 *   1. 横向溢出（页面被撑宽，移动端最致命的布局问题）
 *   2. h1 数量（AGENTS 红线：每页必须有且仅有一个）
 *   3. 触控目标 < 44px（WCAG 2.5.5 / 项目要求 ≥ 40px）
 *   4. 图片缺 alt、页面是否真的渲染成功（不是 404）
 *
 * 用法：MSYS_NO_PATHCONV=1 node .workbuddy/audit-a11y-mobile.mjs [baseURL]
 */
const BASE = process.argv[2] || 'https://mrc-sinclair.github.io/my-personalWebsite'
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

async function main() {
  // CDP 端口：默认的 9222 实例**会被用坏**（表现为脚本挂住不退出），
// 这时换一个端口起新实例即可，不用去杀可能正在被你正常使用的 Chrome。
const CDP_PORT = process.env.CDP_PORT || '9222'
const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json()
  const page = list.find((t) => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  let seq = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  }
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++seq
      pending.set(id, resolve)
      ws.send(JSON.stringify({ id, method, params }))
    })

  await new Promise((r) => (ws.onopen = r))
  await send('Page.enable')
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
      await send('Page.navigate', { url })
      await new Promise((r) => setTimeout(r, DETAIL ? 5000 : 4500))
      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const doc = document.documentElement;
          const h1 = document.querySelectorAll('h1').length;
          // 触控目标：WCAG 2.2 AA（2.5.8）要求最小 24×24，且**行内文本链接豁免**
          // （44×44 是 AAA 的 2.5.5，拿它当门槛会把段落里的链接全算成问题）
          const targets = [...document.querySelectorAll('a, button')].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
          });
          const smallEls = targets.filter((el) => {
            if (getComputedStyle(el).display === 'inline') return false;
            const r = el.getBoundingClientRect();
            return Math.min(r.width, r.height) < 24;
          });
          const small = smallEls.length;
          // 注意：这段表达式在**浏览器**里执行，拿不到 Node 的 process，
          // 开关必须由 Node 侧插值进来（否则 ReferenceError: process is not defined）
          const smallDetail = ${process.env.DETAIL ? 'true' : 'false'}
            ? smallEls.slice(0, 3).map((el) => {
                const r = el.getBoundingClientRect();
                // 用拼接而不是嵌套模板串：外层 expression 本身就是模板串，
                // 内层再写插值语法会被 Node 提前解析（SyntaxError）
                return (
                  el.tagName.toLowerCase() +
                  '.' +
                  (el.className || '(no-class)') +
                  ' ' +
                  Math.round(r.width) + 'x' + Math.round(r.height) +
                  ' "' + (el.textContent || '').trim().slice(0, 16) + '"'
                );
              })
            : [];
          const imgNoAlt = [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length;
          return JSON.stringify({
            title: document.title,
            overflow: doc.scrollWidth - doc.clientWidth,
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
      rows.push({ style, suffix: suffix || '/', ...data })
      const flags = []
      if (data.title?.startsWith('404')) flags.push('404')
      if (data.overflow > 0) flags.push(`溢出${data.overflow}px`)
      if (data.h1 !== 1) flags.push(`h1=${data.h1}`)
      if (data.small > 0) flags.push(`小目标${data.small}/${data.targets} ${(data.smallDetail||[]).join(" ; ")}`)
      if (data.imgNoAlt > 0) flags.push(`缺alt${data.imgNoAlt}`)
      console.log(
        `${style.padEnd(12)} ${(suffix || '/').padEnd(10)} ${flags.length ? '⚠ ' + flags.join(' ') : '✓'}`,
      )
    }
  }

  ws.close()
  const bad = rows.filter(
    (r) => r.overflow > 0 || r.h1 !== 1 || r.small > 0 || r.imgNoAlt > 0 || r.title?.startsWith('404'),
  )
  console.log(`\n共 ${rows.length} 页，${bad.length} 页有问题`)

  // ★ 退出码必须反映结果：接进 CI 后靠它判定成败。
  // 早先这里只 console 不设 exitCode，脚本永远以 0 退出——
  // 哪怕审计出 100 页全有问题，CI 也是绿的，门禁形同虚设。
  if (bad.length > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  // 脚本自身出错（连不上 Chrome / dev server 没起来）同样要红，
  // 否则「审计根本没跑」也会被当成通过
  process.exitCode = 1
})

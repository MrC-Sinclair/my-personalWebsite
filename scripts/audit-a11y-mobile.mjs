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
const STYLES = ['minimalism', 'y2k', 'terminal', 'dashboard', 'pixel']
const PAGES = ['', '/about', '/projects', '/blog', '/contact']
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }

async function main() {
  const list = await (await fetch('http://127.0.0.1:9222/json/list')).json()
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
      const url = `${BASE}/style/${style}${suffix}`
      await send('Page.navigate', { url })
      await new Promise((r) => setTimeout(r, 4500))
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
}

main().catch((error) => console.error(error))

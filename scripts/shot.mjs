/**
 * 临时截图脚本（CDP 直连）
 * ------------------------------------------------------------
 * 为什么不用 chrome --screenshot：
 *   - 它在 load 事件后立即截图，不等 hydration 与懒加载 CSS，
 *     截出来的页面缺少风格 token（背景全白）；
 *   - --virtual-time-budget 在本机环境会挂起（页面存在无限动画）。
 * 改用 CDP：连接到已启动的 headless Chrome，导航后显式等待若干秒，
 * 再按需索取截图，时机完全可控。
 */
import { writeFileSync, mkdirSync } from 'node:fs'

const PORT = Number(process.env.CDP_PORT || 9222)
// 验收截图默认打线上：dev server 长跑后 HMR 会脏，表现为截图一片空白而 innerText 是满的。
// 指向本地 prod 预览（node .output/server/index.mjs）时 SITE_BASE 必须带 /my-personalWebsite 前缀。
const BASE = process.env.SITE_BASE || 'https://122.51.97.106:8444'
// 输出目录按仓库相对路径，.gitignore 的 .shots-new 规则已排除
const OUT = process.env.SHOT_OUT || '.shots-new'
const WAIT_MS = Number(process.argv[2] || 6000)

// [路径, 输出文件名, 可选滚动锚点（用于截取不在首屏的区块）]
// 锚点也可写成 "y:<像素>"，直接滚到指定纵坐标（截玻璃板中段更可控）
// 可用 SHOT_PAGES='[["style/flat-design/about","a.png",null],...]' 覆盖，
// 这样给任意风格截图都不必再新建脚本。
const pages = process.env.SHOT_PAGES
  ? JSON.parse(process.env.SHOT_PAGES)
  : [
      ['styles', 'final-gallery.png', null],
      ['style/liquid-glass', 'final-lg.png', null],
      ['style/terminal', 'final-terminal.png', null],
    ]

mkdirSync(OUT, { recursive: true })

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
const target = list.find((t) => t.type === 'page')
if (!target) throw new Error('no page target found: ' + JSON.stringify(list))

const ws = new WebSocket(target.webSocketDebuggerUrl)
let seq = 0
const waiters = new Map()

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && waiters.has(msg.id)) {
    waiters.get(msg.id)(msg)
    waiters.delete(msg.id)
  }
})

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq
    waiters.set(id, (msg) =>
      msg.error ? reject(new Error(`${method}: ${JSON.stringify(msg.error)}`)) : resolve(msg.result),
    )
    ws.send(JSON.stringify({ id, method, params }))
  })

await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send('Page.enable')

// 可选视口覆盖：SHOT_VIEW="1440,2400"（默认用 Chrome 窗口自身大小）
if (process.env.SHOT_VIEW) {
  const [width, height] = process.env.SHOT_VIEW.split(',').map(Number)
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  })
}

for (const [path, file, anchor] of pages) {
  await send('Page.navigate', { url: `${BASE}/${path}` })
  await new Promise((r) => setTimeout(r, WAIT_MS))
  // Page.navigate 会恢复该 URL 上次的滚动位置，必须先回到顶部再截
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' })
  await new Promise((r) => setTimeout(r, 900))
  // 需要看非首屏区块时，滚到锚点再截（锚点有 scroll-margin-top，不会被固定头挡住）
  // 也支持 "y:数字" 形式：直接滚到指定纵坐标，用于截取超大板块的中段
  if (anchor && anchor.startsWith('y:')) {
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, ${Number(anchor.slice(2))})`,
    })
    await new Promise((r) => setTimeout(r, 1400))
  } else if (anchor) {
    await send('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(anchor)})?.scrollIntoView({ block: 'start' })`,
    })
    await new Promise((r) => setTimeout(r, 1400))
  }
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`${OUT}/${file}`, Buffer.from(data, 'base64'))
  console.log('saved', file)
}

ws.close()

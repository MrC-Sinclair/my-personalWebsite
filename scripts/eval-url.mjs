/**
 * 通用 CDP 求值脚本
 * ------------------------------------------------------------
 * 用法：
 *   MSYS_NO_PATHCONV=1 NO_PROXY=127.0.0.1,localhost \
 *     node scripts/eval-url.mjs <url> <js表达式> [等待毫秒]
 *
 * 例：读首屏某区块的文本（BASE 用 prod 预览时要带 /my-personalWebsite 前缀）
 *   node scripts/eval-url.mjs http://localhost:3005/my-personalWebsite/style/terminal \
 *     "document.querySelector('main')?.innerText?.slice(0,300)"
 *
 * CDP_PORT 默认 9222。截图看不出内容是否真的渲染时，读 DOM 更可靠。
 */
const URL_ = process.argv[2]
const EXPR = process.argv[3] || 'document.title'
const WAIT = Number(process.argv[4] || 9000)
const PORT = process.env.CDP_PORT || '9222'

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
const target = list.find((t) => t.type === 'page')
const ws = new WebSocket(target.webSocketDebuggerUrl)
let seq = 0
const pending = new Map()

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
})
await new Promise((r) => ws.addEventListener('open', r))

function send(method, params = {}) {
  const id = ++seq
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP 超时: ${method}`)), 40000)
    pending.set(id, (m) => {
      clearTimeout(timer)
      m.error ? reject(new Error(method + ': ' + JSON.stringify(m.error))) : resolve(m.result)
    })
  })
}

await send('Page.enable')
// 可选视口：PROBE_VIEW=1280,800（不设就用 Chrome 窗口自身大小）
if (process.env.PROBE_VIEW) {
  const [w, h] = process.env.PROBE_VIEW.split(',').map(Number)
  await send('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false,
  })
}
await send('Page.navigate', { url: URL_ })
await new Promise((r) => setTimeout(r, WAIT))

const res = await send('Runtime.evaluate', {
  expression: EXPR,
  returnByValue: true,
  awaitPromise: true,
})
if (res.exceptionDetails) {
  console.error('异常:', res.exceptionDetails.text, JSON.stringify(res.exceptionDetails.exception || {}))
  process.exitCode = 1
} else {
  const v = res.result.value
  console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 2))
}
ws.close()

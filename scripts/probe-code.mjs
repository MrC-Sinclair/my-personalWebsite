/**
 * @file 代码块语法高亮探针
 * @description 真浏览器读取 <pre class="shiki"> 内 token 的 computed color 与
 *              代码块实际背景色，并算 WCAG 对比度——用于验证「shiki 变量 →
 *              color」的接线是否生效、以及该风格取亮色还是暗色 token 才可读。
 *
 *              ⚠️ curl 拿不到 computed style，必须走 CDP。
 *
 * 用法：CDP_PORT=9224 node scripts/probe-code.mjs <styleId> [slug]
 * 例：node scripts/probe-code.mjs minimalism big-data-table-performance
 */

const styleId = process.argv[2] || 'minimalism'
const slug = process.argv[3] || 'big-data-table-performance'
const PORT = process.env.CDP_PORT || '9224'
const BASE = process.env.SITE_BASE || 'http://localhost:3000'

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
const target = list.find((t) => t.type === 'page')
if (!target) throw new Error(`922${PORT} 上没有 page 目标，Chrome 起了吗？`)
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
    waiters.set(id, (m) => (m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)))
    ws.send(JSON.stringify({ id, method, params }))
  })

await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
})
await send('Page.navigate', { url: `${BASE}/style/${styleId}/blog/${slug}` })
await new Promise((r) => setTimeout(r, 9000))

const expression = `(() => {
  const pre = document.querySelector('pre.shiki')
  if (!pre) return 'NO pre.shiki'
  // 只统计叶子 span：shiki 的结构是 <span class="line"><span class="sXxx">token</span></span>，
  // .line 容器本身没有颜色变量，它的 computed color 是继承来的正文色，算进来会假报低对比
  const spans = [...pre.querySelectorAll('span')].filter(
    (s) => s.textContent.trim() && !s.querySelector('span'),
  )
  const preBg = getComputedStyle(pre).backgroundColor
  const parse = (s) => {
    const m = s.match(/rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)/)
    return m ? [+m[1], +m[2], +m[3]] : null
  }
  const bg = parse(preBg)
  const lum = ([r, g, b]) => {
    const f = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const ratio = (fg) => {
    const a = lum(fg) + 0.05, b = lum(bg) + 0.05
    return a > b ? a / b : b / a
  }
  const colors = new Map()
  for (const s of spans) {
    const c = getComputedStyle(s).color
    if (!colors.has(c)) colors.set(c, { sample: s.textContent.trim().slice(0, 14), n: 0 })
    colors.get(c).n++
  }
  const rows = [...colors].map(([color, info]) => {
    const rgb = parse(color)
    return { color, sample: info.sample, n: info.n, contrast: rgb ? +ratio(rgb).toFixed(2) : null }
  }).sort((a, b) => (a.contrast ?? 0) - (b.contrast ?? 0))
  return JSON.stringify({ style: ${JSON.stringify(styleId)}, preBg, tokens: rows.length, rows }, null, 1)
})()`

const { result } = await send('Runtime.evaluate', { expression, returnByValue: true })
console.log(result.value)
ws.close()

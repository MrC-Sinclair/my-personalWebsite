/**
 * 生成 20 张风格预览图（public/previews/<id>.jpg）
 * ------------------------------------------------------------
 * 画廊页（/）靠它给每张风格卡配一张真实首页缩略图——registry 的 preview
 * 字段早先 20 条全是空串，"卖风格"的页面自己最朴素（见审美评审报告）。
 *
 * 为什么用真浏览器截图而不是画 SVG：preview 的语义是「这个风格长什么样」，
 * 只有真实渲染能体现（像素点阵、玻璃折射、皮革木纹都画不出来）。
 *
 * 前提（与 shot.mjs 同款流程）：
 *   1. dev server 已启动（默认 http://localhost:3000/my-personalWebsite）
 *   2. headless Chrome 已带 --remote-debugging-port=9222 启动
 * 用法：
 *   NO_PROXY=127.0.0.1,localhost node scripts/gen-style-previews.mjs
 * 可选：SITE_BASE / CDP_PORT / SHOT_VIEW（默认 1200,750）
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const PORT = Number(process.env.CDP_PORT || 9222)
const BASE = process.env.SITE_BASE || 'http://localhost:3000/my-personalWebsite'
const [W, H] = (process.env.SHOT_VIEW || '1200,750').split(',').map(Number)
const QUALITY = Number(process.env.SHOT_QUALITY || 82)

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, 'public', 'previews')

/** 从 registry.ts 解析风格 id——不硬编码，新增风格自动跟上 */
function readStyleIds() {
  const src = readFileSync(join(root, 'styles', 'registry.ts'), 'utf8')
  return [...src.matchAll(/^\s{4}id:\s*'([^']+)'/gm)].map((m) => m[1])
}

const ids = readStyleIds()
if (!ids.length) throw new Error('registry.ts 里没解析到任何风格 id')
mkdirSync(outDir, { recursive: true })

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
const target = list.find((t) => t.type === 'page')
if (!target) throw new Error('no page target found: 先启动带 --remote-debugging-port 的 Chrome')

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: W,
  height: H,
  deviceScaleFactor: 1,
  mobile: false,
})

for (const id of ids) {
  await send('Page.navigate', { url: `${BASE}/style/${id}` })
  await sleep(8000)
  // Page.navigate 会恢复上次滚动位置，先回顶部再截
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' })
  await sleep(900)
  const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: QUALITY })
  const file = join(outDir, `${id}.jpg`)
  writeFileSync(file, Buffer.from(data, 'base64'))
  console.log('saved', `${id}.jpg`)
}

console.log(`\n${ids.length} 张预览图已写入 public/previews/`)
ws.close()

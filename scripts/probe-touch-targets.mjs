/**
 * 触控目标归因（CDP）
 * ------------------------------------------------------------
 * 「有几个目标小于 40px」这个数字没法直接指导修改 —— 整行宽 421px 但只有 16px 高的
 * 文章标题链接，和 35px 高的筛选 chip，是两种完全不同的问题。
 * 这里把 40 页里所有不合格元素按 `标签.类名 + 尺寸档` 聚合，看清到底是哪几类。
 *
 * 用法：
 *   MSYS_NO_PATHCONV=1 NO_PROXY=127.0.0.1,localhost CDP_PORT=9235 \
 *     node scripts/probe-touch-targets.mjs [baseURL]
 */
import { HIT_BOX_SRC } from './hit-box.mjs'

const BASE = process.argv[2] || 'https://122.51.97.106:8444'
const PORT = process.env.CDP_PORT || '9235'
const WAIT = Number(process.env.PROBE_WAIT || 4000)
const VIEW = (process.env.PROBE_VIEW || '390,844').split(',').map(Number)
const PAGES = (process.env.PROBE_PAGES || 'blog,projects').split(',')

const STYLES = [
  'minimalism', 'swiss', 'editorial', 'terminal', 'pixel', 'metro', 'cyberpunk', 'y2k',
  'glassmorphism', 'liquid-glass', 'claymorphism', 'neumorphism', 'soft-3d', 'skeuomorphism',
  'neo-brutalism', 'flat-design', 'retro-computer', 'dashboard', 'sci-fi-hud', 'web2-glossy',
]

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
const target = list.find((t) => t.type === 'page')
const ws = new WebSocket(target.webSocketDebuggerUrl)
let seq = 0
const pending = new Map()
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
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

const EXPR = `(() => {
  const out = [];
  ${HIT_BOX_SRC}
  for (const el of document.querySelectorAll('a[href], button')) {
    const b = hitBox(el);
    if (!b.width && !b.height) continue;
    // 按整像素比较：soft-3d 的 .z-item 有 0.97 缩放（层次深度的签名效果），
    // 投影后的 rect 会比布局盒小 0.5px 左右（实测 41 → 39.53），那不是命中区不足
    if (Math.round(b.height) >= 40 && Math.round(b.width) >= 40) continue;
    const cls = String(el.className).split(/\\s+/)[0] || '(无类名)';
    out.push({
      sig: el.tagName.toLowerCase() + '.' + cls,
      w: Math.round(b.width),
      h: Math.round(b.height),
      // 整行宽的链接与真正的小按钮要分开看
      kind: b.width > 200 ? '窄高(整行文本链接)' : b.height > 30 ? '窄宽' : '小方块',
    });
  }
  return JSON.stringify(out);
})()`

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: VIEW[0],
  height: VIEW[1],
  deviceScaleFactor: 1,
  mobile: true,
})

/** sig+kind → { 出现次数, 页集合, 尺寸样本 } */
const agg = new Map()
for (const s of STYLES) {
  for (const page of PAGES) {
    await send('Page.navigate', { url: `${BASE}/style/${s}/${page}/` })
    await new Promise((r) => setTimeout(r, WAIT))
    const { result } = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true })
    for (const it of JSON.parse(result.value)) {
      const key = `${it.kind} | ${it.sig}`
      const cur = agg.get(key) || { kind: it.kind, sig: it.sig, n: 0, pages: new Set(), sizes: new Set() }
      cur.n++
      cur.pages.add(`${s}/${page}`)
      cur.sizes.add(`${it.w}x${it.h}`)
      agg.set(key, cur)
    }
  }
}

const rows = [...agg.values()].sort((a, b) => b.n - a.n)
console.log(`视口 ${VIEW[0]}×${VIEW[1]}｜不合格目标共 ${rows.reduce((s, r) => s + r.n, 0)} 个，聚成 ${rows.length} 类：\n`)
for (const r of rows.slice(0, 22)) {
  const where = process.env.PROBE_DETAIL ? '  ' + [...r.pages].join(' ') : ''
  console.log(
    `${String(r.n).padStart(4)}  ${r.kind.padEnd(22)} ${r.sig.padEnd(26)} 尺寸=${[...r.sizes].slice(0, 3).join(' ')}  页=${r.pages.size}${where}`,
  )
}
ws.close()

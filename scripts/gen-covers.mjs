/**
 * 生成内容封面图（public/images/covers/<slug>.jpg）
 * ------------------------------------------------------------
 * 为什么需要它：6 个项目 + 14 篇博客此前**一张配图都没有**，卡片与详情页
 * 的视觉重量全靠 CSS 渐变和边框硬撑——这是「显得像模板」的第一来源。
 *
 * ★ 封面一律只出抽象图形，**不渲染任何文字**（2026-10-19 定）：早期版本在图上画了
 *   标题，结果卡片正文又渲染一次标题 → 全站标题重复；且 layoutSplit 的深色字压在
 *   深色斜切块上几乎不可读。文字信息交给卡片自己，图只负责质感与色彩重量。
 *
 * 为什么用浏览器截图而不是画 SVG 或引图片库：
 *   1. 项目里没有 sharp / canvas 依赖（win32 上 sharp 二进制还缺），不引入新依赖；
 *   2. 与 scripts/gen-style-previews.mjs 同一套做法——真浏览器渲染，
 *      渐变 / 描边 / 变换的还原度比 SVG 手绘稳。
 *
 * 用法（需先起 headless Chrome）：
 *   CDP_PORT=9222 node scripts/gen-covers.mjs            # 全量
 *   ONLY=personal-website,my-chat node scripts/gen-covers.mjs   # 只出样张
 * 可选：COVER_OUT（输出目录，默认 public/images/covers）
 */
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, basename } from 'node:path'

const PORT = Number(process.env.CDP_PORT || 9222)
const W = 1200
const H = 675
const QUALITY = Number(process.env.SHOT_QUALITY || 84)

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = process.env.COVER_OUT || join(root, 'public', 'images', 'covers')

/** 只生成指定 slug（逗号分隔），用于先出样张确认质感 */
const only = process.env.ONLY ? process.env.ONLY.split(',').map((s) => s.trim()) : null

/* ============ 素材：从 content 的 frontmatter 读真实内容 ============ */

/** 极简 frontmatter 解析（只取需要的字段，不引 yaml 依赖） */
function parseFrontmatter(md) {
  // Windows 工作区是 CRLF 行尾：不先归一成 LF，/^---\n/ 永远匹配不上，
  // title 解析失败会静默回落到 slug 当标题（样张阶段实测踩到）
  const m = /^---\n([\s\S]*?)\n---/.exec(md.replace(/\r\n/g, '\n'))
  if (!m) return {}
  const out = {}
  for (const line of m[1].split('\n')) {
    const kv = /^([A-Za-z]+):\s*(.*)$/.exec(line.trim())
    if (kv) out[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '')
  }
  return out
}

/** 收集内容条目（slug + 标题 + 类别/标签 + 语种） */
function collect() {
  const items = []
  for (const kind of ['projects', 'blog']) {
    const dir = join(root, 'content', kind, 'zh')
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md')) continue
      const fm = parseFrontmatter(readFileSync(join(dir, file), 'utf8'))
      items.push({
        slug: basename(file, '.md'),
        title: fm.title || basename(file, '.md'),
        category: fm.category || '',
        kind,
      })
    }
  }
  return items
}

/* ============ 视觉：克制的四套版式 + 低饱和色板 ============ */

/*
 * 配色刻意避开霓虹与高饱和渐变（那正是「廉价感」的来源）：
 * 每个色板 = 主色（深）+ 强调色（低饱和）+ 纸色，取用按 slug 哈希稳定分配。
 */
const PALETTES = [
  { ink: '#16233A', accent: '#C66B4A', paper: '#F2EEE7' },
  { ink: '#2B2B2B', accent: '#7C9082', paper: '#F4F1EC' },
  { ink: '#1D2F28', accent: '#C9A227', paper: '#F1EFE9' },
  { ink: '#231B2E', accent: '#8E7CC3', paper: '#F3F0F2' },
  { ink: '#2A2118', accent: '#A8763E', paper: '#F5F1EA' },
  { ink: '#132A33', accent: '#4E8A9B', paper: '#EFF2F3' },
]

/** 稳定哈希：同一篇内容每次生成拿到同一套色与版式 */
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

/** 版式 1：深色底 + 偏心细环（最有克制感的一套） */
function layoutRing(p) {
  return `
  <div class="cv" style="background:${p.ink}">
    <svg class="deco" viewBox="0 0 1200 675" aria-hidden="true">
      <circle cx="880" cy="300" r="330" fill="none" stroke="${p.paper}" stroke-width="1.5" opacity="0.14"/>
      <circle cx="880" cy="300" r="230" fill="none" stroke="${p.accent}" stroke-width="4" opacity="1"/>
      <circle cx="880" cy="300" r="150" fill="none" stroke="${p.paper}" stroke-width="1.5" opacity="0.26"/>
      <circle cx="880" cy="300" r="60" fill="${p.accent}" opacity="1"/>
    </svg>
  </div>`
}

/** 版式 2：纸底 + 细网格 + 描边方块（editorial 气质） */
function layoutPaper(p) {
  return `
  <div class="cv" style="background:${p.paper}">
    <div class="grid" style="background-image:linear-gradient(${p.ink}0d 1px,transparent 1px),linear-gradient(90deg,${p.ink}0d 1px,transparent 1px)"></div>
    <div class="block" style="border-color:${p.accent}"></div>
    <div class="rule" style="background:${p.accent}"></div>
  </div>`
}

/** 版式 3：色块斜切分割 */
function layoutSplit(p) {
  return `
  <div class="cv" style="background:${p.paper}">
    <div class="wedge" style="background:${p.ink}"></div>
    <div class="pip" style="background:${p.accent}"></div>
  </div>`
}

/** 版式 4：同心弧线从右下扩散 */
function layoutArc(p) {
  // 缩略图（卡片里约 400px 宽）下 1px 细线会整圈消失，线宽与透明度按「小图也看得见」定，
  // 再加一个实心圆心给画面一个明确焦点——否则深底版式在小卡片里就是一块纯黑。
  const arcs = [180, 300, 420, 540, 660]
    .map(
      (r, i) =>
        `<circle cx="1120" cy="620" r="${r}" fill="none" stroke="${p.accent}" stroke-width="4" opacity="${0.78 - i * 0.12}"/>`,
    )
    .join('')
  return `
  <div class="cv" style="background:${p.ink}">
    <svg class="deco" viewBox="0 0 1200 675" aria-hidden="true">${arcs}<circle cx="1120" cy="620" r="120" fill="${p.accent}" opacity="0.95"/></svg>
  </div>`
}

const LAYOUTS = [layoutRing, layoutPaper, layoutSplit, layoutArc]

function buildHtml(item) {
  const h = hash(item.slug)
  const p = PALETTES[h % PALETTES.length]
  // 必须无符号右移：hash 可能超过 2^31，有符号的 >> 会移位出负数，
  // 负数取模得到负索引 → LAYOUTS[-1] 是 undefined（实测报 layout is not a function）
  const layout = LAYOUTS[(h >>> 3) % LAYOUTS.length]
  return `<!DOCTYPE html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden}
.cv{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.deco{position:absolute;inset:0;width:100%;height:100%}
.grid{position:absolute;inset:0;background-size:60px 60px;opacity:.9}
.wedge{position:absolute;top:-120px;right:-160px;width:760px;height:900px;transform:rotate(16deg);opacity:.95}
.block{position:absolute;top:56px;right:64px;width:132px;height:132px;border:1.5px solid;opacity:.75}
.pip{position:absolute;left:64px;top:56px;width:88px;height:8px;border-radius:4px}
.rule{position:absolute;left:64px;bottom:64px;width:200px;height:3px}
</style>${layout(p)}`
}

/* ============ CDP 截图 ============ */

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
const target = list.find((t) => t.type === 'page')
if (!target) throw new Error('no page target: ' + JSON.stringify(list))

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
    waiters.set(id, (m) =>
      m.error ? reject(new Error(`${method}: ${JSON.stringify(m.error)}`)) : resolve(m.result),
    )
    ws.send(JSON.stringify({ id, method, params }))
  })
await new Promise((r) => ws.addEventListener('open', r, { once: true }))
await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: W,
  height: H,
  deviceScaleFactor: 1,
  mobile: false,
})

const items = collect().filter((i) => !only || only.includes(i.slug))
mkdirSync(outDir, { recursive: true })

const tmpHtml = join(root, '.workbuddy', 'cover-template.html')
for (const item of items) {
  writeFileSync(tmpHtml, buildHtml(item))
  await send('Page.navigate', { url: `file:///${tmpHtml.replace(/\\/g, '/')}` })
  await new Promise((r) => setTimeout(r, 700))
  const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: QUALITY })
  writeFileSync(join(outDir, `${item.slug}.jpg`), Buffer.from(data, 'base64'))
  console.log('saved', item.slug + '.jpg')
}
ws.close()
console.log(`\n共 ${items.length} 张 → ${outDir}`)

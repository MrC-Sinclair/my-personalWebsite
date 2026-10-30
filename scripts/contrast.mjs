/**
 * contrast.mjs —— 各风格的文字对比度检查（WCAG 2.1 AA）
 * ------------------------------------------------------------
 * 2026-10-29 重写。旧版拿 tokens.css 的 --c-text/--c-muted 强行去配
 * --c-bg/--c-surface，有两个系统性缺陷：
 *
 *   ① 误报：skeuomorphism 的 --c-text（#2e1c0d）是给米白纸面用的墨色，
 *      --c-bg（#2b1a0f）是深棕木桌底，两者从不同框出现，却被算出 1.02 判 FAIL；
 *      retro-computer 同理——muted 实际压在 95 窗口灰 #c0c0c0 上（6.94:1，达标），
 *      脚本却拿它配桌面青绿 #008080 报 2.65。按这种结论去改颜色会毁掉正确的设计。
 *   ② 漏报：只看 token，看不见组件内部的色对。skeuomorphism 标签 hover 的
 *      金铜字压米白纸面 = 2.63:1，是真实缺陷，旧版完全报不出来。
 *
 * 新版判定口径：**按文字实际所在的表面配对**。
 *   解析每个「选择器族」（.plate 与 .plate:hover 视为同一族，因为 hover 只换
 *   前景不换底）里的 color 与 background，两者都确定时才判定；背景不确定
 *   （transparent / 只写渐变无纯色 / 纯继承父级）的一律记为「未定」，不硬凑配对。
 *   宁可少报，也不制造假 FAIL——这是旧版最大的代价。
 *
 * 用法：
 *   node scripts/contrast.mjs                     静态解析（默认，CI 可直接跑）
 *   node scripts/contrast.mjs --live <baseURL>     连已启动的 headless Chrome 量真实渲染
 *                                                  （CDP_PORT，默认 9222）
 *   --live 是兜底手段：静态解析看不到继承来的背景与纹理叠加，真实渲染能看见。
 *   两者各有盲区——静态覆盖全部 CSS 规则但看不到层叠结果，--live 只量各风格首页
 *   的首屏（不滚动、不进子页）。结论冲突时以 --live 为准，但 --live 说 OK 不等于
 *   子页也 OK。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const stylesDir = fileURLToPath(new URL('../styles/', import.meta.url))
const ids = readdirSync(stylesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name)
  .sort()

/* ---------------- 色彩工具 ---------------- */

const chan = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
const lum = ([r, g, b]) => 0.2126 * chan(r / 255) + 0.7152 * chan(g / 255) + 0.0722 * chan(b / 255)
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}
const fmt = (c) => '#' + c.map((n) => n.toString(16).padStart(2, '0')).join('')

function hexToRgb(h) {
  let s = h.replace('#', '')
  if (s.length === 3) s = [...s].map((c) => c + c).join('')
  if (s.length === 8) s = s.slice(0, 6) // 忽略 alpha：token 里基本不用 8 位
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16))
}

/** 从一个声明值里收集所有可解析的颜色（var / hex / rgb），保留 alpha */
function collectColors(value, tokens) {
  const out = []
  // ★ 必须支持 var(--x, fallback)：写成 `var(--c-on-accent, #fff)` 时若只认变量名，
  //   正则匹配不上就会漏掉变量、错把 fallback 的 #fff 当成实际颜色——
  //   neo-brutalism 的 .chip--cat 是「黑字压黄」(15:1)，却因此被判成 1.27 的假 FAIL。
  for (const m of value.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]*))?\)/gi)) {
    const t = tokens[m[1]]
    if (Array.isArray(t)) {
      out.push({ rgb: t, a: 1 })
      continue
    }
    const fb = (m[2] || '').trim()
    const fh = fb.match(/^#[0-9a-fA-F]{3,8}$/)
    if (fh) out.push({ rgb: hexToRgb(fh[0]), a: 1 })
    const fr = fb.match(/^rgba?\(([^)]+)\)$/i)
    if (fr) {
      const p = fr[1].split(/[,\s/]+/).filter(Boolean).map(Number)
      if (p.length >= 3 && !Number.isNaN(p[0])) out.push({ rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 })
    }
  }
  for (const m of value.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const h = m[0]
    const a = h.length === 9 ? parseInt(h.slice(7, 9), 16) / 255 : h.length === 5 ? parseInt(h.slice(4, 5).repeat(2), 16) / 255 : 1
    out.push({ rgb: hexToRgb(h), a })
  }
  for (const m of value.matchAll(/rgba?\(([^)]+)\)/gi)) {
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    if (p.length >= 3 && !Number.isNaN(p[0])) out.push({ rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 })
  }
  return out
}

const avg = (list) => [0, 1, 2].map((i) => Math.round(list.reduce((s, c) => s + c[i], 0) / list.length))

/** 按顶层逗号拆分（括号内的逗号不算），用于分离 background 的多个图层 */
function splitTopLevel(v) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of v) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out.map((s) => s.trim()).filter(Boolean)
}

/**
 * 把一个声明值解析成单一 rgb；解析不出返回 null。
 * ★ alpha < 0.9 一律视为「不确定」直接放弃——`rgb(255 255 255 / 0.06)` 这类半透明
 *   覆盖层在暗色风格里遍地都是，把它当纯白底色会算出 1.10 这种天方夜谭的 FAIL。
 *   宁可漏报也不制造这种假象，漏掉的部分交给 --live 用真实像素补。
 */
function parseColor(value, tokens) {
  if (!value) return null
  const v = value.trim()
  if (/^(transparent|none|inherit|currentcolor|initial|unset)$/i.test(v)) return null
  // ★ 多背景层：CSS 里先写的在上层，文字真正压的是**最底下那层**。
  //   ——但要注意 CSS 里**先写的在上层**，所以是从上往下找第一个「实色层」：
  //   terminal 的上层是 7% 透明度的渐变，跳过它才是真正的 #05080a；
  //   y2k 的 .head-badge 用 padding-box/border-box 双层，上层才是内容底
  //   （深紫 #171048→#221a66，文字约 7:1），取最底层反而会拿到彩色边框渐变。
  const layers = splitTopLevel(v)
  if (layers.length > 1) {
    for (const layer of layers) {
      // 半透明覆盖层（与 transparent 混合的 color-mix / 纯渐变高光）不算文字压的底
      if (/color-mix/i.test(layer) && /transparent/i.test(layer)) continue
      const c = parseColor(layer, tokens)
      if (c) return c
    }
  }
  // color-mix(in srgb, A p%, B)：必须真的做加权混合，不能取第一个色了事——
  // `.lang-pill:hover` 的 background 是「accent 8% + surface 92%」，当纯 accent
  // 算就会得出「紫字压紫底 1.00」这种假 FAIL；而它实际接近 surface，是达标的。
  // 与 transparent 混合的则是半透明覆盖层，压在未知底色上，静态无从判定 → 放弃。
  const cm = v.match(/color-mix\(\s*in\s+[\w-]+\s*,\s*(.*?)\s*\)$/i)
  if (cm) {
    const inner = cm[1]
    if (/transparent/i.test(inner)) return null
    const cols = collectColors(inner, tokens)
    const pct = inner.match(/([\d.]+)%/)
    const p = pct ? parseFloat(pct[1]) / 100 : 0.5
    if (cols.length >= 2) {
      const [a, b] = cols
      return { rgb: [0, 1, 2].map((i) => Math.round(a.rgb[i] * p + b.rgb[i] * (1 - p))), grad: false }
    }
  }
  const solid = collectColors(v, tokens).filter((c) => c.a >= 0.9)
  if (!solid.length) return null
  const isGrad = /gradient/i.test(v)
  // 渐变：取所有色标均值作为「这块底大概多亮」的估计，并标记出来供复核
  return { rgb: isGrad ? avg(solid.map((c) => c.rgb)) : solid[0].rgb, grad: isGrad }
}

/* ---------------- CSS 解析 ---------------- */

/** 提取所有 选择器{声明} 规则，@media/@supports 内部递归展开 */
function extractRules(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const out = []
  let i = 0
  while (i < clean.length) {
    const open = clean.indexOf('{', i)
    if (open < 0) break
    const sel = clean.slice(i, open).trim()
    let depth = 0
    let j = open
    for (; j < clean.length; j++) {
      if (clean[j] === '{') depth++
      else if (clean[j] === '}') {
        depth--
        if (depth === 0) break
      }
    }
    const body = clean.slice(open + 1, j)
    if (sel.startsWith('@') || !sel) out.push(...extractRules(body))
    else out.push({ sel, body })
    i = j + 1
  }
  return out
}

/** 选择器族：去掉伪类/伪元素，.plate:hover 与 .plate 归为一族 */
const baseSelector = (sel) =>
  sel
    .replace(/::?[a-z-]+(\([^)]*\))?/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

function decl(body, prop) {
  const m = body.match(new RegExp(`(?:^|[;\\n])\\s*${prop}\\s*:\\s*([^;]+)`, 'i'))
  return m ? m[1].trim() : null
}

/* ---------------- 收集每个风格的样式源 ---------------- */

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(vue|css)$/.test(e)) out.push(p)
  }
  return out
}

function styleSources(id) {
  const out = []
  for (const f of walk(join(stylesDir, id))) {
    const src = readFileSync(f, 'utf8')
    if (f.endsWith('.css')) {
      out.push({ file: f, css: src })
      continue
    }
    for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) out.push({ file: f, css: m[1] })
  }
  return out
}

/** tokens.css：所有 --c-* 颜色与 --fs-* 字号 */
function parseTokens(id) {
  const file = join(stylesDir, id, 'tokens.css')
  const tokens = {}
  try {
    const css = readFileSync(file, 'utf8')
    for (const [, k, v] of css.matchAll(/(--c-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) tokens[k] = hexToRgb(v)
    for (const [, k, v] of css.matchAll(/(--fs-[a-z-]+)\s*:\s*([\d.]+)px/g)) tokens[k] = parseFloat(v)
  } catch {
    // tokens.css 缺失或读失败：该风格只能靠硬编码色值判定，不致命
  }
  return tokens
}

/* ---------------- 静态判定 ---------------- */

function analyseStyle(id) {
  const tokens = parseTokens(id)
  const rules = []
  for (const { file, css } of styleSources(id)) {
    for (const { sel, body } of extractRules(css)) {
      for (const one of sel.split(',')) {
        const base = baseSelector(one)
        if (!base) continue
        const fg = parseColor(decl(body, 'color'), tokens)
        const bgRaw = decl(body, 'background') || decl(body, 'background-color')
        const bg = parseColor(bgRaw, tokens)
        if (!fg && !bg) continue
        let size
        const fs = decl(body, 'font-size')
        if (fs) {
          const vm = fs.match(/var\(\s*(--fs-[a-z-]+)\s*\)/)
          let px = vm ? tokens[vm[1]] : NaN
          if (typeof px !== 'number' || Number.isNaN(px)) {
            const n = parseFloat(fs)
            // ★ rem 必须换算成 px：1.125rem 是 18px（够大字号门槛），
            //   直接 parseFloat 会得到 1.125，判成「远小于 14px」而按 4.5:1 卡
            px = /rem\b/i.test(fs) ? n * 16 : n
          }
          if (typeof px === 'number' && !Number.isNaN(px)) size = px
        }
        const fw = decl(body, 'font-weight')
        rules.push({
          base,
          pseudo: /::?[a-z-]+(\([^)]*\))?/i.test(one),
          fg,
          bg,
          // 这条规则自己写了 background 但解析不出实色（半透明覆盖层 / 纯渐变）：
          // 不能回落到同族的别的底——它明确声明的是「盖一层」，底下是什么静态无从得知
          hasBg: Boolean(bgRaw),
          size,
          weight: fw ? parseInt(fw, 10) || 0 : undefined,
          file,
          sel: one.trim(),
        })
      }
    }
  }

  // 每个选择器族的「基础底 / 基础字号」取该族非伪类规则里的第一条。
  // hover 通常只换前景不换底，所以 .plate:hover 的 color 要配 .plate 的 background——
  // 这正是旧版完全看不见、而真实发生过缺陷的地方（金铜字压米白纸面 2.63:1）。
  // ★ 绝不能把一族里的前景与背景做笛卡尔积：那会凭空造出「hover 前景 × 别的背景」
  //   这类根本不存在的组合，是上一版（1.00 FAIL 遍地）的教训。
  // ★ 族的作用域必须是「同一文件」：`.count` 在 Search 里是压在页面底的小字，
  //   在 SectionHead 里却是压在 accent 小球上的徽章数字——跨文件合并会凭空配出
  //   「muted 压 accent = 1.07」这种根本不存在的 FAIL。
  const famKey = (r) => `${r.file}||${r.base}`
  const baseBg = new Map()
  const hoverBg = new Map()
  const baseSize = new Map()
  const baseWeight = new Map()
  for (const r of rules) {
    // ★ hover 态要优先回落到「同是 hover 的兄弟规则」的底：`.input:hover` 换了黄底，
    //   而 `.input:hover::placeholder` 只有 color，若回落到 `.input` 的常态底
    //   就会配出「深字压深蓝」这种 hover 时根本不存在的组合。
    if (r.pseudo) {
      if (r.bg && /:hover/i.test(r.sel) && !hoverBg.has(famKey(r))) hoverBg.set(famKey(r), r.bg)
      continue
    }
    if (r.bg && !baseBg.has(famKey(r))) baseBg.set(famKey(r), r.bg)
    if (r.size && !baseSize.has(famKey(r))) baseSize.set(famKey(r), r.size)
    if (r.weight && !baseWeight.has(famKey(r))) baseWeight.set(famKey(r), r.weight)
  }

  const seen = new Map()
  let unresolved = 0
  for (const r of rules) {
    if (!r.fg) continue
    const hovered = /:hover/i.test(r.sel)
    const fallback = hovered ? hoverBg.get(famKey(r)) || baseBg.get(famKey(r)) : baseBg.get(famKey(r))
    const bg = r.bg || (r.hasBg ? null : fallback)
    if (!bg) {
      unresolved++
      continue
    }
    const size = r.size ?? baseSize.get(famKey(r)) ?? 16
    const weight = r.weight ?? baseWeight.get(famKey(r)) ?? 400
    const need = size >= 18 || (size >= 14 && weight >= 700) ? 3 : 4.5
    const val = ratio(r.fg.rgb, bg.rgb)
    const key = `${r.sel}|${fmt(r.fg.rgb)}|${fmt(bg.rgb)}`
    const cur = seen.get(key)
    if (cur && cur.r <= val) continue // 同一组合只留最差的一条
    seen.set(key, { sel: r.sel, fg: r.fg.rgb, bg: bg.rgb, grad: bg.grad, need, r: val, file: r.file })
  }
  return { pairs: [...seen.values()], unresolved }
}

/* ---------------- 真实渲染判定（--live） ---------------- */

async function liveContrast(baseURL, port) {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const target = list.find((t) => t.type === 'page' && t.url !== 'about:blank') || list.find((t) => t.type === 'page')
  if (!target) throw new Error(`CDP 端口 ${port} 上没有可用的 page target`)
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
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq
      const timer = setTimeout(() => reject(new Error('CDP 超时: ' + method)), 40000)
      pending.set(id, (m) => {
        clearTimeout(timer)
        m.error ? reject(new Error(method + ': ' + JSON.stringify(m.error))) : resolve(m.result)
      })
      ws.send(JSON.stringify({ id, method, params }))
    })

  await send('Page.enable')
  const rows = []
  let unresolvedLive = 0
  for (const id of ids) {
    await send('Page.navigate', { url: `${baseURL}/style/${id}` })
    await new Promise((r) => setTimeout(r, 3500))
    // headless 下 IntersectionObserver 不回调，先落到终态再量，否则量到 opacity:0 的元素
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.scroll-reveal').forEach(e=>e.classList.add('revealed'))`,
    })
    await new Promise((r) => setTimeout(r, 600))
    const res = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const out = []
        const styleId = ${JSON.stringify(id)}
        for (const e of document.querySelectorAll('body *')) {
          const own = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ')
          if (!own) continue
          // 只量真正能被看见的文字：屏幕阅读器专用文本、display:none 子树、
          // 以及 ★ ✦ ↗ 这类纯装饰符号都不该计入
          if (/^[\\s★✦☆↗·|/>─━═_-]+$/.test(own)) continue
          if (e.closest('.sr-only')) continue
          const r = e.getBoundingClientRect()
          if (r.width < 2 || r.height < 2) continue
          const cs = getComputedStyle(e)
          if (!e.offsetParent && cs.position !== 'fixed') continue
          if (parseFloat(cs.opacity) < 0.5 || cs.visibility === 'hidden') continue
          // 半透明色一律不参与判定：cyberpunk 这类风格满天飞 rgba(255,45,149,0.08)
          // 的覆盖层，把它当实心底会算出「洋红字压洋红底 = 1.00」这种假 FAIL
          const alphaOf = (s) => {
            const m = s.match(/rgba?\\(([^)]+)\\)/)
            if (!m) return 1
            const p = m[1].split(/[,\\s/]+/).filter(Boolean).map(Number)
            return p.length > 3 ? p[3] : 1
          }
          if (alphaOf(cs.color) < 0.9) continue
          let bg = null, node = e, unreliable = false
          while (node) {
            const s = getComputedStyle(node)
            // 祖先（含自身）画了渐变/纹理：computed 的 background-color 只是垫在
            // 图像下面的托底色，视觉上被盖住了，拿它判定会得出「白字压浅底」的假象
            if (s.backgroundImage && s.backgroundImage !== 'none') { unreliable = true; break }
            const c = s.backgroundColor
            if (c && c !== 'transparent' && alphaOf(c) >= 0.9) { bg = c; break }
            node = node.parentElement
          }
          let fromToken = false
          if (unreliable || !bg || /,\\s*0\\)$/.test(bg)) {
            const ds = document.querySelector("[data-style='" + styleId + "']")
            const tok = ds ? getComputedStyle(ds).getPropertyValue('--c-bg') : ''
            if (tok && tok.trim()) { bg = tok.trim(); fromToken = true }
          }
          if (!bg || /,\\s*0\\)$/.test(bg)) continue
          // fb=true 表示「底色是从 --c-bg 兜底来的」：元素真实底色由 background-image
          // （渐变/纹理）提供，computed style 拿不到。这类不能判 FAIL——
          // skeuomorphism 的黄铜铭牌就是这样被误判成 1.02 的。
          out.push({ t: own.slice(0, 24), fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, bg, fb: fromToken })
        }
        return out
      })()`,
    })
    const parsed = res.result.value
      .map((r) => {
        const fg = collectColors(r.color, {})[0]?.rgb
        const bg = collectColors(r.bg, {})[0]?.rgb
        if (!fg || !bg) return null
        const px = parseFloat(r.fs) || 16
        const w = parseInt(r.fw, 10) || 400
        const need = px >= 18 || (px >= 14 && w >= 700) ? 3 : 4.5
        return { id, t: r.t, fg, bg, need, fb: r.fb, r: ratio(fg, bg) }
      })
      .filter(Boolean)
    // 底色来自 --c-bg 兜底的不可信，与「背景未定」同等处理
    for (const r of parsed) if (r.fb) unresolvedLive++
    rows.push(...parsed.filter((r) => !r.fb))
  }
  ws.close()

  console.log('== 真实渲染（--live）：每风格最低对比度 ==')
  const byId = new Map()
  for (const r of rows) {
    const cur = byId.get(r.id)
    if (!cur || r.r < cur.r) byId.set(r.id, r)
  }
  for (const id of ids) {
    const r = byId.get(id)
    console.log(id.padEnd(16), r ? r.r.toFixed(2).padStart(6) : '   -  ', r && r.r < r.need ? 'FAIL' : 'OK')
  }
  const bad = rows.filter((r) => r.r < r.need).sort((a, b) => a.r - b.r)
  console.log('\n== 不达标明细 ==')
  if (!bad.length) console.log('（无）')
  for (const r of bad.slice(0, 80)) {
    console.log(
      `${r.id.padEnd(16)} ${r.r.toFixed(2).padStart(5)} (需 ${r.need}) ${fmt(r.fg)} on ${fmt(r.bg)}  ${r.t}`,
    )
  }
  console.log(
    `\n共检查 ${rows.length} 处可见文本，不达标 ${bad.length} 处；` +
      `另有 ${unresolvedLive} 处底色由 background-image 提供（只能拿 --c-bg 兜底）已跳过，需人工看截图。`,
  )
}

/* ---------------- 入口 ---------------- */

const args = process.argv.slice(2)
if (args[0] === '--live') {
  const baseURL = args[1]
  if (!baseURL) {
    console.error('用法：node scripts/contrast.mjs --live <baseURL>（例 http://localhost:3005）')
    process.exit(1)
  }
  await liveContrast(baseURL, process.env.CDP_PORT || '9222')
  process.exit(0)
}

const results = []
for (const id of ids) {
  const { pairs, unresolved } = analyseStyle(id)
  const fails = pairs.filter((p) => p.r < p.need)
  const worst = pairs.length ? Math.min(...pairs.map((p) => p.r)) : null
  results.push({ id, pairs, fails, worst, unresolved })
}

console.log('== 汇总（每风格：已确定色对的最低对比度 / 背景未定不参与判定）==')
for (const r of results) {
  const w = r.worst === null ? '   -  ' : r.worst.toFixed(2).padStart(6)
  console.log(
    r.id.padEnd(16),
    w,
    r.fails.length ? 'FAIL' : 'OK  ',
    `确定 ${String(r.pairs.length).padStart(3)} 对 / 背景未定 ${r.unresolved}`,
  )
}

const bad = results.filter((r) => r.fails.length)
console.log('\n== 不达标明细（低于该字号的 WCAG AA 门槛）==')
if (!bad.length) {
  console.log('（无）')
} else {
  for (const r of bad) {
    for (const p of r.fails) {
      const file = p.file.replace(/.*styles\//, 'styles/')
      console.log(
        `${r.id.padEnd(16)} ${p.r.toFixed(2).padStart(5)} (需 ${p.need}) ${fmt(p.fg)} on ${fmt(p.bg)}${p.grad ? '(渐变均值)' : '        '}  ${p.sel.slice(0, 32).padEnd(32)} ${file}`,
      )
    }
  }
}
console.log(
  `\n注：背景不确定（transparent / 纯继承 / 只写渐变）的 ${results.reduce((s, r) => s + r.unresolved, 0)} 处已跳过——` +
    `旧版会把它们强行配到 --c-bg 上，那是误报的主来源。要覆盖这部分请用 --live。`,
)

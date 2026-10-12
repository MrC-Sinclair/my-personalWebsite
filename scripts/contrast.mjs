/**
 * 临时工具：按 WCAG 2.1 计算各风格 token 的正文/次要文字对比度
 * ------------------------------------------------------------
 * 2026-10-07 改为自动解析 styles/<id>/tokens.css 的当前值——
 * 旧版手填色值早已过时（retro-computer 的 muted 实际是 #333，脚本里还是 #4d4d4d），
 * 据此做改动决策会得出错误结论。
 *
 * 判定口径：正文 text 与次要文字 muted 分别压在 bg 和 surface 两种底上算，
 * 任一组合 < 4.5 即标 FAIL（AGENTS.md 的无障碍红线是 WCAG AA ≥ 4.5:1）。
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const lum = (hex) => {
  const c = hex.replace('#', '')
  const ch = [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16) / 255)
  const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
  return 0.2126 * f(ch[0]) + 0.7152 * f(ch[1]) + 0.0722 * f(ch[2])
}
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const stylesDir = fileURLToPath(new URL('../styles/', import.meta.url))
const ids = readdirSync(stylesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
  .map((d) => d.name)
  .sort()

const rows = []
for (const id of ids) {
  const file = join(stylesDir, id, 'tokens.css')
  if (!existsSync(file)) continue
  const css = readFileSync(file, 'utf8')
  const token = {}
  for (const [, key, val] of css.matchAll(/--c-(bg|surface|text|muted)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) {
    token[key] = val
  }
  if (!token.bg || !token.text) {
    console.log(id.padEnd(16), '← tokens.css 缺 --c-bg/--c-text，跳过')
    continue
  }
  const pairs = [
    ['text/bg', token.text, token.bg],
    ['text/surface', token.text, token.surface],
    ['muted/bg', token.muted, token.bg],
    ['muted/surface', token.muted, token.surface],
  ].filter(([, , bg]) => Boolean(bg))
  const fails = pairs.filter(([, fg, bg]) => ratio(fg, bg) < 4.5)
  const worst = Math.min(...pairs.map(([, fg, bg]) => ratio(fg, bg)))
  rows.push({ id, pairs, fails, worst })
}

// 先列全部达标项的最低值，再详列不达标组合
console.log('== 汇总（每风格的最低对比度）==')
for (const r of rows) {
  console.log(r.id.padEnd(16), r.worst.toFixed(2).padStart(6), r.fails.length ? 'FAIL' : 'OK')
}
const bad = rows.filter((r) => r.fails.length)
console.log('\n== 不达标明细（< 4.5）==')
if (!bad.length) {
  console.log('（无）')
} else {
  for (const r of bad) {
    for (const [label, fg, bg] of r.fails) {
      console.log(`${r.id.padEnd(16)} ${label.padEnd(14)} ${fg} on ${bg} = ${ratio(fg, bg).toFixed(2)}`)
    }
  }
}

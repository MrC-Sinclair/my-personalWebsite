/**
 * 代码块语法高亮契约测试
 * ------------------------------------------------------------
 * 背景（2026-10-09 修复的真实缺陷）：本站 20 个风格 × 14 篇文章的代码块
 * **一直是纯文本色**。原因是 shiki 只输出 CSS 变量（--shiki-default /
 * --shiki-dark），把它接到 color 上的规则由 shiki 自己提供，却挂在
 * `html .default` / `html .dark` 上——那是给 color-mode 准备的，本站
 * 没有 color-mode，两条规则永不匹配。
 *
 * 这类失效**完全静默**：不报错、构建照过、页面照渲染，只是没有颜色。
 * lint / 类型检查 / 构建全抓不到，只能靠结构断言守住。
 *
 * 本测试守住三件事：
 * 1. nuxt.config.ts 声明了双主题（亮/暗），且用的是 high-contrast 版
 * 2. 共享层有把变量接到 color 的接线（这是失效点本身）
 * 3. 风格层的覆盖只能用变量，不能写死颜色（否则违背「UI 不跨风格复用」
 *    且会随主题调整失效）
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = process.cwd()

/**
 * 剥掉注释再断言。
 * ⚠️ 不剥会写出假测试：base.css 的解释性注释里引用了 shiki 自己的规则
 * （`html .default .shiki span { color: var(--shiki-default) }`），
 * 正则会命中注释而永远通过——变异验证（把真规则改坏）时它照样是绿的。
 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

const nuxtConfig = stripComments(readFileSync(resolve(root, 'nuxt.config.ts'), 'utf8'))
const baseCss = stripComments(readFileSync(resolve(root, 'styles/_base/base.css'), 'utf8'))

/** 收集所有风格的详情组件（代码块只出现在详情页的正文里） */
function detailPages(): Array<{ id: string; file: string; src: string }> {
  const stylesRoot = resolve(root, 'styles')
  return readdirSync(stylesRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
    .map((d) => {
      const compDir = join(stylesRoot, d.name, 'components')
      if (!existsSync(compDir)) return null
      const file = readdirSync(compDir).find((f) => /Detail.*\.vue$/.test(f))
      if (!file) return null
      return { id: d.name, file, src: readFileSync(join(compDir, file), 'utf8') }
    })
    .filter((v): v is { id: string; file: string; src: string } => v !== null)
}

describe('代码块语法高亮', () => {
  it('nuxt.config.ts 声明了 shiki 双主题', () => {
    // 双主题是风格层能「按明暗选色」的前提：只有一套主题时深底风格必然不可读
    expect(nuxtConfig).toMatch(/theme:\s*\{[^}]*default:\s*'[^']+'/)
    expect(nuxtConfig).toMatch(/theme:\s*\{[^}]*dark:\s*'[^']+'/)
  })

  it('用的是 high-contrast 主题（普通版注释色只有 3.98:1）', () => {
    expect(nuxtConfig).toContain('github-light-high-contrast')
    expect(nuxtConfig).toContain('github-dark-high-contrast')
  })

  it('共享层有把 shiki 变量接到 color 的接线', () => {
    // 删掉这段，全站代码块会静默退回纯文本色——这是本测试存在的理由
    expect(baseCss).toMatch(/\.shiki\s+span\s*\{[^}]*color:\s*var\(--shiki-default\)/)
  })

  it.each(detailPages().map((p) => [p.id, p] as const))(
    '%s 的 token 覆盖只用变量（不写死颜色）',
    (_id, page) => {
      const rules = page.src.match(/:deep\(\.shiki\s+span\)\s*\{[^}]*\}/g) ?? []
      for (const rule of rules) {
        const color = rule.match(/color:\s*([^;]+);/)
        if (!color) continue
        expect(
          color[1].trim(),
          `${page.id} 的 .shiki span 写死了颜色（${color[1].trim()}），应改用 var(--shiki-dark)`,
        ).toMatch(/^var\(--shiki-(default|dark)\)$/)
      }
    },
  )

  it('深底风格确实覆盖了暗色变量（浅底风格不应覆盖）', () => {
    const pages = detailPages()
    const covered = pages.filter((p) => p.src.includes('.shiki span'))
    // 12 个深底风格 + glassmorphism（背景加深后归入深底）
    expect(covered.length).toBeGreaterThanOrEqual(13)
    for (const p of covered) {
      expect(p.src, `${p.id} 覆盖了 .shiki span 但没用暗色变量`).toMatch(
        /:deep\(\.shiki\s+span\)\s*\{[^}]*var\(--shiki-dark\)/,
      )
    }
  })
})

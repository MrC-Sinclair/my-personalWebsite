/**
 * 详情页日期本地化契约
 * ------------------------------------------------------------
 * 2026-11-28 修复：20 个风格详情页此前都调用 formatDate(view.doc.date)，
 * 不传 locale 时格式函数默认 zh-CN，导致英文页也显示「2026年11月27日」。
 *
 * 这里直接扫描 .vue 源码做结构校验：只要详情页出现日期调用，
 * 就必须显式传入当前 locale，并且从 useI18n() 解构出 locale。
 * 这样新增风格或复制详情页时，漏传 locale 会在测试阶段暴露。
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { styleRegistry } from '~/styles/registry'

const stylesRoot = resolve(process.cwd(), 'styles')

/** 递归收集目录下所有 .vue 文件 */
function walkVue(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return walkVue(full)
    return entry.name.endsWith('.vue') ? [full] : []
  })
}

const detailPages = walkVue(stylesRoot).filter((file) => file.endsWith('DetailPage.vue'))

describe('详情页日期本地化', () => {
  it('每个风格都有详情页', () => {
    expect(detailPages).toHaveLength(styleRegistry.length)
  })

  it.each(detailPages.map((file) => [file.replace(stylesRoot, 'styles'), file] as const))(
    '%s 的日期调用传入当前 locale',
    (_relativePath, file) => {
      const src = readFileSync(file, 'utf8')
      const call = src.match(/formatDate\(view\.doc\.date[^)]*\)/)

      expect(call, '详情页应包含日期格式化调用').toBeTruthy()
      expect(call![0]).toMatch(/formatDate\(view\.doc\.date,\s*locale\)/)
      expect(src).toMatch(/const\s*\{\s*t\s*,\s*locale\s*\}\s*=\s*useI18n\(\)/)
    },
  )
})

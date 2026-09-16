/// <reference types="vite/client" />
/**
 * 多风格架构结构测试
 * ------------------------------------------------------------
 * 只做结构校验（不渲染组件）：
 * 1. 注册表 id 与 styles/ 目录一一对应，且每个风格都有
 *    tokens.css / index.ts / pages/ 目录
 * 2. 注册表 id 唯一
 * 3. 每个风格 index.ts 默认导出的页面映射必须包含 '/'
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
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

describe('多风格架构结构', () => {
  it('注册表 id 唯一', () => {
    const ids = styleRegistry.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(styleRegistry.map((item) => [item.id, item] as const))('%s 目录结构完整', (id) => {
    expect(existsSync(resolve(stylesRoot, id)), `styles/${id}/ 目录不存在`).toBe(true)
    expect(existsSync(resolve(stylesRoot, id, 'tokens.css')), `styles/${id}/tokens.css 不存在`).toBe(true)
    expect(existsSync(resolve(stylesRoot, id, 'index.ts')), `styles/${id}/index.ts 不存在`).toBe(true)
    expect(existsSync(resolve(stylesRoot, id, 'pages')), `styles/${id}/pages/ 不存在`).toBe(true)
  })

  it('每个风格 index.ts 的页面映射包含 "/"', async () => {
    const entries = import.meta.glob<{ default: { pages?: Record<string, unknown> } }>(
      '/styles/*/index.ts',
      { eager: true },
    )
    for (const item of styleRegistry) {
      const entry = entries[`/styles/${item.id}/index.ts`]
      expect(entry?.default?.pages?.['/'], `${item.id} 缺少 "/" 页面映射`).toBeTruthy()
    }
  })

  /**
   * 反向校验：styles/ 下组件不走自动导入（见 AGENTS.md），一旦漏写 import，
   * Vue 会把 <XxxYyy> 当成未知标签原样输出 —— 组件彻底失效，且构建、
   * lint 全都不报错。y2k 首屏 CTA、复古电脑菜单栏图标、Web 2.0 头尾按钮
   * 都曾因此变成「裸文字」，故此条必须由测试守住。
   */
  it('同目录组件引用必须显式 import', () => {
    const problems: string[] = []

    for (const file of walkVue(stylesRoot)) {
      const src = readFileSync(file, 'utf8')
      const template = src.match(/<template>([\s\S]*)<\/template>/)?.[1]
      if (!template) continue
      const script = src.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? ''

      const dir = dirname(file)
      const siblings = readdirSync(dir)
        .filter((name) => name.endsWith('.vue') && name !== basename(file))
        .map((name) => name.replace(/\.vue$/, ''))

      const imported = new Set(
        [...script.matchAll(/import\s+([A-Za-z0-9_$]+)\s+from/g)].map((m) => m[1]),
      )

      for (const sibling of siblings) {
        const kebab = sibling
          .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
          .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
          .toLowerCase()
        const used =
          new RegExp(`<${sibling}[\\s/>]`).test(template) ||
          new RegExp(`<${kebab}[\\s/>]`).test(template)
        if (used && !imported.has(sibling)) {
          problems.push(`${file.replace(stylesRoot, 'styles')} 使用了 <${sibling}> 但未 import`)
        }
      }
    }

    expect(problems).toEqual([])
  })
})

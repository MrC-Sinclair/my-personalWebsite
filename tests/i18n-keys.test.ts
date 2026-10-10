/**
 * i18n key 契约测试
 * ------------------------------------------------------------
 * 背景（2026-10-10 修复的真实缺陷）：线上 20 个风格 × 中英双语的所有详情页，
 * 上下篇导航的标签一直渲染成 **"blog.prev" / "blog.next"** 这种原始 key 字符串。
 * 根因是代码写 `t('blog.prev')`，而语言包里的 key 其实是 `blog.prevPost` /
 * `blog.nextPost`——t() 找不到就回退显示 key 名本身。同一批问题还有：
 *   - `t('common.noData')`（20 个文件用，语言包里根本没有）
 *   - `aria-label="上下篇"` 硬编码中文，英文站也显示中文
 *
 * 这类失效**完全静默**：不报错、类型检查照过、构建照过、页面照渲染，
 * 只是文案是错的。之前的 100 页移动端/无障碍审计也抓不到——它只查
 * h1 数量、横向溢出、触控目标、alt，不查文案渲染结果。
 *
 * 本测试守住三件事：
 * 1. 代码里出现的每个 `t('x.y')` 字面量，中英语言包里都必须存在
 * 2. 模板里的 aria-label / placeholder 不得硬编码中文（必须走 t()）
 * 3. 中英语言包的 key 必须双向零缺失（缺一侧等于该语言页面会露 key 名）
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = process.cwd()

/**
 * 剥掉注释再断言。
 * ⚠️ 不剥会写出假测试：注释里常引用示例 key 或示例 HTML 属性，
 * 正则会命中注释而永远通过。
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

/** 递归收集源码文件（跳过生成目录与截图目录） */
const SKIP = new Set([
  'node_modules',
  '.git',
  '.nuxt',
  '.output',
  '.workbuddy',
  'dist',
  'public',
  '.shots',
])
function collect(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith('.shots-')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) collect(full, out)
    else if (/\.(vue|ts)$/.test(name)) out.push(full)
  }
  return out
}

const SOURCE_FILES = [
  ...collect(resolve(root, 'styles')),
  ...collect(resolve(root, 'pages')),
  ...collect(resolve(root, 'layouts')),
  ...collect(resolve(root, 'composables')),
  ...collect(resolve(root, 'utils')),
  resolve(root, 'app.vue'),
  resolve(root, 'error.vue'),
]

/** 把嵌套语言包展平成 "a.b.c" 形式的 key 集合 */
function flatten(obj: unknown, prefix: string[] = []): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return []
  const out: string[] = []
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = [...prefix, k]
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flatten(v, path))
    } else {
      out.push(path.join('.'))
    }
  }
  return out
}

const zhKeys = new Set(flatten(JSON.parse(readFileSync(resolve(root, 'i18n/zh-CN.json'), 'utf8'))))
const enKeys = new Set(flatten(JSON.parse(readFileSync(resolve(root, 'i18n/en-US.json'), 'utf8'))))

/** 代码里所有 `t('x.y')` / `$t('x.y')` 的字面量 key（动态拼接的不管） */
function usedKeys(): Map<string, string[]> {
  const re = /(?:\bt|\$t)\(\s*'([a-zA-Z][\w.]*)'/g
  const map = new Map<string, string[]>()
  for (const file of SOURCE_FILES) {
    const src = stripComments(readFileSync(file, 'utf8'))
    let m: RegExpExecArray | null
    while ((m = re.exec(src))) {
      const key = m[1]
      if (!map.has(key)) map.set(key, [])
      const files = map.get(key)
      if (files && !files.includes(file)) files.push(file)
    }
  }
  return map
}

describe('i18n key 契约', () => {
  const used = usedKeys()

  it('代码引用的每个 t() key 在中英语言包里都存在', () => {
    const missing: string[] = []
    for (const [key] of used) {
      if (!zhKeys.has(key) || !enKeys.has(key)) missing.push(key)
    }
    expect(
      missing,
      `以下 key 被 t() 引用但语言包里没有，页面会直接显示 key 名：${missing.join(', ')}`,
    ).toEqual([])
  })

  it('中英语言包双向零缺失', () => {
    const onlyZh = [...zhKeys].filter((k) => !enKeys.has(k))
    const onlyEn = [...enKeys].filter((k) => !zhKeys.has(k))
    expect(onlyZh).toEqual([])
    expect(onlyEn).toEqual([])
  })

  it('模板里的 aria-label 不得硬编码中文', () => {
    const offenders: string[] = []
    // 只匹配静态属性 aria-label="中文"，动态绑定 :aria-label="t(...)" 不算
    const re = /(?<!:)aria-label="[^"]*[一-龥][^"]*"/g
    for (const file of SOURCE_FILES) {
      const src = stripComments(readFileSync(file, 'utf8'))
      const hits = src.match(re)
      if (hits) offenders.push(...hits.map((h) => `${file} → ${h}`))
    }
    expect(offenders, `aria-label 必须走 t()：\n${offenders.join('\n')}`).toEqual([])
  })

  it('模板里的 placeholder 不得硬编码中文', () => {
    const offenders: string[] = []
    const re = /(?<!:)placeholder="[^"]*[一-龥][^"]*"/g
    for (const file of SOURCE_FILES) {
      const src = stripComments(readFileSync(file, 'utf8'))
      const hits = src.match(re)
      if (hits) offenders.push(...hits.map((h) => `${file} → ${h}`))
    }
    expect(offenders, `placeholder 必须走 t()：\n${offenders.join('\n')}`).toEqual([])
  })

  it('确实扫到了足够多的文件（防止收集逻辑失效导致空跑）', () => {
    expect(SOURCE_FILES.length).toBeGreaterThan(300)
    expect(used.size).toBeGreaterThan(50)
  })
})

/**
 * utils/search 单元测试（博客搜索的纯函数层）
 * ------------------------------------------------------------
 * 这里是全站唯一的搜索匹配实现，风格层只接结果。重点守三条语义：
 * 空查询返回原列表、多关键词取交集（AND）、标题命中优先且同档保持原顺序。
 * 另外守住「不搜正文」的取舍——列表数据里没有 body，不应对它有依赖。
 */
import { describe, expect, it } from 'vitest'
import type { BlogPost } from '~/types/blog'
import {
  countPostsMatchingQuery,
  filterPostsByQuery,
  normalizeText,
  tokenizeQuery,
} from '~/utils/search'

function post(
  title: string,
  extra: Partial<Pick<BlogPost, 'description' | 'category' | 'tags' | 'path'>> = {},
): BlogPost {
  return {
    title,
    date: '2026-01-01',
    tags: [],
    draft: false,
    path: `/blog/zh/${title}`,
    ...extra,
  }
}

const posts: BlogPost[] = [
  post('Vue 性能优化实践', { description: '长列表渲染优化', category: '前端', tags: ['Vue'] }),
  post('Nuxt 内容管理', { description: '用 Vue 组件组织内容', category: '前端', tags: ['Nuxt'] }),
  post('PostgreSQL 索引', { description: '查询计划分析', category: '数据库', tags: ['SQL'] }),
]

describe('normalizeText / tokenizeQuery', () => {
  it('归一化：小写 + 去首尾空白', () => {
    expect(normalizeText('  VUE  ')).toBe('vue')
    expect(normalizeText(undefined)).toBe('')
    expect(normalizeText(42)).toBe('')
  })

  it('分词：按空白切，中文整段为一个词', () => {
    expect(tokenizeQuery('vue 性能')).toEqual(['vue', '性能'])
    expect(tokenizeQuery('   ')).toEqual([])
    expect(tokenizeQuery('')).toEqual([])
  })
})

describe('filterPostsByQuery', () => {
  it('空查询返回原列表（与未筛选同义）', () => {
    expect(filterPostsByQuery(posts, '')).toEqual(posts)
    expect(filterPostsByQuery(posts, '   ')).toEqual(posts)
  })

  it('大小写不敏感（大写与小写命中同一批）', () => {
    // 注意 posts 里第二篇的摘要含 "Vue"，故小写也命中两篇——这里只比对大小写是否等价
    const lower = filterPostsByQuery(posts, 'vue').map((p) => p.title)
    const upper = filterPostsByQuery(posts, 'VUE').map((p) => p.title)
    expect(lower.length).toBeGreaterThan(0)
    expect(upper).toEqual(lower)
  })

  it('匹配标题', () => {
    expect(filterPostsByQuery(posts, 'postgres').map((p) => p.title)).toEqual(['PostgreSQL 索引'])
  })

  it('匹配摘要、分类与标签', () => {
    expect(filterPostsByQuery(posts, '查询计划').map((p) => p.title)).toEqual(['PostgreSQL 索引'])
    expect(filterPostsByQuery(posts, '数据库').map((p) => p.title)).toEqual(['PostgreSQL 索引'])
    expect(filterPostsByQuery(posts, 'nuxt').map((p) => p.title)).toEqual(['Nuxt 内容管理'])
  })

  it('匹配 slug（path 末段）', () => {
    const list = [post('文章一', { path: '/blog/zh/big-data-table-performance.md' })]
    expect(filterPostsByQuery(list, 'table')).toHaveLength(1)
  })

  it('★ 多关键词取交集（AND）', () => {
    // 「Vue」命中前两篇（标题/标签），「优化」只命中第一篇 → 结果只剩一篇
    expect(filterPostsByQuery(posts, 'vue 优化').map((p) => p.title)).toEqual(['Vue 性能优化实践'])
  })

  it('★ 标题命中优先，同档保持原有顺序', () => {
    const list = [
      post('缓存策略', { description: '讲 Vue 的缓存' }),
      post('Vue 的响应式', { description: '无关描述' }),
      post('另一篇 Vue', { description: '无关描述' }),
    ]
    // 后两篇标题命中 Vue，排到前面；两者之间保持原顺序
    expect(filterPostsByQuery(list, 'vue').map((p) => p.title)).toEqual([
      'Vue 的响应式',
      '另一篇 Vue',
      '缓存策略',
    ])
  })

  it('无命中返回空数组', () => {
    expect(filterPostsByQuery(posts, '不存在的关键词')).toEqual([])
  })

  it('脏数据不抛错（tags 非数组、字段缺失）', () => {
    const dirty = [{ title: 'x', date: '2026-01-01', draft: false, path: '/blog/zh/x' } as BlogPost]
    expect(() => filterPostsByQuery(dirty, 'x')).not.toThrow()
    expect(filterPostsByQuery(dirty, 'x')).toHaveLength(1)
  })
})

describe('countPostsMatchingQuery', () => {
  it('空查询返回总数，有查询返回命中数', () => {
    expect(countPostsMatchingQuery(posts, '')).toBe(3)
    expect(countPostsMatchingQuery(posts, 'vue')).toBe(2)
  })
})

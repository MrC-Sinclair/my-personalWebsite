/**
 * 博客标签聚合测试（纯函数）
 * ------------------------------------------------------------
 * 重点验证三件事：
 *   1. 排序稳定：文章数降序 + 同数量按字典序。这里**刻意不用 localeCompare**
 *      （ICU 在 Node 与浏览器可能不同，会造成 SSR/客户端顺序不一致），
 *      因此用测试用例把「字典序」这件事钉死；
 *   2. 脏数据防御：tags 不是数组、含空串 / 非字符串时不能崩；
 *   3. 空 tag 表示未筛选，返回原列表而不是空列表。
 */
import { describe, expect, it } from 'vitest'
import type { BlogPost } from '~/types/blog'
import { collectTags, countPostsWithTag, filterPostsByTag } from '~/utils/tags'

/** 只关心 tags 时不必填满全部字段，其余给最小可用值 */
function post(title: string, tags: unknown): BlogPost {
  return {
    title,
    date: '2026-01-01',
    tags: tags as string[],
    draft: false,
    path: `/blog/zh/${title}`,
  }
}

describe('collectTags', () => {
  it('按文章数降序聚合', () => {
    const tags = collectTags([
      post('a', ['AI', '前端']),
      post('b', ['AI']),
      post('c', ['AI', '工程']),
    ])
    expect(tags).toEqual([
      { tag: 'AI', count: 3 },
      { tag: '前端', count: 1 },
      { tag: '工程', count: 1 },
    ])
  })

  it('文章数相同时按字典序（不用 localeCompare，跨环境必须一致）', () => {
    const tags = collectTags([post('a', ['Vue', 'AI', 'Nuxt'])])
    expect(tags.map((item) => item.tag)).toEqual(['AI', 'Nuxt', 'Vue'])
  })

  it('忽略空字符串标签与非法 tags 字段', () => {
    const tags = collectTags([
      post('a', ['AI', '  ', '']),
      post('b', undefined),
      post('c', ['AI', 42 as unknown as string]),
    ])
    expect(tags).toEqual([{ tag: 'AI', count: 2 }])
  })

  it('空列表返回空数组', () => {
    expect(collectTags([])).toEqual([])
  })
})

describe('filterPostsByTag', () => {
  const posts = [post('a', ['AI']), post('b', ['前端']), post('c', ['AI', '前端'])]

  it('空 tag 表示未筛选，返回原列表', () => {
    expect(filterPostsByTag(posts, '')).toBe(posts)
  })

  it('命中标签的文章全部返回（含多标签文章）', () => {
    expect(filterPostsByTag(posts, 'AI').map((p) => p.title)).toEqual(['a', 'c'])
  })

  it('标签不存在时返回空数组（调用方据此显示空状态）', () => {
    expect(filterPostsByTag(posts, '不存在')).toEqual([])
  })
})

describe('countPostsWithTag', () => {
  const posts = [post('a', ['AI']), post('b', ['前端']), post('c', ['AI', '前端'])]

  it('统计该标签下的文章数', () => {
    expect(countPostsWithTag(posts, '前端')).toBe(2)
  })

  it('空 tag 返回总数（「全部」角标用）', () => {
    expect(countPostsWithTag(posts, '')).toBe(3)
  })
})

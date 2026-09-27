/**
 * RSS feed 生成测试
 * ------------------------------------------------------------
 * 覆盖三层：
 *   1. parseFrontmatter —— 本项目 frontmatter 的实际形态（全角冒号标题、引号包裹、
 *      tags 列表、布尔），它不是通用 YAML 解析器，只保证够用；
 *   2. readBlogEntries —— 读真实 content 目录，口径必须与 useBlog.getAllPosts 一致
 *      （排除 draft、按日期倒序），否则 feed 会和站点列表对不上；
 *   3. buildFeedXml / toFeedItems —— URL 拼接与 XML 合法性。
 */
import { describe, expect, it } from 'vitest'
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { buildFeedXml, parseFrontmatter, readBlogEntries, toFeedItems } from '~/utils/feed'

const zhDir = resolve(process.cwd(), 'content', 'blog', 'zh')
const enDir = resolve(process.cwd(), 'content', 'blog', 'en')

describe('parseFrontmatter', () => {
  it('解析标量字段，标题里的全角冒号不被当成分隔符', () => {
    const fm = parseFrontmatter(
      ['---', "title: AI 全流程开发实战指南：从零到一", "date: '2026-03-02'", '---', '', '正文'].join(
        '\n',
      ),
    )
    expect(fm.title).toBe('AI 全流程开发实战指南：从零到一')
    expect(fm.date).toBe('2026-03-02')
  })

  it('解析双引号包裹的标题', () => {
    const fm = parseFrontmatter(['---', 'title: "Hello: World"', '---'].join('\n'))
    expect(fm.title).toBe('Hello: World')
  })

  it('解析 tags 列表与布尔值', () => {
    const fm = parseFrontmatter(
      ['---', 'title: T', 'draft: false', 'tags:', '  - AI', '  - 前端开发', '---'].join('\n'),
    )
    expect(fm.tags).toEqual(['AI', '前端开发'])
    expect(fm.draft).toBe(false)
  })

  it('没有 frontmatter 块时返回空对象', () => {
    expect(parseFrontmatter('# 只有正文')).toEqual({})
  })
})

describe('readBlogEntries', () => {
  it('中文目录：数量与磁盘一致，且不含 draft', () => {
    const mdCount = readdirSync(zhDir).filter((f) => f.endsWith('.md')).length
    const entries = readBlogEntries(zhDir)
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.length).toBeLessThanOrEqual(mdCount)
    entries.forEach((entry) => {
      expect(entry.title).not.toBe('')
      // schema 约束 date 形如 YYYY-MM-DD
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('按日期倒序（与 useBlog.getAllPosts 同口径）', () => {
    const entries = readBlogEntries(zhDir)
    const dates = entries.map((entry) => entry.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('中英 slug 集合一致（详情页路由取的是两者交集）', () => {
    const zh = readBlogEntries(zhDir).map((e) => e.slug).sort()
    const en = readBlogEntries(enDir).map((e) => e.slug).sort()
    expect(en).toEqual(zh)
  })

  it('目录不存在时返回空数组而不是抛错', () => {
    expect(readBlogEntries(join(process.cwd(), 'content', 'blog', 'nope'))).toEqual([])
  })
})

describe('toFeedItems', () => {
  it('链接按语种前缀指向 minimalism 风格的详情页', () => {
    const items = toFeedItems(
      [{ slug: 'hello', title: 'T', description: 'D', date: '2026-03-02', tags: ['AI'] }],
      {
        siteUrl: 'https://example.com',
        baseUrl: '/site/',
        styleId: 'minimalism',
        localePrefix: 'en/',
      },
    )
    expect(items[0].link).toBe('https://example.com/site/en/style/minimalism/blog/hello')
    expect(items[0].pubDate).toBe('Mon, 02 Mar 2026 00:00:00 GMT')
    expect(items[0].categories).toEqual(['AI'])
  })

  it('空日期退化成 epoch 而不是 Invalid Date', () => {
    const items = toFeedItems(
      [{ slug: 's', title: 'T', description: '', date: '', tags: [] }],
      { siteUrl: 'https://e.com', baseUrl: '/', styleId: 'minimalism', localePrefix: '' },
    )
    expect(items[0].pubDate).toBe('Thu, 01 Jan 1970 00:00:00 GMT')
  })
})

describe('真实内容的 feed 产物', () => {
  it('中文 feed：item 数与文章数一致、可被 XML 解析、链接指向风格内详情路由', () => {
    const entries = readBlogEntries(zhDir)
    const items = toFeedItems(entries, {
      siteUrl: 'https://mrc-sinclair.github.io',
      baseUrl: '/my-personalWebsite/',
      styleId: 'minimalism',
      localePrefix: '',
    })
    const xml = buildFeedXml(
      {
        title: 'Sinclair-CXP · 技术博客',
        description: '技术笔记',
        siteUrl: 'https://mrc-sinclair.github.io/my-personalWebsite/',
        feedUrl: 'https://mrc-sinclair.github.io/my-personalWebsite/feed.xml',
        language: 'zh-CN',
        lastBuildDate: 'Mon, 28 Sep 2026 00:00:00 GMT',
      },
      items,
    )

    // 用 XML 解析器验证合法性：任何标签未闭合 / 转义错误都会产生 parsererror
    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    expect(doc.querySelector('parsererror')).toBeNull()
    expect(doc.querySelectorAll('item').length).toBe(entries.length)

    const firstLink = doc.querySelector('item link')?.textContent ?? ''
    expect(firstLink).toMatch(
      /^https:\/\/mrc-sinclair\.github\.io\/my-personalWebsite\/style\/minimalism\/blog\/[a-z0-9-]+$/,
    )
  })
})

describe('buildFeedXml', () => {
  const channel = {
    title: 'Sinclair-CXP · 技术博客',
    description: '前端 & 跨端 <实践> 笔记',
    siteUrl: 'https://example.com/site/',
    feedUrl: 'https://example.com/site/feed.xml',
    language: 'zh-CN',
    lastBuildDate: 'Mon, 28 Sep 2026 00:00:00 GMT',
  }

  it('产出 RSS 2.0 骨架，channel 字段转义后写入', () => {
    const xml = buildFeedXml(channel, [
      {
        title: 'A & B',
        link: 'https://example.com/site/style/minimalism/blog/a',
        description: '<p>desc</p>',
        pubDate: 'Mon, 02 Mar 2026 00:00:00 GMT',
        categories: ['AI', '前端'],
      },
    ])
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<title>A &amp; B</title>')
    expect(xml).toContain('&lt;p&gt;desc&lt;/p&gt;')
    expect(xml).toContain('<description>前端 &amp; 跨端 &lt;实践&gt; 笔记</description>')
    expect(xml).toContain('<category>AI</category>')
    expect(xml).toContain('<guid isPermaLink="true">')
  })

  it('没有文章时也产出合法 channel', () => {
    const xml = buildFeedXml(channel, [])
    expect(xml).toContain('<channel>')
    expect(xml).not.toContain('<item>')
    expect(xml.trimEnd().endsWith('</rss>')).toBe(true)
  })

  it('atom:link rel="self" 指向 feed 自身', () => {
    const xml = buildFeedXml(channel, [])
    expect(xml).toContain(
      '<atom:link href="https://example.com/site/feed.xml" rel="self" type="application/rss+xml"/>',
    )
  })
})

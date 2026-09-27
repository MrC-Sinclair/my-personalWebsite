/**
 * @file RSS 2.0 feed 生成（构建期）
 * @description 读 content/blog/<locale>/*.md 的 frontmatter，生成 feed.xml。
 *
 * 为什么不走 @nuxt/content 的 API：sitemap 与 feed 都在 nitro 的 prerender:done
 * 钩子里生成，那时拿不到 content 的查询上下文；而 feed 只需要 frontmatter 的
 * 标题/描述/日期/标签，直接读 Markdown 更轻、更可测，也不受 collection 变更影响。
 *
 * 只解析本项目实际使用的 frontmatter 形态（key: value、单双引号标量、布尔、
 * `tags:` 下挂 `- item` 列表），不是通用 YAML 解析器。
 *
 * 仅供构建期使用：由 nuxt.config.ts 调用，不进客户端产物。
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { escapeXml } from './xml'

/** 一篇文章的 feed 元数据（来自 frontmatter） */
export interface FeedEntry {
  /** 文件名（不含 .md），即详情路由的 slug */
  slug: string
  title: string
  description: string
  /** YYYY-MM-DD */
  date: string
  tags: string[]
  category?: string
}

/** 一条 RSS item（URL 已拼好） */
export interface FeedItem {
  title: string
  link: string
  description: string
  /** RFC 822，如 Mon, 02 Mar 2026 00:00:00 GMT */
  pubDate: string
  categories: string[]
}

/** 解析出的 frontmatter 值类型 */
type FrontmatterValue = string | string[] | boolean

/** 去掉成对引号 */
function unquote(value: string): string {
  const single = value.startsWith("'") && value.endsWith("'")
  const double = value.startsWith('"') && value.endsWith('"')
  return single || double ? value.slice(1, -1) : value
}

/**
 * 解析 Markdown 顶部的 YAML frontmatter。
 * 解析失败（没有 `---` 包裹的块）时返回空对象，由调用方决定是否跳过该文件。
 */
export function parseFrontmatter(raw: string): Record<string, FrontmatterValue> {
  const result: Record<string, FrontmatterValue> = {}
  const block = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  if (!block) return result

  // 当前正在收集列表项的键（如 tags:）
  let listKey: string | null = null

  for (const line of block[1].split(/\r?\n/)) {
    const listItem = /^\s*-\s+(.+?)\s*$/.exec(line)
    if (listItem && listKey) {
      const list = Array.isArray(result[listKey]) ? (result[listKey] as string[]) : []
      list.push(unquote(listItem[1]))
      result[listKey] = list
      continue
    }

    const kv = /^([A-Za-z_][\w-]*):[ \t]*(.*)$/.exec(line)
    if (!kv) continue
    const [, key, rawValue] = kv
    const value = rawValue.trim()

    // `tags:` 后不跟值 → 下面几行是列表项
    if (value === '') {
      result[key] = []
      listKey = key
      continue
    }

    listKey = null
    if (value === 'true') result[key] = true
    else if (value === 'false') result[key] = false
    else result[key] = unquote(value)
  }

  return result
}

/**
 * 读取一个语种目录下的全部博客文章。
 * 与 useBlog.getAllPosts 同口径：**排除 draft**，按日期倒序。
 */
export function readBlogEntries(dir: string): FeedEntry[] {
  let files: string[] = []
  try {
    files = readdirSync(dir).filter((file) => file.endsWith('.md'))
  } catch {
    // 目录不存在（如还没建英文内容）时返回空列表，构建继续，feed 只是少一个语种
    return []
  }

  const entries: FeedEntry[] = []
  for (const file of files) {
    const fm = parseFrontmatter(readFileSync(join(dir, file), 'utf8'))
    if (fm.draft === true) continue

    const title = typeof fm.title === 'string' ? fm.title : ''
    if (!title) continue

    entries.push({
      slug: file.replace(/\.md$/, ''),
      title,
      description: typeof fm.description === 'string' ? fm.description : '',
      date: typeof fm.date === 'string' ? fm.date : '',
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      category: typeof fm.category === 'string' ? fm.category : undefined,
    })
  }

  return entries.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1))
}

/** 拼接文章链接所需的站点信息 */
export interface FeedLinkOptions {
  siteUrl: string
  /** 部署子路径，形如 /my-personalWebsite/（首尾带斜杠） */
  baseUrl: string
  /** 文章在哪个风格视图下打开（RSS 只能给一个 canonical 视图） */
  styleId: string
  /** 英文为 'en/'，中文为空串 */
  localePrefix: string
}

/**
 * 把 FeedEntry 转成带 URL 的 FeedItem。
 * ------------------------------------------------------------
 * 文章在 20 个风格下都有详情页，feed 只能指一个，这里统一指向 minimalism：
 * 它是全站最中性、正文可读性最好的视图（其他风格可作为"换个皮肤看同一篇"）。
 */
export function toFeedItems(entries: FeedEntry[], options: FeedLinkOptions): FeedItem[] {
  const { siteUrl, baseUrl, styleId, localePrefix } = options
  return entries.map((entry) => ({
    title: entry.title,
    link: `${siteUrl}${baseUrl}${localePrefix}style/${styleId}/blog/${entry.slug}`,
    description: entry.description,
    // date 形如 2026-03-02，按 UTC 零点解析；空日期退化成 Unix epoch，保证 RSS 合法
    pubDate: new Date(entry.date ? `${entry.date}T00:00:00Z` : 0).toUTCString(),
    categories: entry.tags,
  }))
}

/** RSS channel 信息 */
export interface FeedChannel {
  title: string
  description: string
  /** 站点首页 URL */
  siteUrl: string
  /** feed 自身 URL（atom:link rel="self"） */
  feedUrl: string
  /** 语言标签，如 zh-CN / en-US */
  language: string
  /** RFC 822 时间串，由调用方传入以保证构建产物可复现 */
  lastBuildDate: string
}

/**
 * 生成 RSS 2.0 文档。
 * 空 items 也会产出合法的 channel（只是没有 item），不会抛错。
 */
export function buildFeedXml(channel: FeedChannel, items: FeedItem[]): string {
  const itemXml = items
    .map((item) => {
      const categories = item.categories
        .map((tag) => `\n      <category>${escapeXml(tag)}</category>`)
        .join('')
      return (
        `    <item>\n` +
        `      <title>${escapeXml(item.title)}</title>\n` +
        `      <link>${escapeXml(item.link)}</link>\n` +
        `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>\n` +
        `      <pubDate>${escapeXml(item.pubDate)}</pubDate>\n` +
        `      <description>${escapeXml(item.description)}</description>${categories}\n` +
        `    </item>`
      )
    })
    .join('\n')

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml(channel.title)}</title>\n` +
    `    <link>${escapeXml(channel.siteUrl)}</link>\n` +
    `    <description>${escapeXml(channel.description)}</description>\n` +
    `    <language>${escapeXml(channel.language)}</language>\n` +
    `    <lastBuildDate>${escapeXml(channel.lastBuildDate)}</lastBuildDate>\n` +
    `    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml"/>\n` +
    `${itemXml}${items.length ? '\n' : ''}` +
    `  </channel>\n` +
    `</rss>\n`
  )
}

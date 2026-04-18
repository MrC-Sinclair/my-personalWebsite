/**
 * @file 博客相关类型定义
 * @description 定义博客文章数据模型、列表查询参数和分页结果类型，
 *              与 content.config.ts 中 blogZh/blogEn collection 的 Zod schema 对应。
 */

/** 博客文章数据模型 */
export interface BlogPost {
  /** 文章标题 */
  title: string
  /** 文章摘要/简介（用于列表页展示和 SEO description） */
  description?: string
  /** 发布日期（ISO 8601 格式，如 "2026-01-15"） */
  date: string
  /** 最后更新日期（ISO 8601 格式） */
  updated?: string
  /** 封面图片路径（相对 public/ 目录或绝对 URL） */
  image?: string
  /** 文章标签列表（用于分类筛选和 SEO） */
  tags: string[]
  /** 文章所属分类（如 "前端"、"后端"） */
  category?: string
  /** 是否为草稿（true = 不在前台列表中显示） */
  draft: boolean
  /** 文件系统路径（由 @nuxt/content 自动生成，如 "/blog/zh/getting-started"） */
  path: string
  /** Markdown 渲染后的 HTML 内容（仅在详情页加载时存在） */
  body?: string
}

/** 博客列表查询参数 */
export interface BlogListParams {
  /** 当前页码（从 1 开始） */
  page?: number
  /** 每页文章数量 */
  pageSize?: number
  /** 按标签筛选 */
  tag?: string
  /** 按分类筛选 */
  category?: string
}

/** 博客列表分页结果 */
export interface BlogListResult {
  /** 当前页的文章列表 */
  posts: BlogPost[]
  /** 文章总数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPages: number
}

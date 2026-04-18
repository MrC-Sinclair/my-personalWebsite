/**
 * @file 数据库 Schema 定义（预留）
 * @description 使用 Drizzle ORM 定义 PostgreSQL 数据库表结构。
 *              当前阶段为预留接口，实际数据仍通过 @nuxt/content Markdown 文件管理。
 *              未来迁移到 CMS 或数据库时，只需在 composables 层切换数据源即可。
 *
 * @see composables/useBlog.ts - 博客数据获取（当前从 Markdown 读取）
 * @see composables/useProjects.ts - 项目数据获取（当前从 Markdown 读取）
 */

import { pgTable, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core'

/** 博客文章表 */
export const posts = pgTable('posts', {
  /** 文章唯一标识 */
  id: varchar('id').primaryKey(),
  /** 文章标题 */
  title: varchar('title', { length: 255 }).notNull(),
  /** 文章摘要 */
  description: text('description'),
  /** 发布日期 */
  date: timestamp('date').notNull(),
  /** 最后更新日期 */
  updated: timestamp('updated'),
  /** 封面图片 URL */
  image: varchar('image', { length: 500 }),
  /** 标签列表（JSON 数组字符串存储） */
  tags: varchar('tags', { length: 1000 }).default('[]'),
  /** 文章分类 */
  category: varchar('category', { length: 100 }),
  /** 是否为草稿 */
  draft: boolean('draft').default(false),
  /** Markdown 正文内容 */
  content: text('content'),
  /** 语言标识（如 "zh"、"en"） */
  locale: varchar('locale', { length: 10 }).notNull(),
})

/** 项目表 */
export const projects = pgTable('projects', {
  /** 项目唯一标识 */
  id: varchar('id').primaryKey(),
  /** 项目名称 */
  title: varchar('title', { length: 255 }).notNull(),
  /** 项目描述 */
  description: text('description'),
  /** 项目创建/发布日期 */
  date: timestamp('date').notNull(),
  /** 封面图片 URL */
  image: varchar('image', { length: 500 }),
  /** 技术栈标签列表（JSON 数组字符串存储） */
  tags: varchar('tags', { length: 1000 }).default('[]'),
  /** 在线演示地址 */
  demoUrl: varchar('demo_url', { length: 500 }),
  /** GitHub 仓库地址 */
  githubUrl: varchar('github_url', { length: 500 }),
  /** 是否为精选项目 */
  featured: boolean('featured').default(false),
  /** Markdown 正文内容 */
  content: text('content'),
  /** 语言标识（如 "zh"、"en"） */
  locale: varchar('locale', { length: 10 }).notNull(),
})

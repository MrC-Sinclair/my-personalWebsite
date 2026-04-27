/**
 * @file @nuxt/content v3 内容集合定义
 * @description 使用 defineCollection + Zod schema 定义 Markdown 内容的结构化约束。
 *              按语言分离 collection，支持中英文双语内容管理。
 *              每种内容类型（博客/项目）分别定义中文和英文两个 collection。
 *
 * @see types/blog.ts - BlogPost 类型定义（与 blogZh/blogEn schema 对应）
 * @see types/project.ts - Project 类型定义（与 projectsZh/projectsEn schema 对应）
 */

import { defineContentConfig, defineCollection, z } from '@nuxt/content'

const blogSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  draft: z.boolean().default(false),
})

const projectSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  demoUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  featured: z.boolean().default(false),
})

export default defineContentConfig({
  collections: {
    /** 中文博客文章集合 */
    blogZh: defineCollection({
      type: 'page',
      source: 'blog/zh/**/*.md',
      schema: blogSchema,
    }),

    /** 英文博客文章集合 */
    blogEn: defineCollection({
      type: 'page',
      source: 'blog/en/**/*.md',
      schema: blogSchema,
    }),

    /** 中文项目集合 */
    projectsZh: defineCollection({
      type: 'page',
      source: 'projects/zh/**/*.md',
      schema: projectSchema,
    }),

    /** 英文项目集合 */
    projectsEn: defineCollection({
      type: 'page',
      source: 'projects/en/**/*.md',
      schema: projectSchema,
    }),
  },
})

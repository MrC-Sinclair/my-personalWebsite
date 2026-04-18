/**
 * @file 项目相关类型定义
 * @description 定义项目数据模型，与 content.config.ts 中 projectsZh/projectsEn collection 的 Zod schema 对应。
 */

/** 项目数据模型 */
export interface Project {
  /** 项目名称 */
  title: string
  /** 项目简要描述（用于卡片展示） */
  description?: string
  /** 项目创建/发布日期（ISO 8601 格式） */
  date: string
  /** 项目封面图/截图路径 */
  image?: string
  /** 技术栈标签列表（如 ["Vue.js", "TypeScript", "Nuxt"]） */
  tags: string[]
  /** 在线演示地址 */
  demoUrl?: string
  /** GitHub 仓库地址 */
  githubUrl?: string
  /** 是否为精选项目（精选项目在首页展示） */
  featured: boolean
  /** 文件系统路径（由 @nuxt/content 自动生成） */
  path: string
  /** Markdown 渲染后的 HTML 内容（仅在详情页加载时存在） */
  body?: string
}

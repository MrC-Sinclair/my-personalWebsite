/**
 * @file 站点配置相关类型定义
 * @description 定义站点全局配置、社交链接、导航项、技能分组和时间线条目的数据模型。
 */

/** 站点全局配置 */
export interface SiteConfig {
  /** 站点名称（显示在导航栏 Logo 和页面标题） */
  name: string
  /** 站点描述（用于 SEO meta description） */
  description: string
  /** 站点 URL（用于生成 sitemap 和 OG 链接） */
  url: string
  /** 作者姓名 */
  author: string
  /** 联系邮箱 */
  email: string
  /** 社交媒体链接 */
  social: SocialLinks
}

/** 社交媒体链接 */
export interface SocialLinks {
  /** GitHub 主页地址 */
  github: string
  /** Twitter/X 主页地址 */
  twitter: string
  /** LinkedIn 主页地址 */
  linkedin: string
  /** 微信号（显示在联系页面） */
  wechat: string
}

/** 导航栏菜单项 */
export interface NavItem {
  /** 菜单项显示文本 */
  label: string
  /** 路由路径（如 "/blog"） */
  to: string
  /** 图标类名（可选，如 "i-heroicons-home"） */
  icon?: string
}

/** 技能分组（按类别展示技能标签） */
export interface SkillGroup {
  /** 技能类别名称（如 "前端"、"后端"） */
  category: string
  /** 该类别下的技能列表 */
  skills: string[]
}

/** 时间线条目（用于工作/教育经历展示） */
export interface TimelineItem {
  /** 职位/学位名称 */
  title: string
  /** 公司/学校名称 */
  organization: string
  /** 时间段描述（如 "2022 - 至今"） */
  period: string
  /** 经历详细描述 */
  description: string
}

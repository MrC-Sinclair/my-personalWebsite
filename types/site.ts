export interface SiteConfig {
  name: string
  description: string
  url: string
  author: string
  email: string
  social: SocialLinks
}

export interface SocialLinks {
  github: string
  twitter: string
  linkedin: string
  wechat: string
}

export interface NavItem {
  label: string
  to: string
  icon?: string
}

export interface SkillGroup {
  category: string
  skills: string[]
}

export interface TimelineItem {
  title: string
  organization: string
  period: string
  description: string
}

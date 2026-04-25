/**
 * @file 站点信息组合式函数
 * @description 提供站点全局配置、导航菜单、技能分组和工作/教育时间线数据。
 *              所有数据通过 useI18n 实现国际化，切换语言时自动更新。
 *              站点配置（名称、社交链接等）为静态数据，后续可迁移到数据库或环境变量。
 */

import type { SiteConfig, NavItem, SkillGroup, TimelineItem, SocialLinkItem } from '~/types/site'

export function useAppInfo() {
  const { t } = useI18n()

  const siteConfig = computed<SiteConfig>(() => ({
    name: t('home.name'),
    description: t('home.description'),
    url: 'https://yourusername.github.io',
    author: t('footer.author'),
    email: 'your@email.com',
    social: {
      github: 'https://github.com/yourusername',
      twitter: 'https://twitter.com/yourusername',
      linkedin: 'https://linkedin.com/in/yourusername',
      wechat: 'c2256843428',
    },
  }))

  const socialLinks = computed<SocialLinkItem[]>(() => [
    { name: 'GitHub', url: siteConfig.value.social.github, icon: 'i-simple-icons-github' },
    { name: 'Twitter / X', url: siteConfig.value.social.twitter, icon: 'i-simple-icons-x' },
    { name: 'LinkedIn', url: siteConfig.value.social.linkedin, icon: 'i-simple-icons-linkedin' },
    {
      name: t('contact.wechat'),
      url: null,
      icon: 'i-simple-icons-wechat',
      value: siteConfig.value.social.wechat,
      qrCode: '/images/wechat-qr.png',
    },
  ])

  const navItems = computed<NavItem[]>(() => [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.blog'), to: '/blog' },
    { label: t('nav.projects'), to: '/projects' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.contact'), to: '/contact' },
  ])

  const skillGroups = computed<SkillGroup[]>(() => [
    {
      category: t('about.skillFrontend'),
      skills: ['Vue.js', 'Nuxt', 'React', 'TypeScript', 'Tailwind CSS'],
    },
    {
      category: t('about.skillBackend'),
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
    },
    {
      category: t('about.skillDevops'),
      skills: ['Docker', 'GitHub Actions', 'Linux', 'Nginx'],
    },
    {
      category: t('about.skillTools'),
      skills: ['Git', 'VS Code', 'Figma', 'Vitest'],
    },
  ])

  const timeline = computed<TimelineItem[]>(() => [
    {
      title: t('about.timeline1Title'),
      organization: t('about.timeline1Org'),
      period: t('about.timeline1Period'),
      description: t('about.timeline1Desc'),
    },
    {
      title: t('about.timeline2Title'),
      organization: t('about.timeline2Org'),
      period: t('about.timeline2Period'),
      description: t('about.timeline2Desc'),
    },
    {
      title: t('about.timeline3Title'),
      organization: t('about.timeline3Org'),
      period: t('about.timeline3Period'),
      description: t('about.timeline3Desc'),
    },
  ])

  return {
    siteConfig,
    socialLinks,
    navItems,
    skillGroups,
    timeline,
  }
}

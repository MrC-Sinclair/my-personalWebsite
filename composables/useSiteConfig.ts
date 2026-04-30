/**
 * @file 站点信息组合式函数
 * @description 提供站点全局配置、导航菜单、技能分组和工作/教育时间线数据。
 *              所有数据通过 useI18n 实现国际化，切换语言时自动更新。
 *              站点配置（名称、社交链接等）为静态数据，后续可迁移到数据库或环境变量。
 */

import type { SiteConfig, NavItem, SkillGroup, TimelineItem, SocialLinkItem } from '~/types/site'
import IconFeishu from '~/components/icon/IconFeishu.vue'

export function useAppInfo() {
  const { t } = useI18n()
  const {
    app: { baseURL },
  } = useRuntimeConfig()

  const siteConfig = computed<SiteConfig>(() => ({
    name: t('home.name'),
    description: t('home.description'),
    url: 'https://yourusername.github.io',
    author: t('footer.author'),
    email: 'your@email.com',
    social: {
      github: 'https://github.com/MrC-Sinclair',
      dingtalk: '钉钉',
      feishu: '飞书',
      wechat: 'c2256843428',
    },
  }))

  const socialLinks = computed<SocialLinkItem[]>(() => [
    { name: 'GitHub', url: siteConfig.value.social.github, icon: 'i-simple-icons-github' },
    {
      name: t('contact.dingtalk'),
      url: null,
      icon: 'i-tabler-brand-dingtalk',
      qrCode: `${baseURL}images/dingding-qr.jpg`,
    },
    {
      name: t('contact.feishu'),
      url: null,
      customIcon: IconFeishu,
      qrCode: `${baseURL}images/feishu-qr.jpg`,
    },
    {
      name: t('contact.wechat'),
      url: null,
      icon: 'i-simple-icons-wechat',
      value: siteConfig.value.social.wechat,
      qrCode: `${baseURL}images/wechat-qr.png`,
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
      skills: ['Vue', 'React', 'Nuxt', 'Next', 'UniApp', 'ECharts', 'D3.js', 'qiankun'],
    },
    {
      category: t('about.skillBackend'),
      skills: ['Node.js', 'PostgreSQL + Drizzle', 'SSE'],
    },
    {
      category: t('about.skillDevops'),
      skills: ['Docker', 'GitHub Actions'],
    },
    {
      category: t('about.skillTools'),
      skills: ['Git', 'Figma'],
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
    {
      title: t('about.timeline4Title'),
      organization: t('about.timeline4Org'),
      period: t('about.timeline4Period'),
      description: t('about.timeline4Desc'),
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

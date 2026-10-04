/**
 * @file 站点信息组合式函数
 * @description 提供站点全局配置、导航菜单、技能分组和工作/教育时间线数据。
 *              所有数据通过 useI18n 实现国际化，切换语言时自动更新。
 *              站点配置（名称、社交链接等）为静态数据，后续可迁移到数据库或环境变量。
 */

import type { SiteConfig, SkillGroup, TimelineItem, SocialLinkItem } from '~/types/site'

export function useAppInfo() {
  const { t } = useI18n()
  const {
    app: { baseURL },
    public: { siteUrl },
  } = useRuntimeConfig()

  const siteConfig = computed<SiteConfig>(() => ({
    name: t('home.name'),
    description: t('home.description'),
    // 站点地址不再硬编码：与 canonical / og:url 同源（runtimeConfig.public.siteUrl）。
    // 这里原先写的是 https://yourusername.github.io 这种占位值，属于假数据。
    url: String(siteUrl || ''),
    author: t('footer.author'),
    // 站内不展示邮箱（联系页走社交二维码与留言表单），因此留空而不是填假的
    // your@email.com。将来要展示邮箱时，在这里填真实地址即可。
    email: '',
    social: {
      github: 'https://github.com/MrC-Sinclair',
      // 钉钉/飞书没有可点的主页链接（只有二维码），故留空；
      // 二维码路径在下面的 socialLinks 里拼。原先这里填的是「钉钉」「飞书」
      // 这种中文名，与「social 装 URL」的语义不符。
      dingtalk: '',
      feishu: '',
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
      icon: 'i-simple-icons-feishu',
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
    skillGroups,
    timeline,
  }
}

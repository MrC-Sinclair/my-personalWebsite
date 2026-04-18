import type { SiteConfig, NavItem, SocialLinks, SkillGroup, TimelineItem } from '~/types/site'

export function useAppInfo() {
  const { t } = useI18n()

  const siteConfig: SiteConfig = {
    name: '我的个人网站',
    description: '技术博客、项目作品集、关于我',
    url: 'https://yourusername.github.io',
    author: '开发者',
    email: 'your@email.com',
    social: {
      github: 'https://github.com/yourusername',
      twitter: 'https://twitter.com/yourusername',
      linkedin: 'https://linkedin.com/in/yourusername',
      wechat: 'your-wechat-id',
    },
  }

  const navItems = computed<NavItem[]>(() => [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.blog'), to: '/blog' },
    { label: t('nav.projects'), to: '/projects' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.contact'), to: '/contact' },
  ])

  const skillGroups = computed<SkillGroup[]>(() => [
    {
      category: '前端',
      skills: ['Vue.js', 'Nuxt', 'React', 'TypeScript', 'Tailwind CSS'],
    },
    {
      category: '后端',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
    },
    {
      category: 'DevOps',
      skills: ['Docker', 'GitHub Actions', 'Linux', 'Nginx'],
    },
    {
      category: '工具',
      skills: ['Git', 'VS Code', 'Figma', 'Vitest'],
    },
  ])

  const timeline = computed<TimelineItem[]>(() => [
    {
      title: '高级前端工程师',
      organization: '某科技公司',
      period: '2022 - 至今',
      description: '负责公司核心产品的前端架构设计与开发，推动技术栈升级与团队规范建设。',
    },
    {
      title: '前端工程师',
      organization: '某互联网公司',
      period: '2020 - 2022',
      description: '参与多个 Web 应用的开发与维护，积累了丰富的前端工程化经验。',
    },
    {
      title: '计算机科学学士',
      organization: '某大学',
      period: '2016 - 2020',
      description: '主修计算机科学与技术，参与多个学术项目和编程竞赛。',
    },
  ])

  return {
    siteConfig,
    navItems,
    skillGroups,
    timeline,
  }
}

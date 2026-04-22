/**
 * @file 站点信息组合式函数
 * @description 提供站点全局配置、导航菜单、技能分组和工作/教育时间线数据。
 *              所有数据通过 useI18n 实现国际化，切换语言时自动更新。
 *              站点配置（名称、社交链接等）为静态数据，后续可迁移到数据库或环境变量。
 */

import type { SiteConfig, NavItem, SkillGroup, TimelineItem } from '~/types/site'

/**
 * 站点信息组合式函数
 *
 * @returns 站点配置、导航项、技能分组和时间线数据
 *
 * @example
 * ```vue
 * <script setup>
 * const { siteConfig, navItems, skillGroups, timeline } = useAppInfo()
 * </script>
 *
 * <template>
 *   <span>{{ siteConfig.name }}</span>
 *   <nav>
 *     <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to">
 *       {{ item.label }}
 *     </NuxtLink>
 *   </nav>
 * </template>
 * ```
 */
export function useAppInfo() {
  const { t } = useI18n()

  /** 站点全局配置（国际化响应式，后续可迁移到 .env 或 CMS） */
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
      wechat: 'your-wechat-id',
    },
  }))

  /** 导航菜单项（国际化响应式） */
  const navItems = computed<NavItem[]>(() => [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.blog'), to: '/blog' },
    { label: t('nav.projects'), to: '/projects' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.contact'), to: '/contact' },
  ])

  /** 技能分组数据（国际化响应式，用于关于页面展示） */
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

  /** 工作/教育时间线数据（国际化响应式，用于关于页面展示） */
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

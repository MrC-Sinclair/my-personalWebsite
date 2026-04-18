/**
 * @file 项目内容获取组合式函数
 * @description 封装所有项目相关的数据获取逻辑，通过 @nuxt/content v3 的 queryCollection 接口
 *              读取 Markdown 文件。支持中英文双语，根据当前语言环境自动切换 collection。
 *              组件内不直接调用 content API，统一通过此 composable 获取数据。
 */

import type { Project } from '~/types/project'

/**
 * 项目内容获取组合式函数
 *
 * @returns 项目操作方法集合
 *
 * @example
 * ```vue
 * <script setup>
 * const { getAllProjects, getFeaturedProjects } = useProjects()
 * const projects = await getAllProjects()
 * const featured = await getFeaturedProjects(3)
 * </script>
 * ```
 */
export function useProjects() {
  const { locale } = useI18n()

  /** 根据当前语言环境计算对应的 collection 名称 */
  const collectionName = computed(() => {
    return locale.value === 'zh' ? 'projectsZh' : 'projectsEn'
  })

  /**
   * 获取所有项目（按日期倒序）
   *
   * @returns 项目列表，按创建日期从新到旧排列
   */
  async function getAllProjects(): Promise<Project[]> {
    const collection = collectionName.value
    const data = await queryCollection(collection).order('date', 'DESC').all()

    return data.map((item) => mapToProject(item))
  }

  /**
   * 根据 slug 获取单个项目
   *
   * @param slug - 项目路径标识符（如 "personal-website"）
   * @returns 项目对象，未找到时返回 null
   */
  async function getProjectBySlug(slug: string): Promise<Project | null> {
    const collection = collectionName.value
    const path = locale.value === 'zh' ? `/projects/zh/${slug}` : `/projects/en/${slug}`
    const data = await queryCollection(collection).path(path).first()

    return data ? mapToProject(data) : null
  }

  /**
   * 获取精选项目
   *
   * 筛选 featured: true 的项目，取前 N 个，用于首页展示。
   *
   * @param limit - 返回项目数量上限，默认 3
   * @returns 精选项目列表
   */
  async function getFeaturedProjects(limit: number = 3): Promise<Project[]> {
    const projects = await getAllProjects()
    return projects.filter((p) => p.featured).slice(0, limit)
  }

  /**
   * 将 @nuxt/content 返回的原始数据映射为 Project 类型
   *
   * @param item - @nuxt/content queryCollection 返回的原始数据对象
   * @returns 标准化的 Project 对象
   */
  function mapToProject(item: Record<string, unknown>): Project {
    return {
      title: (item.title as string) || '',
      description: item.description as string | undefined,
      date: (item.date as string) || '',
      image: item.image as string | undefined,
      tags: (item.tags as string[]) || [],
      demoUrl: item.demoUrl as string | undefined,
      githubUrl: item.githubUrl as string | undefined,
      featured: (item.featured as boolean) || false,
      path: (item.path as string) || '',
    }
  }

  return {
    getAllProjects,
    getProjectBySlug,
    getFeaturedProjects,
  }
}

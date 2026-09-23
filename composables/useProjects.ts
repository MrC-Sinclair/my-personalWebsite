/**
 * @file 项目内容获取组合式函数
 * @description 封装所有项目相关的数据获取逻辑，通过 @nuxt/content v3 的 queryCollection 接口
 *              读取 Markdown 文件。支持中英文双语，根据当前语言环境自动切换 collection。
 *              组件内不直接调用 content API，统一通过此 composable 获取数据。
 */

import type { Project } from '~/types/project'
// content v3 为各 collection 生成的 item 类型（声明在 @nuxt/content 模块内部，需显式导入）
import type { ProjectsZhCollectionItem, ProjectsEnCollectionItem } from '@nuxt/content'

/** content v3 为两个语种 collection 生成的 item 类型（同 useBlog 的处理方式） */
type ProjectContentItem = ProjectsZhCollectionItem | ProjectsEnCollectionItem

export function useProjects() {
  const { locale } = useI18n()

  const collectionName = computed(() => {
    return locale.value === 'zh' ? 'projectsZh' : 'projectsEn'
  })

  const projectsCache = ref<Project[] | null>(null)

  async function getAllProjects(): Promise<Project[]> {
    if (projectsCache.value) return projectsCache.value

    try {
      const collection = collectionName.value
      const data = await queryCollection(collection).order('date', 'DESC').all()
      const projects = data.map((item) => mapToProject(item))
      projectsCache.value = projects
      return projects
    } catch (error) {
      console.error('获取项目列表失败:', error)
      return []
    }
  }

  async function getProjectBySlug(
    slug: string,
  ): Promise<{ project: Project | null; content: ProjectContentItem | null }> {
    try {
      const collection = collectionName.value
      const contentPath = locale.value === 'zh' ? `/projects/zh/${slug}` : `/projects/en/${slug}`
      const data = await queryCollection(collection).path(contentPath).first()

      if (!data) return { project: null, content: null }
      return { project: mapToProject(data), content: data }
    } catch (error) {
      console.error('获取项目详情失败:', error)
      return { project: null, content: null }
    }
  }

  async function getFeaturedProjects(limit: number = 3): Promise<Project[]> {
    const projects = await getAllProjects()
    return projects.filter((p) => p.featured).slice(0, limit)
  }

  function mapToProject(item: ProjectContentItem): Project {
    return {
      title: item.title || '',
      description: item.description,
      date: item.date || '',
      image: item.image,
      tags: Array.isArray(item.tags) ? item.tags : [],
      demoUrl: item.demoUrl,
      githubUrl: item.githubUrl,
      featured: item.featured || false,
      path: item.path || '',
    }
  }

  watch(locale, () => {
    projectsCache.value = null
  })

  return {
    getAllProjects,
    getProjectBySlug,
    getFeaturedProjects,
  }
}

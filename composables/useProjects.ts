import type { Project } from '~/types/project'

export function useProjects() {
  const { locale } = useI18n()

  const collectionName = computed(() => {
    return locale.value === 'zh' ? 'projectsZh' : 'projectsEn'
  })

  async function getAllProjects(): Promise<Project[]> {
    const collection = collectionName.value
    const data = await queryCollection(collection).order('date', 'DESC').all()

    return data.map((item) => mapToProject(item))
  }

  async function getProjectBySlug(slug: string): Promise<Project | null> {
    const collection = collectionName.value
    const path = locale.value === 'zh' ? `/projects/zh/${slug}` : `/projects/en/${slug}`
    const data = await queryCollection(collection).path(path).first()

    return data ? mapToProject(data) : null
  }

  async function getFeaturedProjects(limit: number = 3): Promise<Project[]> {
    const projects = await getAllProjects()
    return projects.filter((p) => p.featured).slice(0, limit)
  }

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

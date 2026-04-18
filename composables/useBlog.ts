import type { BlogPost, BlogListParams, BlogListResult } from '~/types/blog'

export function useBlog() {
  const { locale } = useI18n()

  const collectionName = computed(() => {
    return locale.value === 'zh' ? 'blogZh' : 'blogEn'
  })

  async function getAllPosts(): Promise<BlogPost[]> {
    const collection = collectionName.value
    const data = await queryCollection(collection).order('date', 'DESC').all()

    return data
      .filter((item) => !item.draft)
      .map((item) => mapToBlogPost(item))
  }

  async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const collection = collectionName.value
    const path = locale.value === 'zh' ? `/blog/zh/${slug}` : `/blog/en/${slug}`
    const data = await queryCollection(collection).path(path).first()

    return data ? mapToBlogPost(data) : null
  }

  async function getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
    const posts = await getAllPosts()
    return posts.slice(0, limit)
  }

  async function getPostsByTag(tag: string): Promise<BlogPost[]> {
    const posts = await getAllPosts()
    return posts.filter((post) => post.tags.includes(tag))
  }

  async function getPostsByCategory(category: string): Promise<BlogPost[]> {
    const posts = await getAllPosts()
    return posts.filter((post) => post.category === category)
  }

  async function getAllTags(): Promise<string[]> {
    const posts = await getAllPosts()
    const tagSet = new Set<string>()
    posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }

  async function getAllCategories(): Promise<string[]> {
    const posts = await getAllPosts()
    const categorySet = new Set<string>()
    posts.forEach((post) => {
      if (post.category) categorySet.add(post.category)
    })
    return Array.from(categorySet).sort()
  }

  async function getPaginatedPosts(params: BlogListParams = {}): Promise<BlogListResult> {
    const { page = 1, pageSize = 9, tag, category } = params
    let posts = await getAllPosts()

    if (tag) {
      posts = posts.filter((post) => post.tags.includes(tag))
    }
    if (category) {
      posts = posts.filter((post) => post.category === category)
    }

    const total = posts.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const paginatedPosts = posts.slice(start, start + pageSize)

    return {
      posts: paginatedPosts,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  function mapToBlogPost(item: Record<string, unknown>): BlogPost {
    return {
      title: (item.title as string) || '',
      description: item.description as string | undefined,
      date: (item.date as string) || '',
      updated: item.updated as string | undefined,
      image: item.image as string | undefined,
      tags: (item.tags as string[]) || [],
      category: item.category as string | undefined,
      draft: (item.draft as boolean) || false,
      path: (item.path as string) || '',
    }
  }

  return {
    getAllPosts,
    getPostBySlug,
    getFeaturedPosts,
    getPostsByTag,
    getPostsByCategory,
    getAllTags,
    getAllCategories,
    getPaginatedPosts,
  }
}

/**
 * @file 博客内容获取组合式函数
 * @description 封装所有博客相关的数据获取逻辑，通过 @nuxt/content v3 的 queryCollection 接口
 *              读取 Markdown 文件。支持中英文双语，根据当前语言环境自动切换 collection。
 *              组件内不直接调用 content API，统一通过此 composable 获取数据，
 *              确保未来从 Markdown 迁移到数据库时只需修改此中间层。
 */

import type { BlogPost, BlogListParams, BlogListResult } from '~/types/blog'
// content v3 为各 collection 生成的 item 类型（声明在 @nuxt/content 模块内部，需显式导入）
import type { BlogZhCollectionItem, BlogEnCollectionItem } from '@nuxt/content'

/**
 * content v3 为两个语种的 collection 生成的 item 类型。
 * 之前 mapToBlogPost 的入参写成 Record<string, unknown>，与真实 collection item
 * 不兼容（item 没有索引签名），只能靠一堆 as 断言绕过——改成真实类型后
 * 字段访问本身就是类型安全的，断言可以全部去掉。
 */
type BlogContentItem = BlogZhCollectionItem | BlogEnCollectionItem

export function useBlog() {
  const { locale } = useI18n()

  const collectionName = computed(() => {
    return locale.value === 'zh' ? 'blogZh' : 'blogEn'
  })

  const postsCache = ref<BlogPost[] | null>(null)

  async function getAllPosts(): Promise<BlogPost[]> {
    if (postsCache.value) return postsCache.value

    try {
      const collection = collectionName.value
      const data = await queryCollection(collection).order('date', 'DESC').all()
      const posts = data.filter((item) => !item.draft).map((item) => mapToBlogPost(item))
      postsCache.value = posts
      return posts
    } catch (error) {
      console.error('获取博客文章失败:', error)
      return []
    }
  }

  async function getPostBySlug(
    slug: string,
  ): Promise<{ post: BlogPost | null; content: BlogContentItem | null }> {
    try {
      const collection = collectionName.value
      const contentPath = locale.value === 'zh' ? `/blog/zh/${slug}` : `/blog/en/${slug}`
      const data = await queryCollection(collection).path(contentPath).first()

      if (!data) return { post: null, content: null }
      return { post: mapToBlogPost(data), content: data }
    } catch (error) {
      console.error('获取博客文章详情失败:', error)
      return { post: null, content: null }
    }
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

  function mapToBlogPost(item: BlogContentItem): BlogPost {
    return {
      title: item.title || '',
      description: item.description,
      date: item.date || '',
      updated: item.updated,
      image: item.image,
      tags: Array.isArray(item.tags) ? item.tags : [],
      category: item.category,
      draft: item.draft || false,
      path: item.path || '',
    }
  }

  watch(locale, () => {
    postsCache.value = null
  })

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

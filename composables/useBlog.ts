/**
 * @file 博客内容获取组合式函数
 * @description 封装所有博客相关的数据获取逻辑，通过 @nuxt/content v3 的 queryCollection 接口
 *              读取 Markdown 文件。支持中英文双语，根据当前语言环境自动切换 collection。
 *              组件内不直接调用 content API，统一通过此 composable 获取数据，
 *              确保未来从 Markdown 迁移到数据库时只需修改此中间层。
 */

import type { BlogPost, BlogListParams, BlogListResult } from '~/types/blog'

/**
 * 博客内容获取组合式函数
 *
 * @returns 博客操作方法集合
 *
 * @example
 * ```vue
 * <script setup>
 * const { getAllPosts, getPostBySlug, getFeaturedPosts } = useBlog()
 * const posts = await getAllPosts()
 * const post = await getPostBySlug('getting-started')
 * const featured = await getFeaturedPosts(3)
 * </script>
 * ```
 */
export function useBlog() {
  const { locale } = useI18n()

  /** 根据当前语言环境计算对应的 collection 名称 */
  const collectionName = computed(() => {
    return locale.value === 'zh' ? 'blogZh' : 'blogEn'
  })

  /**
   * 获取所有已发布的博客文章（按日期倒序）
   *
   * 自动过滤 draft: true 的草稿文章，仅返回已发布内容。
   *
   * @returns 文章列表，按发布日期从新到旧排列
   */
  async function getAllPosts(): Promise<BlogPost[]> {
    const collection = collectionName.value
    const data = await queryCollection(collection).order('date', 'DESC').all()

    return data.filter((item) => !item.draft).map((item) => mapToBlogPost(item))
  }

  /**
   * 根据 slug 获取单篇博客文章
   *
   * @param slug - 文章路径标识符（如 "getting-started"）
   * @returns 文章对象，未找到时返回 null
   */
  async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const collection = collectionName.value
    const path = locale.value === 'zh' ? `/blog/zh/${slug}` : `/blog/en/${slug}`
    const data = await queryCollection(collection).path(path).first()

    return data ? mapToBlogPost(data) : null
  }

  /**
   * 获取精选/最新博客文章
   *
   * 从所有已发布文章中取前 N 篇，用于首页展示。
   *
   * @param limit - 返回文章数量上限，默认 3
   * @returns 最新的 N 篇文章
   */
  async function getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
    const posts = await getAllPosts()
    return posts.slice(0, limit)
  }

  /**
   * 按标签筛选博客文章
   *
   * @param tag - 标签名称（精确匹配）
   * @returns 包含该标签的文章列表
   */
  async function getPostsByTag(tag: string): Promise<BlogPost[]> {
    const posts = await getAllPosts()
    return posts.filter((post) => post.tags.includes(tag))
  }

  /**
   * 按分类筛选博客文章
   *
   * @param category - 分类名称（精确匹配）
   * @returns 属于该分类的文章列表
   */
  async function getPostsByCategory(category: string): Promise<BlogPost[]> {
    const posts = await getAllPosts()
    return posts.filter((post) => post.category === category)
  }

  /**
   * 获取所有文章标签（去重排序）
   *
   * @returns 标签名称列表，按字母顺序排列
   */
  async function getAllTags(): Promise<string[]> {
    const posts = await getAllPosts()
    const tagSet = new Set<string>()
    posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }

  /**
   * 获取所有文章分类（去重排序）
   *
   * @returns 分类名称列表，按字母顺序排列
   */
  async function getAllCategories(): Promise<string[]> {
    const posts = await getAllPosts()
    const categorySet = new Set<string>()
    posts.forEach((post) => {
      if (post.category) categorySet.add(post.category)
    })
    return Array.from(categorySet).sort()
  }

  /**
   * 获取分页博客文章列表
   *
   * 支持按标签、分类筛选，并返回分页元数据。
   *
   * @param params - 分页查询参数
   * @param params.page - 当前页码（默认 1）
   * @param params.pageSize - 每页数量（默认 9）
   * @param params.tag - 按标签筛选（可选）
   * @param params.category - 按分类筛选（可选）
   * @returns 分页结果，包含文章列表和分页元数据
   */
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

  /**
   * 将 @nuxt/content 返回的原始数据映射为 BlogPost 类型
   *
   * @param item - @nuxt/content queryCollection 返回的原始数据对象
   * @returns 标准化的 BlogPost 对象
   */
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

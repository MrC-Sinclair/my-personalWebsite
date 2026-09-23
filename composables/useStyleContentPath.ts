/**
 * 风格内内容链接构造函数
 * ------------------------------------------------------------
 * 详情页搬进风格内之后（/style/<id>/blog/<slug>），各风格的卡片组件
 * 不能再硬编码 /blog/<slug>、/projects/<slug>——那两个路由已随过渡层
 * 删除，点进去是 404（2026-09-23 起成为全站死链）。
 *
 * 构造链接需要两件路由信息：当前风格 id 与当前语言前缀，都属于业务层，
 * 因此在这里统一实现，各风格组件只调用 postPath / projectPath，
 * 不必各自重复 useRoute() + useLocalePath() 的拼接逻辑。

 * 用法（模板里也能直接用，composables 自动导入）：
 *   const { postPath } = useStyleContentPath()
 *   <NuxtLink :to="postPath(contentSlug(post.path))">…</NuxtLink>
 */
export function useStyleContentPath() {
  const route = useRoute()
  const localePath = useLocalePath()

  /** 当前风格 id（/style/y2k/blog/xxx → 'y2k'） */
  const styleId = computed(() => String(route.params.style ?? ''))

  return {
    styleId,
    /** 文章详情：/style/<id>/blog/<slug>（带语言前缀） */
    postPath: (slug: string) => localePath(`/style/${styleId.value}/blog/${slug}`),
    /** 项目详情：/style/<id>/projects/<slug>（带语言前缀） */
    projectPath: (slug: string) => localePath(`/style/${styleId.value}/projects/${slug}`),
  }
}

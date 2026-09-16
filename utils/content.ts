/**
 * @file 内容路径工具 —— 多风格共享的唯一实现
 * @description @nuxt/content 返回的内容 path 形如 '/blog/zh/my-post.md'，
 *              而详情页路由需要裸 slug（'/blog/my-post'）。
 *              此前多个风格各自实现了一遍该推导（违反「业务动作只写一份」），
 *              现统一收敛到这里。详见 docs/architecture/multi-style-ui.md。
 */

/**
 * 从内容路径提取裸 slug（去掉目录与扩展名）
 *
 * @param path - @nuxt/content 的内容路径（如 '/blog/zh/my-post.md'）
 * @returns 裸 slug（如 'my-post'）
 *
 * @example
 * ```ts
 * contentSlug('/blog/zh/my-post.md')   // 'my-post'
 * contentSlug('/projects/en/app.yaml') // 'app'
 * contentSlug('my-post')               // 'my-post'
 * ```
 */
export function contentSlug(path: string): string {
  const segments = path.split('/')
  const last = segments[segments.length - 1] ?? ''
  return last.replace(/\.(md|yaml|yml|json|csv)$/i, '')
}

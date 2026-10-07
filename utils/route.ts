/**
 * @file 路由 query 读取工具 —— 多风格共享的唯一实现
 * @description 从 URL query 里安全地取出字符串参数。
 *
 * query 的值可能是 string、string[]（重复参数）或 undefined，
 * 各 composable 都想要「有就取第一个，没有就空串」这一语义。
 * 此前 useBlogFilters 内部私有实现了一份，搜索要复用同一语义，
 * 故抽到这里（「业务动作只写一份」）。
 */

/**
 * 读取 query 里的字符串参数（多值只取第一个）
 *
 * @param query - route.query（未知结构，逐项防御）
 * @param key - 参数名
 * @returns 字符串值；不存在或非字符串时返回空串
 */
export function readStringQuery(
  query: Record<string, unknown> | undefined,
  key: string,
): string {
  const value = query?.[key]
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return ''
}

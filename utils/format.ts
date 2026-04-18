/**
 * @file 通用工具函数
 * @description 提供日期格式化、阅读时长估算、URL slug 生成等通用工具函数。
 */

/**
 * 格式化日期字符串为本地化显示文本
 *
 * 支持中文和英文两种语言环境的日期格式化输出。
 *
 * @param dateString - 日期字符串（支持 ISO 8601 格式如 "2026-01-15"，或任何 Date 构造函数可解析的格式）
 * @param locale - BCP 47 语言标签，默认 "zh-CN"（中文），传入 "en-US" 可输出英文格式
 * @returns 格式化后的日期文本（如中文 "2026年1月15日"，英文 "January 15, 2026"）
 *
 * @example
 * ```ts
 * formatDate('2026-01-15')           // "2026年1月15日"
 * formatDate('2026-01-15', 'en-US')  // "January 15, 2026"
 * ```
 */
export function formatDate(dateString: string, locale: string = 'zh-CN'): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 估算文章阅读时长
 *
 * 分别统计中文字符数和英文单词数，合并计算总阅读时间。
 * 中文按字符计数，英文按空格分词计数。
 *
 * @param content - 文章纯文本内容（Markdown 或 HTML 均可，函数只提取文字部分）
 * @param wordsPerMinute - 阅读速度（每分钟字数），默认 200
 * @returns 估算阅读时长（分钟数，最小为 1）
 *
 * @example
 * ```ts
 * estimateReadingTime('这是一篇测试文章')  // 1
 * estimateReadingTime('Hello world test', 100)  // 1
 * ```
 */
export function estimateReadingTime(content: string, wordsPerMinute: number = 200): number {
  // 匹配中文字符（CJK 统一表意文字区间）
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  // 匹配英文单词（连续字母序列）
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length
  const totalWords = chineseChars + englishWords
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute))
}

/**
 * 将文本转换为 URL 安全的 slug 格式
 *
 * 将文本转为小写，非字母数字和中文字符替换为连字符，
 * 并去除首尾连字符。
 *
 * @param text - 原始文本（如文章标题）
 * @returns URL 安全的 slug 字符串
 *
 * @example
 * ```ts
 * slugify('Hello World')        // "hello-world"
 * slugify('Nuxt 3 入门教程')     // "nuxt-3-入门教程"
 * slugify('  --test--  ')       // "test"
 * ```
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      // 将非字母数字、非中文字符替换为连字符
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      // 去除首尾连字符
      .replace(/^-+|-+$/g, '')
  )
}

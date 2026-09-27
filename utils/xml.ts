/**
 * @file XML 转义工具
 * @description sitemap 与 RSS feed 都要把「可能含 & < > " 的文本」写进 XML，
 *              转义规则一致，因此只写一份，两处共用。
 *              仅供构建期使用（nuxt.config.ts），不进客户端产物。
 */

/**
 * XML 文本转义：& < > " 五个字符。
 * 单引号不转——sitemap / RSS 的属性统一用双引号包裹。
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

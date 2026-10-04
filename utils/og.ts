/**
 * @file OG 分享图（SVG 模板，构建期使用）
 * @description 为每个风格生成一张 1200×630 的分享卡，让分享出去的链接带上
 *              该风格的配色与名字——此前全站 802 页共用一张 og-image.png。
 *
 * 为什么在构建期生成而不入库：20 张 PNG 会永久增加仓库体积，而它们是
 * 可以从 registry 派生的产物；放在 nitro 的 prerender:done 钩子里生成，
 * 与 sitemap / feed 同批落盘，不进 git。
 *
 * ⚠️ 图上只用**英文与数字**：CI 容器里通常没有中文字体，SVG 里的中文
 *    会渲染成方块。风格名（Neo-Brutalism 等）本来就是专有名词，
 *    中英页面共用同一张图是合理的。
 */

/** OG 卡的标准尺寸（Facebook / Twitter / 微信分享都按这个比例裁切） */
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

/** 参与生成 OG 图的风格字段（来自 styles/registry.ts） */
export interface OgStyleInput {
  /** kebab-case 风格标识 */
  id: string
  /** 英文名（图上大字） */
  en: string
  /** 风格主色 hex */
  accent: string
}

/** 品牌常量：与 scripts/gen-brand-assets.mjs 的 BRAND 保持一致 */
const BRAND = {
  bg: '#0b1120',
  panel: '#111c33',
  name: 'Sinclair-CXP',
  tagline: '20 UI Styles · One Site',
}

/**
 * 单个风格的 OG 卡 SVG。
 * 版式：深色底 + 左侧强调色竖条 + 风格英文名 + 站点名与副标，
 *      右上角一枚强调色圆点（对应画廊卡片上的色彩签名）。
 */
export function styleOgSvg(style: OgStyleInput): string {
  const { id, en, accent } = style
  // 长名缩小字号，避免溢出画布（英文风格名最长约 22 字符）
  const titleSize = en.length > 18 ? 72 : en.length > 12 ? 84 : 96
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${BRAND.bg}"/>
  <rect x="0" y="0" width="14" height="${OG_HEIGHT}" fill="${accent}"/>
  <circle cx="1060" cy="120" r="46" fill="${accent}"/>
  <rect x="80" y="196" width="1040" height="238" rx="18" fill="${BRAND.panel}" opacity="0.72"/>
  <text x="80" y="300" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="#ffffff">${escapeXmlText(en)}</text>
  <text x="80" y="372" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="34" fill="${accent}">/style/${escapeXmlText(id)}</text>
  <text x="80" y="520" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="40" font-weight="600" fill="#ffffff">${BRAND.name}</text>
  <text x="80" y="566" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="28" fill="#94a3b8">${BRAND.tagline}</text>
</svg>`
}

/** SVG 文本转义（风格名里理论上没有这些字符，但生成链路不该信任输入） */
function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * @file pixel 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/pixel，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import PixelIndex from './pages/PixelIndex.vue'

export default {
  pages: {
    '/': PixelIndex,
  },
} satisfies StyleEntry

/**
 * @file soft-3d 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/soft-3d，未导出的页面由壳抛 404。
 *              当前为 partial 状态：仅首页（'/'），其余页面规划中。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import Soft3DIndex from './pages/Soft3DIndex.vue'

export default {
  pages: {
    '/': Soft3DIndex,
  },
} satisfies StyleEntry

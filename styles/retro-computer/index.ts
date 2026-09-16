/**
 * @file 复古电脑（retro-computer）风格入口
 * @description 导出该风格的页面组件映射（页面路径 → 组件），供风格路由壳
 *              （pages/style/[style]/[...slug].vue）按需渲染；同时引入本风格
 *              的 tokens.css（随本风格 chunk 加载，实现资源隔离）。
 *              未实现的页面（/about、/contact、/blog…）不写映射，
 *              薄壳路由对缺失页面抛 404。
 */
import type { StyleEntry } from '~/styles/registry'
import './tokens.css'
import RetroComputerIndex from './pages/RetroComputerIndex.vue'

export default {
  pages: {
    '/': RetroComputerIndex,
  },
} satisfies StyleEntry

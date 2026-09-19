/**
 * @file 复古电脑（retro-computer）风格入口
 * @description 导出该风格的页面组件映射（页面路径 → 组件），供风格路由壳
 *              （pages/style/[style]/[...slug].vue）按需渲染；同时引入本风格
 *              的 tokens.css（随本风格 chunk 加载，实现资源隔离）。
 *              映射键与风格路由壳的 slug 对应：'/' → /style/retro-computer，
 *              未导出的页面由壳抛 404。
 */
import type { StyleEntry } from '~/styles/registry'
import './tokens.css'
import RetroComputerIndex from './pages/RetroComputerIndex.vue'
import RetroComputerAbout from './pages/RetroComputerAbout.vue'
import RetroComputerProjects from './pages/RetroComputerProjects.vue'
import RetroComputerBlog from './pages/RetroComputerBlog.vue'
import RetroComputerContact from './pages/RetroComputerContact.vue'

export default {
  pages: {
    '/': RetroComputerIndex,
    '/about': RetroComputerAbout,
    '/projects': RetroComputerProjects,
    '/blog': RetroComputerBlog,
    '/contact': RetroComputerContact,
  },
} satisfies StyleEntry

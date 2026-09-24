/**
 * @file cyberpunk 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/cyberpunk，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import CyberpunkIndex from './pages/CyberpunkIndex.vue'
import CyberpunkAbout from './pages/CyberpunkAbout.vue'
import CyberpunkProjects from './pages/CyberpunkProjects.vue'
import CyberpunkBlog from './pages/CyberpunkBlog.vue'
import CyberpunkContact from './pages/CyberpunkContact.vue'

import CyberpunkDetailPage from './components/CyberpunkDetailPage.vue'

export default {
  pages: {
    '/': CyberpunkIndex,
    '/about': CyberpunkAbout,
    '/projects': CyberpunkProjects,
    '/blog': CyberpunkBlog,
    '/contact': CyberpunkContact,
  },
  // 详情阅读页：/style/cyberpunk/blog/<slug> 与 /style/cyberpunk/projects/<slug>
  detail: CyberpunkDetailPage,
} satisfies StyleEntry

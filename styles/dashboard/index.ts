/**
 * @file dashboard 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/dashboard，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import DashboardIndex from './pages/DashboardIndex.vue'
import DashboardAbout from './pages/DashboardAbout.vue'
import DashboardProjects from './pages/DashboardProjects.vue'
import DashboardBlog from './pages/DashboardBlog.vue'
import DashboardContact from './pages/DashboardContact.vue'

import DashboardDetailPage from './components/DashboardDetailPage.vue'

export default {
  pages: {
    '/': DashboardIndex,
    '/about': DashboardAbout,
    '/projects': DashboardProjects,
    '/blog': DashboardBlog,
    '/contact': DashboardContact,
  },
  // 详情阅读页：/style/dashboard/blog/<slug> 与 /style/dashboard/projects/<slug>
  detail: DashboardDetailPage,
} satisfies StyleEntry

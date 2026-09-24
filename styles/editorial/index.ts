/**
 * @file editorial 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/editorial，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import EditorialIndex from './pages/EditorialIndex.vue'
import EditorialAbout from './pages/EditorialAbout.vue'
import EditorialProjects from './pages/EditorialProjects.vue'
import EditorialBlog from './pages/EditorialBlog.vue'
import EditorialContact from './pages/EditorialContact.vue'

import EditorialDetailPage from './components/EditorialDetailPage.vue'

export default {
  pages: {
    '/': EditorialIndex,
    '/about': EditorialAbout,
    '/projects': EditorialProjects,
    '/blog': EditorialBlog,
    '/contact': EditorialContact,
  },
  // 详情阅读页：/style/editorial/blog/<slug> 与 /style/editorial/projects/<slug>
  detail: EditorialDetailPage,
} satisfies StyleEntry

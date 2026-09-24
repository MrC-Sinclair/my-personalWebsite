/**
 * @file minimalism 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/minimalism，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import MinimalismIndex from './pages/MinimalismIndex.vue'
import MinimalismAbout from './pages/MinimalismAbout.vue'
import MinimalismProjects from './pages/MinimalismProjects.vue'
import MinimalismBlog from './pages/MinimalismBlog.vue'
import MinimalismContact from './pages/MinimalismContact.vue'
import MinimalismDetailPage from './components/MinimalismDetailPage.vue'

export default {
  pages: {
    '/': MinimalismIndex,
    '/about': MinimalismAbout,
    '/projects': MinimalismProjects,
    '/blog': MinimalismBlog,
    '/contact': MinimalismContact,
  },
  // 详情阅读页：/style/minimalism/blog/<slug> 与 /style/minimalism/projects/<slug>
  detail: MinimalismDetailPage,
} satisfies StyleEntry

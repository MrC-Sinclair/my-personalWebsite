/**
 * @file claymorphism 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/claymorphism，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import ClaymorphismIndex from './pages/ClaymorphismIndex.vue'
import ClaymorphismAbout from './pages/ClaymorphismAbout.vue'
import ClaymorphismProjects from './pages/ClaymorphismProjects.vue'
import ClaymorphismBlog from './pages/ClaymorphismBlog.vue'
import ClaymorphismContact from './pages/ClaymorphismContact.vue'

import ClaymorphismDetailPage from './components/ClaymorphismDetailPage.vue'

export default {
  pages: {
    '/': ClaymorphismIndex,
    '/about': ClaymorphismAbout,
    '/projects': ClaymorphismProjects,
    '/blog': ClaymorphismBlog,
    '/contact': ClaymorphismContact,
  },
  // 详情阅读页：/style/claymorphism/blog/<slug> 与 /style/claymorphism/projects/<slug>
  detail: ClaymorphismDetailPage,
} satisfies StyleEntry

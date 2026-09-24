/**
 * @file neumorphism 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/neumorphism，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import NeumorphismIndex from './pages/NeumorphismIndex.vue'
import NeumorphismAbout from './pages/NeumorphismAbout.vue'
import NeumorphismProjects from './pages/NeumorphismProjects.vue'
import NeumorphismBlog from './pages/NeumorphismBlog.vue'
import NeumorphismContact from './pages/NeumorphismContact.vue'

import NeumorphismDetailPage from './components/NeumorphismDetailPage.vue'

export default {
  pages: {
    '/': NeumorphismIndex,
    '/about': NeumorphismAbout,
    '/projects': NeumorphismProjects,
    '/blog': NeumorphismBlog,
    '/contact': NeumorphismContact,
  },
  // 详情阅读页：/style/neumorphism/blog/<slug> 与 /style/neumorphism/projects/<slug>
  detail: NeumorphismDetailPage,
} satisfies StyleEntry

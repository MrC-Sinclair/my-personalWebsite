/**
 * @file 现代信息界面（metro）风格入口
 * @description 向风格路由壳（pages/style/[style]/[...slug].vue）导出本风格的
 *              页面组件映射：路径 '/' → MetroIndex（开始屏幕首页），
 *              '/about' '/projects' '/blog' '/contact' → 各自的子页。
 */
import './tokens.css'
import './layout.css'
import type { StyleEntry } from '~/styles/registry'
import MetroIndex from './pages/MetroIndex.vue'
import MetroAbout from './pages/MetroAbout.vue'
import MetroProjects from './pages/MetroProjects.vue'
import MetroBlog from './pages/MetroBlog.vue'
import MetroContact from './pages/MetroContact.vue'

import MetroDetailPage from './components/MetroDetailPage.vue'

export default {
  pages: {
    '/': MetroIndex,
    '/about': MetroAbout,
    '/projects': MetroProjects,
    '/blog': MetroBlog,
    '/contact': MetroContact,
  },
  // 详情阅读页：/style/metro/blog/<slug> 与 /style/metro/projects/<slug>
  detail: MetroDetailPage,
} satisfies StyleEntry

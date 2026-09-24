/**
 * @file flat-design 风格入口
 * @description 负责装载该风格的 tokens.css / layout.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/flat-design，'/about' '/projects' '/blog' '/contact'
 *              → 各自的子页，未导出的页面由壳抛 404。
 */
import './tokens.css'
import './layout.css'
import type { StyleEntry } from '~/styles/registry'
import FlatDesignIndex from './pages/FlatDesignIndex.vue'
import FlatDesignAbout from './pages/FlatDesignAbout.vue'
import FlatDesignProjects from './pages/FlatDesignProjects.vue'
import FlatDesignBlog from './pages/FlatDesignBlog.vue'
import FlatDesignContact from './pages/FlatDesignContact.vue'

import FlatDesignDetailPage from './components/FlatDesignDetailPage.vue'

export default {
  pages: {
    '/': FlatDesignIndex,
    '/about': FlatDesignAbout,
    '/projects': FlatDesignProjects,
    '/blog': FlatDesignBlog,
    '/contact': FlatDesignContact,
  },
  // 详情阅读页：/style/flat-design/blog/<slug> 与 /style/flat-design/projects/<slug>
  detail: FlatDesignDetailPage,
} satisfies StyleEntry

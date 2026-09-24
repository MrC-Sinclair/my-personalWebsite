/**
 * @file liquid-glass 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/liquid-glass，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import LiquidGlassIndex from './pages/LiquidGlassIndex.vue'
import LiquidGlassAbout from './pages/LiquidGlassAbout.vue'
import LiquidGlassProjects from './pages/LiquidGlassProjects.vue'
import LiquidGlassBlog from './pages/LiquidGlassBlog.vue'
import LiquidGlassContact from './pages/LiquidGlassContact.vue'
import LiquidGlassDetailPage from './components/LiquidGlassDetailPage.vue'

export default {
  pages: {
    '/': LiquidGlassIndex,
    '/about': LiquidGlassAbout,
    '/projects': LiquidGlassProjects,
    '/blog': LiquidGlassBlog,
    '/contact': LiquidGlassContact,
  },
  // 详情阅读页：/style/liquid-glass/blog/<slug> 与 /style/liquid-glass/projects/<slug>
  detail: LiquidGlassDetailPage,
} satisfies StyleEntry

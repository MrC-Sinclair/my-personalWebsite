/**
 * @file sci-fi-hud 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/sci-fi-hud，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import SciFiHudIndex from './pages/SciFiHudIndex.vue'
import SciFiHudAbout from './pages/SciFiHudAbout.vue'
import SciFiHudProjects from './pages/SciFiHudProjects.vue'
import SciFiHudBlog from './pages/SciFiHudBlog.vue'
import SciFiHudContact from './pages/SciFiHudContact.vue'

export default {
  pages: {
    '/': SciFiHudIndex,
    '/about': SciFiHudAbout,
    '/projects': SciFiHudProjects,
    '/blog': SciFiHudBlog,
    '/contact': SciFiHudContact,
  },
} satisfies StyleEntry

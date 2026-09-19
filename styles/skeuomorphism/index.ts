// cspell:ignore Skeuomorphism skeuomorphism
/**
 * @file skeuomorphism 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/skeuomorphism，未导出的页面由壳抛 404。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import SkeuomorphismIndex from './pages/SkeuomorphismIndex.vue'
import SkeuomorphismAbout from './pages/SkeuomorphismAbout.vue'
import SkeuomorphismProjects from './pages/SkeuomorphismProjects.vue'
import SkeuomorphismBlog from './pages/SkeuomorphismBlog.vue'
import SkeuomorphismContact from './pages/SkeuomorphismContact.vue'

export default {
  pages: {
    '/': SkeuomorphismIndex,
    '/about': SkeuomorphismAbout,
    '/projects': SkeuomorphismProjects,
    '/blog': SkeuomorphismBlog,
    '/contact': SkeuomorphismContact,
  },
} satisfies StyleEntry

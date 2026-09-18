/**
 * Web 2.0 光泽风格入口 —— 页面组件映射（见 docs/architecture/multi-style-ui.md）
 * index.ts 由编排者补全（原 agent 中断前已完成页面与组件实现）
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import Web2GlossyIndex from './pages/Web2GlossyIndex.vue'
import Web2GlossyAbout from './pages/Web2GlossyAbout.vue'
import Web2GlossyProjects from './pages/Web2GlossyProjects.vue'
import Web2GlossyBlog from './pages/Web2GlossyBlog.vue'
import Web2GlossyContact from './pages/Web2GlossyContact.vue'

export default {
  pages: {
    '/': Web2GlossyIndex,
    '/about': Web2GlossyAbout,
    '/projects': Web2GlossyProjects,
    '/blog': Web2GlossyBlog,
    '/contact': Web2GlossyContact,
  },
} satisfies StyleEntry

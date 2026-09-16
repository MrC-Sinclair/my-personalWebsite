/**
 * Web 2.0 光泽风格入口 —— 页面组件映射（见 docs/architecture/multi-style-ui.md）
 * index.ts 由编排者补全（原 agent 中断前已完成页面与组件实现）
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import Web2GlossyIndex from './pages/Web2GlossyIndex.vue'

export default { pages: { '/': Web2GlossyIndex } } satisfies StyleEntry

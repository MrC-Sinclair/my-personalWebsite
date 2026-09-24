/**
 * @file terminal 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/terminal，'/about' → /style/terminal/about，
 *              未导出的页面由壳抛 404。
 *              终端机为 tier 3 风格：交互脚本（命令解析 / 输入
 *              历史 / 打字机）内聚在 TerminalConsole 组件中，
 *              数据仍全部来自共享层 composables。
 *
 *              子页模式：4 个子页各自是一个薄封装（仅指定标题 + 主体
 *              区块），共享 TerminalSubPage 提供的壳（导航 / 状态条 /
 *              页脚 / 标题）。区块组件与首页 sr-only 降级区同源，
 *              所以「首页看到的」与「子页看到的」内容完全一致。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import TerminalIndex from './pages/TerminalIndex.vue'
import TerminalAbout from './pages/TerminalAbout.vue'
import TerminalProjects from './pages/TerminalProjects.vue'
import TerminalBlog from './pages/TerminalBlog.vue'
import TerminalContact from './pages/TerminalContact.vue'

import TerminalDetailPage from './components/TerminalDetailPage.vue'

export default {
  pages: {
    '/': TerminalIndex,
    '/about': TerminalAbout,
    '/projects': TerminalProjects,
    '/blog': TerminalBlog,
    '/contact': TerminalContact,
  },
  // 详情阅读页：/style/terminal/blog/<slug> 与 /style/terminal/projects/<slug>
  detail: TerminalDetailPage,
} satisfies StyleEntry

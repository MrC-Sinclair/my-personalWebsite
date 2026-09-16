/**
 * @file terminal 风格入口
 * @description 负责装载该风格的 tokens.css（随风格 chunk 按需加载），
 *              并导出页面组件映射；映射键与风格路由壳
 *              （pages/style/[style]/[...slug].vue）的 slug 对应：
 *              '/' → /style/terminal，未导出的页面由壳抛 404。
 *              终端机为 tier 3 风格：交互脚本（命令解析 / 输入
 *              历史 / 打字机）内聚在 TerminalConsole 组件中，
 *              数据仍全部来自共享层 composables。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import TerminalIndex from './pages/TerminalIndex.vue'

export default {
  pages: {
    '/': TerminalIndex,
  },
} satisfies StyleEntry

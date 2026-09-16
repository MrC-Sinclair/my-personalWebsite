/**
 * @file 现代信息界面（metro）风格入口
 * @description 向风格路由壳（pages/style/[style]/[...slug].vue）导出本风格的
 *              页面组件映射：路径 '/' → MetroIndex（开始屏幕首页）。
 *              未实现的页面（/about、/contact、/blog 等）不写映射，
 *              薄壳路由会对缺失页面返回 404（见注册表 status: partial）。
 */
import './tokens.css'
import type { StyleEntry } from '~/styles/registry'
import MetroIndex from './pages/MetroIndex.vue'

export default {
  pages: {
    '/': MetroIndex,
  },
} satisfies StyleEntry

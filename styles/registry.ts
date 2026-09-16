/**
 * 风格注册表 —— 只存元信息，不含任何实现
 * ------------------------------------------------------------
 * 画廊页（pages/styles.vue）与风格路由壳（pages/style/[style]/[...slug].vue）
 * 都从这里读取清单；新增风格在数组末尾追加一条即可，无需改任何页面代码。
 *
 * tier 表示「除了写结构和 CSS 之外，还要额外付出什么」：
 *   1 = 纯结构与样式
 *   2 = 还要引入/绘制外部资源（字体、位图、材质）
 *   3 = 还要写交互脚本（命令解析、打字机等）
 *
 * 预渲染路由清单在 nuxt.config.ts 的 nitro.prerender.routes，
 * 与本文件同步维护（详见 docs/architecture/multi-style-ui.md）。
 */
import type { Component } from 'vue'

/** 每个风格 index.ts 必须导出的默认结构：页面路径 → 页面组件 */
export interface StyleEntry {
  pages: Record<string, Component>
}

/** 单个风格的元信息 */
export interface StyleMeta {
  /** kebab-case 英文标识，同时是路由参数与目录名 */
  id: string
  /** 中文名 */
  name: string
  /** 英文名 */
  en: string
  /** 成本档位 1-3 */
  tier: 1 | 2 | 3
  /** 档位说明 */
  tierLabel: string
  /** 一句话风格描述 */
  note: string
  /** 页面完成度：ready = 五页齐全；partial = 仅部分页面；planned = 仅登记未开工 */
  status: 'ready' | 'partial' | 'planned'
  /**
   * 风格主色（hex）——与 styles/<id>/tokens.css 的 --c-accent 保持一致。
   * 画廊页用它给每张卡片打上该风格的色彩签名，避免「卖 20 种风格的
   * 页面自己没有风格」。仅作装饰（色带/圆点/边框），不承载正文，
   * 因此不受正文对比度约束。
   */
  accent: string
  /** 画廊预览图路径（public/ 下，空字符串表示暂无预览图） */
  preview: string
}

export const styleRegistry: StyleMeta[] = [
  {
    id: 'liquid-glass',
    name: '液态玻璃',
    en: 'Liquid Glass',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '半透明玻璃层叠、背景模糊与光线折射，UI 像漂浮在玻璃表面',
    status: 'partial',
    accent: '#5ee3ff',
    preview: '',
  },
  {
    id: 'neo-brutalism',
    name: '新粗野主义',
    en: 'Neo-Brutalism',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '粗黑边框、硬阴影、高饱和撞色、巨型标题，海报式拼贴',
    status: 'partial',
    accent: '#ffe600',
    preview: '',
  },
  {
    id: 'soft-3d',
    name: '柔和空间立体风',
    en: 'Soft 3D / Spatial',
    tier: 2,
    tierLabel: '+ 3D 感绘制',
    note: '3D 物体感、漂浮卡片、柔和阴影与 Z 轴层级，UI 摆在空间里',
    status: 'partial',
    accent: '#a78bfa',
    preview: '',
  },
  {
    id: 'minimalism',
    name: '极简主义',
    en: 'Minimalism',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '大量留白、低饱和、克制的排版层级，只留最重要的信息',
    status: 'partial',
    accent: '#4f6b8f',
    preview: '',
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    en: 'Cyberpunk',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '暗色霓虹、发光边框、数据流与网格，来自未来控制台的 UI',
    status: 'partial',
    accent: '#22d3ee',
    preview: '',
  },
  {
    id: 'editorial',
    name: '杂志编辑排版',
    en: 'Editorial',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '巨大标题、杂志网格、非对称多栏，把网站排成一本高级杂志',
    status: 'partial',
    accent: '#8e2318',
    preview: '',
  },
  {
    id: 'y2k',
    name: '千禧年数字风',
    en: 'Y2K UI',
    tier: 2,
    tierLabel: '+ 质感绘制',
    note: '金属铬、透明塑料、蓝紫彩虹渐变与气泡高光，2000 年想象中的未来',
    status: 'partial',
    accent: '#8b7bff',
    preview: '',
  },
  {
    id: 'web2-glossy',
    name: 'Web 2.0 光泽',
    en: 'Web 2.0 Glossy',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '渐变、大圆角、Glossy 高光按钮，一切东西都像刚打过蜡',
    status: 'partial',
    accent: '#1e6fd9',
    preview: '',
  },
  {
    id: 'pixel',
    name: '像素风',
    en: 'Pixel / 8-bit UI',
    tier: 2,
    tierLabel: '+ 点阵字体',
    note: '硬边缘、有限色板、游戏 HUD——不是换值，是换性质',
    status: 'partial',
    accent: '#ffcd75',
    preview: '',
  },
  {
    id: 'terminal',
    name: '终端机',
    en: 'Terminal / CLI',
    tier: 3,
    tierLabel: '+ 交互脚本',
    note: '黑底绿字等宽文本流，UI 几乎消失，只剩命令与光标',
    status: 'partial',
    accent: '#7cffb2',
    preview: '',
  },
  {
    id: 'dashboard',
    name: '数据仪表盘',
    en: 'Dashboard / Data UI',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: 'KPI 卡片、图表、密集信息网格，可快速扫描的控制中心',
    status: 'partial',
    accent: '#38bdf8',
    preview: '',
  },
  {
    id: 'swiss',
    name: '瑞士国际主义',
    en: 'Swiss / International',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '严格网格、强 Typography、非对称大留白，黑白加一个强调色',
    status: 'partial',
    accent: '#e30613',
    preview: '',
  },
  {
    id: 'retro-computer',
    name: '复古电脑',
    en: 'Retro Computer',
    tier: 2,
    tierLabel: '+ CRT 质感绘制',
    note: '灰色窗口、像素图标、扫描线，像打开一台 90 年代的电脑',
    status: 'partial',
    accent: '#000080',
    preview: '',
  },
  {
    id: 'sci-fi-hud',
    name: '科幻 HUD',
    en: 'Futurism / Sci-Fi HUD',
    tier: 2,
    tierLabel: '+ 雷达动画',
    note: 'HUD 仪表、雷达、数据流与扫描线，宇宙飞船驾驶舱控制面板',
    status: 'partial',
    accent: '#4af0c6',
    preview: '',
  },
  {
    id: 'claymorphism',
    name: '黏土拟态',
    en: 'Claymorphism',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '超大圆角、厚重卡片、柔和阴影与 Pastel 色，软黏土捏出来的界面',
    status: 'partial',
    accent: '#7d3fc9',
    preview: '',
  },
  {
    id: 'neumorphism',
    name: '新拟态',
    en: 'Neumorphism',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '同色背景、双向阴影的凸起与内凹，从一块材料里压出来的形体',
    status: 'partial',
    accent: '#3b55c8',
    preview: '',
  },
  {
    id: 'glassmorphism',
    name: '玻璃拟态',
    en: 'Glassmorphism',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '半透明卡片、Backdrop Blur、彩色渐变背景穿透与柔光',
    status: 'partial',
    accent: '#6d28d9',
    preview: '',
  },
  {
    id: 'skeuomorphism',
    name: '拟物主义',
    en: 'Skeuomorphism',
    tier: 2,
    tierLabel: '+ 材质纹理绘制',
    note: '皮革、木纹、金属、纸张的真实材质纹理与拟真光影',
    status: 'partial',
    accent: '#b8893a',
    preview: '',
  },
  {
    id: 'metro',
    name: '现代信息界面',
    en: 'Metro / Modern UI',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '大面积 Tile 色块、强 Typography，UI 是一张实时变化的信息版面',
    status: 'partial',
    accent: '#1ba1e2',
    preview: '',
  },
  {
    id: 'flat-design',
    name: '扁平化',
    en: 'Flat Design',
    tier: 1,
    tierLabel: '纯结构与样式',
    note: '纯色几何、无纹理少阴影，UI 直接呈现为数字图形',
    status: 'partial',
    accent: '#2471a3',
    preview: '',
  },
]

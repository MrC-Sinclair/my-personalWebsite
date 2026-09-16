/**
 * @file terminal 风格专属文案字典（终端机风格的表现层风味文案）
 * ------------------------------------------------------------
 * 职责：存放「终端机」风格特有的风味文案（命令帮助、提示语、
 *       无障碍标签等）。这类文案在 i18n/zh-CN.json 中没有对应
 *       key，而本风格无权修改共享 i18n 文件（架构红线），因此
 *       以「随语言切换的本地字典」形式收敛在这一个文件里：
 *       - 所有内容性文案（关于/技能/作品/文章/联系）仍一律走 t()
 *       - 这里只放终端操作指引类文案，且随 locale 自动切换中/英
 *       - 建议后续迁入 i18n 的 key 清单见风格交付报告
 *         （如 terminal.helpTitle / terminal.cmdNotFound 等）。
 *
 * 本文件保持纯 TS（不依赖 Vue/i18n 运行时 API）：响应式包装
 * 由使用方完成——const { locale } = useI18n();
 * const copy = computed(() => pickTerminalCopy(locale.value))
 */

/** 终端风味文案（中英两份，随 locale 切换） */
export interface TerminalCopy {
  /** 无障碍：命令输入框标签 */
  inputLabel: string
  /** 无障碍：输出区标签 */
  outputLabel: string
  /** 无障碍：跳转导航的说明文字 */
  skipHint: string
  /** 输入框占位符 */
  inputPlaceholder: string
  /** help 命令的标题行 */
  helpTitle: string
  /** help 命令的收尾提示 */
  helpFooter: string
  /** 各命令的说明（键与命令名一致） */
  cmdDesc: Record<string, string>
  /** 未知命令报错（后半句，前半句拼接命令名） */
  cmdNotFound: string
  /** 开机问候第一行（框线内引导语） */
  welcomeGuide: string
  /** 开机问候第二行（降级提示） */
  welcomeFallback: string
  /** works 清单的翻页提示 */
  worksHint: string
  /** blog 清单的翻页提示 */
  blogHint: string
  /** theme 命令的说明行 */
  themeHint: string
}

const zhCopy: TerminalCopy = {
  inputLabel: '终端命令输入',
  outputLabel: '终端输出',
  skipHint: '跳转链接（无需命令输入）',
  inputPlaceholder: '输入 help 查看可用命令',
  helpTitle: '可用命令：',
  helpFooter: '提示：命令名可以直接点击执行。',
  cmdDesc: {
    help: '显示本帮助',
    about: '关于我',
    skills: '技能栈',
    works: '精选作品',
    blog: '最新文章',
    contact: '联系方式',
    whoami: '我是谁',
    theme: '风格画廊',
    clear: '清屏',
  },
  cmdNotFound: '：命令不存在，输入 help 查看可用命令',
  welcomeGuide: '这里没有卡片、没有按钮——所有内容通过命令获取。',
  welcomeFallback: '键盘无法使用时，可用页首跳转链接直达各区块。',
  worksHint: '条目附 GitHub / 演示链接，标题可进入详情。',
  blogHint: '标题可进入文章详情页。',
  themeHint: '本站是「一站多风格」实验：同一份内容，完全不同的界面。',
}

const enCopy: TerminalCopy = {
  inputLabel: 'Terminal command input',
  outputLabel: 'Terminal output',
  skipHint: 'Skip links (no command input needed)',
  inputPlaceholder: 'Type help to list commands',
  helpTitle: 'Available commands:',
  helpFooter: 'Tip: command names are clickable.',
  cmdDesc: {
    help: 'show this help',
    about: 'about me',
    skills: 'skill stack',
    works: 'featured works',
    blog: 'latest posts',
    contact: 'contact info',
    whoami: 'who am I',
    theme: 'style gallery',
    clear: 'clear screen',
  },
  cmdNotFound: ': command not found — type help to list commands',
  welcomeGuide: 'No cards, no buttons — everything is fetched by commands.',
  welcomeFallback: 'If typing is unavailable, use the skip links at the top of the page.',
  worksHint: 'Entries carry GitHub / demo links; titles open details.',
  blogHint: 'Titles open the post detail page.',
  themeHint: 'This site is a one-site-many-styles lab: same content, entirely different UIs.',
}

/** 按语言取文案（zh → 中文，其余 → 英文；纯函数，无副作用） */
export function pickTerminalCopy(locale: string): TerminalCopy {
  return locale === 'zh' ? zhCopy : enCopy
}

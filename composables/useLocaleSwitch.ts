/**
 * @file 语言切换 —— 多风格共享的唯一实现（行为只写一份）
 * @description 本站是双语站（i18n 用 prefix_except_default：中文无前缀、英文带 /en），
 *              101 条路由 × 2 语言都真实预渲染。但此前只有画廊首页能切换语言，
 *              风格页里一个入口都没有：进入 /style/<id>/ 之后，英文版只能靠手改 URL 到达。
 *              这里只负责「当前是哪门语言、切过去到哪、目标语言怎么称呼」，
 *              控件长什么样由各风格自己实现（UI 不跨风格复用）。
 *              详见 docs/architecture/multi-style-ui.md。
 */
import { computed } from 'vue'

/** 语言代码：与 nuxt.config 的 i18n.locales 保持一致 */
type LocaleCode = 'zh' | 'en'

/**
 * 取得语言切换所需的状态与目标路径
 *
 * @returns currentCode - 当前语言（'zh' | 'en'）；
 *          targetCode - 要点过去的那门语言；
 *          targetPath - 当前页面在目标语言下的同一路径（拿不到时回落站点根）；
 *          targetLabel - 目标语言的自称（English / 中文），控件文案用它
 *
 * @example
 * ```ts
 * const { targetPath, targetLabel } = useLocaleSwitch()
 * // 模板中（外观各风格自己定）。aria-label 复用已有的 common.language，不新增 key：
 * // <NuxtLink :to="targetPath" :aria-label="t('common.language')">{{ targetLabel }}</NuxtLink>
 * ```
 */
export function useLocaleSwitch() {
  const { locale } = useI18n()

  /** 当前语言：i18n 的 locale 可能是 'zh-CN' 这类带地区后缀的值，只取主段 */
  const currentCode = computed<LocaleCode>(() =>
    String(locale.value).startsWith('en') ? 'en' : 'zh',
  )

  /** 目标语言：切换就是取反，不需要菜单 */
  const targetCode = computed<LocaleCode>(() => (currentCode.value === 'en' ? 'zh' : 'en'))

  /**
   * 目标语言下的同一路径。
   * ⚠️ 不能用 switchLocalePath(targetCode) 的结果直接当 :to——
   * prefix_except_default 下中文路径不带前缀，函数返回的是含 baseURL 的完整路径，
   * 交给 NuxtLink 即可；万一取不到（未知路由）回落站点根，避免出现空链接。
   */
  const switchPath = useSwitchLocalePath()
  const targetPath = computed(() => switchPath(targetCode.value) || '/')

  /** 控件文案：显示「目标语言」的自称，而不是当前语言的 */
  const targetLabel = computed(() => (targetCode.value === 'en' ? 'English' : '中文'))

  return { currentCode, targetCode, targetPath, targetLabel }
}

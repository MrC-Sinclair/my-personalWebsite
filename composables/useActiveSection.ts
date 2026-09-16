/**
 * @file 滚动激活区块（scroll spy）组合式函数 —— 多风格共享的唯一实现
 * @description 此前多个风格的导航「当前区块高亮」各自实现了一遍
 *              IntersectionObserver 监听（违反「业务动作只写一份」），
 *              现统一收敛到这里。观察带 data-section 属性的区块元素，
 *              区块跨越视口中部「阅读线」时其 id 成为激活态。
 *              详见 docs/architecture/multi-style-ui.md。
 */
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 追踪当前滚动激活的区块
 *
 * @param selector - 区块选择器，默认 '[data-section]'（元素需带 data-section="id" 属性）
 * @param rootMargin - IntersectionObserver 的 rootMargin，默认用视口中部「阅读线」判定
 * @returns activeId - 当前激活区块的 data-section 值（SSR 与初始为空字符串）
 *
 * @example
 * ```ts
 * const { activeId } = useActiveSection()
 * // 模板中：:class="{ 'is-active': activeId === section.id }"
 * ```
 */
export function useActiveSection(selector = '[data-section]', rootMargin = '-45% 0px -50% 0px') {
  /** 当前激活区块的 data-section 值 */
  const activeId = ref('')

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    // onMounted 仅在客户端执行（SSR 不会触发）；防御 jsdom/旧浏览器无 IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') return

    const targets = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (targets.length === 0) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.section ?? ''
            if (id) activeId.value = id
          }
        }
      },
      { rootMargin },
    )
    targets.forEach((el) => observer!.observe(el))
  })

  // 组件卸载时断开观察（架构红线：资源成对清理）
  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { activeId }
}

/**
 * useScrollReveal - 滚动进入视口时触发动画的 composable
 *
 * 基于 IntersectionObserver + MutationObserver 实现，SSG 友好，不会产生 hydration mismatch。
 * 服务端渲染时元素保持初始 CSS 状态（透明/偏移），客户端进入视口后添加 revealed 类触发过渡。
 *
 * 用法：
 * 1. 在 onMounted 中调用 useScrollReveal()
 * 2. 给需要动画的元素添加 scroll-reveal 类和变体类（如 scroll-reveal-up、scroll-reveal-left）
 * 3. 元素进入视口时自动添加 revealed 类
 *
 * CSS 类约定：
 * - .scroll-reveal       → 基础类（opacity: 0）
 * - .scroll-reveal-up    → 从下方滑入（translateY(20px)）
 * - .scroll-reveal-up-lg → 从下方滑入更远（translateY(30px)）
 * - .scroll-reveal-left  → 从左侧滑入（translateX(-20px)）
 * - .scroll-reveal-right → 从右侧滑入（translateX(20px)）
 * - .scroll-reveal-delay-{1~5} → 交错延迟（100ms ~ 500ms）
 * - .revealed            → 进入视口后添加的类（opacity: 1, transform: none）
 */
export function useScrollReveal() {
  let intersectionObserver: IntersectionObserver | null = null
  let mutationObserver: MutationObserver | null = null

  /** 观察单个 scroll-reveal 元素（跳过已有 revealed 类的） */
  function observeElement(el: Element) {
    if (el.classList.contains('revealed')) return
    intersectionObserver?.observe(el)
  }

  /** 批量观察容器内所有 scroll-reveal 元素 */
  function observeAll() {
    document.querySelectorAll('.scroll-reveal').forEach(observeElement)
  }

  onMounted(() => {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            intersectionObserver?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    observeAll()

    // 监听 DOM 变化，自动观察新增的 scroll-reveal 元素
    mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.classList.contains('scroll-reveal')) {
              observeElement(node)
            }
            // 子元素中也可能包含 scroll-reveal
            node.querySelectorAll?.('.scroll-reveal').forEach(observeElement)
          }
        }
      }
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })

  onUnmounted(() => {
    intersectionObserver?.disconnect()
    mutationObserver?.disconnect()
  })
}

/**
 * useScrollReveal - 滚动进入视口时触发动画的 composable
 *
 * 基于 IntersectionObserver 实现，SSG 友好，不会产生 hydration mismatch。
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
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    )

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer?.observe(el)
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}

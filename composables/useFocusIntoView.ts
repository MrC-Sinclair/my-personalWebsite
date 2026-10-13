/**
 * @file 焦点滚进视野 —— 全站共享的键盘可达行为
 * @description 横向滚动条带（窄屏导航、标签墙）里的条目被 Tab 走到时，浏览器只保证
 *              「可见」，不保证「完整可见」：条目只露半截时它不再滚动，于是焦点环
 *              被条带边缘切掉一半，键盘用户看不出焦点落在哪（实测 390 宽下 5 处）。
 *              这是行为不是外观，故写在共享层，20 个风格共用一份。
 *
 * 用法：在应用壳里调一次即可（app.vue）。
 */
import { onMounted, onUnmounted } from 'vue'

export function useFocusIntoView() {
  /** 找到最近的可横向滚动祖先（overflow-x: auto | scroll） */
  function scrollerOf(el: Element | null): HTMLElement | null {
    for (let p = el?.parentElement ?? null; p; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX
      if (ox === 'auto' || ox === 'scroll') return p
    }
    return null
  }

  function onFocusIn(event: FocusEvent) {
    const el = event.target as HTMLElement | null
    if (!el || typeof el.getBoundingClientRect !== 'function') return
    const scroller = scrollerOf(el)
    if (!scroller) return

    const bar = el.getBoundingClientRect()
    const box = scroller.getBoundingClientRect()
    // 完整落在可视区内就不用动（1px 容差：缩放布局会有零点几像素误差）
    const fits = bar.left >= box.left - 1 && bar.right <= box.right + 1
    if (fits) return

    // 只横向挪（block: 'nearest'），不顺手把整页纵向滚走。
    // 用瞬时而不是 smooth：焦点跟随要立刻到位才看得见环，动画会让环追着跑，
    // 而且量测端（键盘探针）读到的会是滚动中途的假位置
    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' })
  }

  onMounted(() => document.addEventListener('focusin', onFocusIn))
  onUnmounted(() => document.removeEventListener('focusin', onFocusIn))
}

/**
 * @file 剪贴板复制组合式函数 —— 多风格共享的唯一实现
 * @description 此前「复制号码 + 已复制反馈 + 定时器清理」在多个风格中
 *              各写了一遍（违反「业务动作只写一份」），现统一收敛到这里。
 *              各风格组件只需：const { copied, copy } = useClipboardCopy()，
 *              用 copied === item.value 判断哪个条目处于「已复制」反馈态。
 *              详见 docs/architecture/multi-style-ui.md。
 */
import { onUnmounted, ref } from 'vue'

/**
 * 复制文本到剪贴板，并提供自动过期的「已复制」反馈状态
 *
 * @param feedbackMs - 「已复制」反馈持续时间（毫秒），默认 2000
 * @returns copied - 最近一次成功复制的文本（反馈期内有效，过期自动清空）；
 *          copy - 复制函数，返回是否成功（非客户端环境/权限失败返回 false，静默降级）
 *
 * @example
 * ```ts
 * const { copied, copy } = useClipboardCopy()
 * // 模板中：
 * // <button @click="copy(item.value)">{{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}</button>
 * ```
 */
export function useClipboardCopy(feedbackMs = 2000) {
  /** 最近一次成功复制的文本（反馈期内有效） */
  const copied = ref('')

  /** 反馈定时器（onUnmounted 成对清理） */
  let timer: ReturnType<typeof setTimeout> | undefined

  /** 复制文本到剪贴板（仅客户端，失败时静默降级） */
  async function copy(value: string): Promise<boolean> {
    // 仅客户端执行：SSR 无 window；用 typeof window 守卫（Nuxt 构建与测试环境均确定）
    if (typeof window === 'undefined' || !value) return false
    try {
      await navigator.clipboard.writeText(value)
      copied.value = value
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = ''
      }, feedbackMs)
      return true
    } catch {
      // 剪贴板不可用（权限拒绝/非安全上下文等）：静默降级，调用方按失败处理
      return false
    }
  }

  // 组件卸载时清掉反馈定时器，避免向已卸载组件写状态
  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return { copied, copy }
}

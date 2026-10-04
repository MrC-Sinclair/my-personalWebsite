/**
 * Vitest 全局 setup
 * ------------------------------------------------------------
 * 为什么需要它：composables/ 下的代码依赖 Nuxt 的**自动导入**，`computed` / `ref` /
 * `watch` / `onMounted` 这些 Vue API 都没有显式 import（项目里 100+ 个文件都是这样）。
 * Nuxt 构建时会注入，但 vitest 直接跑源码时它们不存在 → `ReferenceError: xxx is not defined`。
 *
 * 这里把 Vue 的响应式与生命周期 API 挂到 globalThis，让源码照常运行。
 * **只注入行为确定的 Vue API**；useI18n / useRoute / queryCollection 这类
 * 需要按用例定制 mock 的，仍由各测试自己 stubGlobal。
 */
import { computed, onMounted, onUnmounted, reactive, ref, toValue, watch } from 'vue'
import { vi } from 'vitest'

vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('reactive', reactive)
vi.stubGlobal('watch', watch)
vi.stubGlobal('toValue', toValue)
vi.stubGlobal('onMounted', onMounted)
vi.stubGlobal('onUnmounted', onUnmounted)

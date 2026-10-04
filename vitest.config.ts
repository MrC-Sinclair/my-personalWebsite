import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // 注入 Vue 的响应式/生命周期 API：composables 依赖 Nuxt 自动导入，
    // vitest 直接跑源码时它们未定义（见 tests/setup.ts 的说明）
    setupFiles: ['./tests/setup.ts'],
  },
})

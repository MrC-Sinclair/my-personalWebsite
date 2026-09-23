import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/multi-word-component-names': 'off',
  },
}, {
  // drizzle/schema.ts 是数据库迁移的预留 Schema，drizzle-orm 尚未安装
  //（package.json 里没有该依赖），靠 @ts-nocheck 屏蔽 TS2307。
  // 该规则默认禁止 ts-nocheck，这里为这个唯一的预留文件开例外。
  files: ['drizzle/**'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
  },
})

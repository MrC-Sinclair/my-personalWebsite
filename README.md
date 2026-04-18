# my-personalWebsite

综合型个人网站，包含首页、技术博客、项目作品集、关于页面和联系方式五大核心模块。

## 技术栈

- **框架**：Nuxt 3 (SSG) + Vue 3 + TypeScript
- **UI**：Nuxt UI v3 + Tailwind CSS v4
- **内容**：@nuxt/content v3 (Markdown + Zod schema)
- **国际化**：@nuxtjs/i18n (中/英)
- **部署**：GitHub Actions → GitHub Pages

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 生成静态站点
pnpm generate

# 本地预览
pnpm preview
```

## 规范检查

```bash
pnpm lint          # ESLint 检查
pnpm format        # Prettier 格式化
pnpm spellcheck    # 拼写检查
pnpm test          # 运行测试
```

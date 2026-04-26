# CLAUDE.local.md - 本地开发环境上下文

> 此文件包含本地开发环境相关配置，不应提交到版本库（已在 .gitignore 中排除）。

## 本地环境信息

- **操作系统**：Windows
- **项目路径**：`d:\code\my-personalWebsite`
- **包管理器**：pnpm

## 本地开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 生成静态站点
pnpm generate

# 本地预览生成结果
pnpm preview

# 代码检查
pnpm lint

# 代码检查并自动修复
pnpm lint:fix

# 代码格式化
pnpm format

# 代码格式检查（不修改文件）
pnpm format:check

# 拼写检查
pnpm spellcheck

# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch
```

## 本地数据库（可选）

如需启动本地 PostgreSQL 开发环境：

```bash
# 启动 Docker Compose
docker compose -f docker/docker-compose.yml up -d

# 停止
docker compose -f docker/docker-compose.yml down
```

数据库连接信息参考 `.env.example`，复制为 `.env` 后按需修改。

## 环境变量

参考 `.env.example` 创建 `.env` 文件，典型变量：

- `NUXT_PUBLIC_SITE_URL` - 站点 URL
- `DATABASE_URL` - PostgreSQL 连接字符串（可选）

## 本地偏好

- 默认开发语言：中文
- 编辑器：VS Code / Trae
- 终端：PowerShell
- 浏览器调试：Chrome DevTools（移动端模拟可用 DevTools 设备模拟器）

## 移动端调试

- Chrome DevTools 设备模拟器：F12 → 切换设备工具栏（Ctrl+Shift+M）
- 测试安全区域：在 DevTools 中模拟 iPhone X+ 设备
- 测试 PWA：DevTools → Application → Service Workers / Manifest
- 测试 prefers-reduced-motion：DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion

## 注意事项

- Windows 环境下路径使用反斜杠，但代码中统一使用正斜杠
- `nuxt generate` 生成的静态文件在 `.output/public/` 目录
- 本地开发时 `app.baseURL` 默认为 `/`，部署时需改为 `/my-personalWebsite/`
- Docker Desktop 需提前启动才能使用本地数据库
- 首次安装依赖时 pnpm 会提示允许构建原生模块（better-sqlite3 等），已在 `package.json` 的 `pnpm.onlyBuiltDependencies` 中预配置
- 网络受限环境下，Google Fonts 已在 `nuxt.config.ts` 中禁用（`fonts.providers.google: false`）
- PWA 在本地开发时自动注册 Service Worker，可通过 DevTools → Application → Service Workers 管理
- 移动端底部导航栏在 md 以下断点显示，桌面端隐藏；布局 `default.vue` 中 `main` 有 `pb-16 md:pb-0` 为其留出空间

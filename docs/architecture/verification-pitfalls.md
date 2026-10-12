# 验证量具与踩坑口径

> 本文只讲**怎么量**，不讲运维。改产品代码前值得扫一眼：这里每条都来自真实返工，
> 而不是推测。逐条对应的工具都在 `scripts/`（仓库级、CI 可用）。

## 1. 量的对象必须是发布物

**dev server 会骗人。** HMR 之后 DOM 里留着幽灵节点：空的重复 `<a class="project-card">`
（41.7×41.7）、`a.work` 0×0、`a.pod-link` 420×0 —— 实测一次报出 42 个假目标。
同一份页面的 SSR HTML 用 curl 抓是干净的，所以问题在客户端渲染残留，不在产品代码。

量布局与触控命中区的正确流程：

```bash
pnpm build                                        # 约 4 分钟，会顺带把 101 条路由预渲染进 .output/public
PORT=3005 node .output/server/index.mjs           # 或 node scripts/serve-static.mjs .output/public 4173 /
# 探针的 BASE 传 http://localhost:3005/my-personalWebsite —— base 前缀不能漏
```

`scripts/serve-static.mjs` 是照着生产 Caddy 的四条语义写的：目录无尾斜杠 → 308、
目录 → `index.html`、未命中 → 404（**不做 SPA 回落**，否则乱输的路径全返回 200 + 首页，
404 判据与 SEO 双双失效）、base 前缀严格挂载。契约由 `tests/serve-static.test.ts` 守住。

**挂载点必须与构建期的 baseURL 一致，否则量的是半裸页面。** 实测：把带
`/my-personalWebsite` 前缀构建的产物挂在 `/` 上，`entry.*.css` 与全部脚本 404，
页面照样出 h1、h1 照样唯一，但布局量到的是没有全局样式与 JS 的状态——
凭空多出 4 条报警（18px 溢出、38×38 卡片、24px 按钮），全是量具的锅。
所以审计现在会抓 `Script` / `Stylesheet` 的 4xx 并标记 `缺资源N`；
反向对照（故意挂错）实测 5/5 页红，判据不是摆设。
本地跑之前先做一条前置断言：把页面 HTML 里自己的资源链接拿出来 curl 一遍，
200 才开始量。

**改完 `<style>` 之后的闸必须是 build，不是 lint/test。** ESLint 与 Vitest 都不解析
Vue 单文件里的 `<style>` 块，批量改风格 CSS 后「未闭合括号」这类语法错只会在那里红。

## 2. 边框盒 ≠ 命中区

`getBoundingClientRect()` 会把三类真实写法全判成不合格：

| 情形                    | 为什么量错                                              |
| ----------------------- | ------------------------------------------------------- |
| 覆盖式链接              | `::after` 用 `inset: 0` 铺满整行/整卡，命中区是那一整行 |
| 外扩命中区              | `inset` 为负（或 `calc` 反解）的伪元素比边框盒更高      |
| `inline` 包住块级子元素 | 自身塌成 0 宽，但所有后代都归它响应点击                 |

还原模型统一在 `scripts/hit-box.mjs`，三个探针（`probe-touch-targets` /
`probe-target-detail` / `probe-subpage-layout`）与 CI 审计共用它。**别在探针里各自量 rect**，
否则两个工具对同一页给出两个答案。

改完测量代码必须用「已知答案」的样本对一遍 ground truth（逐点打 `elementFromPoint`），
不能只看不合格数量变没变少——数字变少也可能只是判据失效了。

## 3. 一条判据对全部对象同时报警，先怀疑量具

两个真实案例：

- `probe-subpage-layout.mjs` 曾按 `pathname.split('/')[1]` 取风格 id，站点挂在
  `/my-personalWebsite/` 下时取到的是字符串 `'style'` → 文章链接正则永不匹配 →
  「首条正文」这一轴对 20 个风格**静默返回 null**，全部误报「首屏无正文」。
  现在改成从 `'style'` 段之后取。
- 自己写的审计脚本一口气报了 17 个「异常」，全是误报：`len < 200` 的一刀切把
  **按设计只有 4 个社交链接的联系页**算成空页；数字正则把 retro-computer 的实时时钟
  「01:49」和年份「2026」读成「49 项目」「202 项目」。
  复核手段：用 `scripts/eval-url.mjs` 去页面上搜那个数字，不存在就是工具的问题。

## 4. 不要为了迎合量具改产品 CSS

`soft-3d` 的 projects 页量到 5 个「39.5px」目标。查下来 `.z-item` 带
`transform: matrix(0.97,…)`（层次深度的签名效果），元素**布局盒是 41px**
（`offsetHeight`），投影后的 rect 才是 39.53。给它加伪元素外扩，投影后照样量不到 40，
等于用假改动换假绿灯。

正确处置：三个探针统一改成**整像素比较**（`Math.round(b.height) >= 40`），理由写在注释里。
判据：**`offsetHeight` 与 rect 不一致时，先查祖先 transform**，不是先改样式。

## 5. 外扩量别写死 px

inline 元素的边框盒高度随**字体度量**浮动：同一个标题在 dev 量到 18-24px、
prod 量到 27-33px。所以「凑满 40px」的外扩要用 `inset: calc(50% - 20px) 0`
以自身行盒反解（浏览器会把 calc 解析成 px，`getComputedStyle` 读到 `-5.70312px`，
探针能量到）。写死 px 的版本在两个环境会给出不同结论。

## 6. 中文全绿不等于没问题

英文标签更宽、绕的行数更多。窄屏标签墙把首条正文推出首屏这个缺陷，**只在 `en` 侧暴露**：
中文侧 swiss 已经 840px 贴着折线只是没越线，英文侧 1016px（视口 844）才算不合格。
所以任何布局改动都要**中英各跑一遍**：

```bash
node scripts/probe-subpage-layout.mjs <BASE>                    # zh
LOCALE=en node scripts/probe-subpage-layout.mjs <BASE>          # en
PROBE_VIEW=390,844 PROBE_PAGES=blog,projects node scripts/probe-touch-targets.mjs <BASE>
```

同理：`@nuxtjs/i18n` 用 `prefix_except_default` 时**不会**自动展开英文预渲染路由，
曾经导致线上 `/en/**` 全量 404 而中文全 200。判定 i18n 是否真产出，看产物里
`.output/public/en/` 目录在不在，别信 sitemap。

### 另一个维度：CI 的字体度量会量出本机「刚好没爆」的位置

同一份发布物（从公开 Release 取的 `site-cvm.tar.gz`）本机 Chrome 上 zh + en 各 100 页
= **0 问题**，CI 的 Linux runner 上却报出 12 页：

| 判据       | 本机 | CI（Linux 回退字体）                                       |
| ---------- | ---- | ---------------------------------------------------------- |
| 命中区宽度 | 过线 | `a.idx-action` **31**×40、`a.fd-subnav__gallery` **37**×40 |
| 横向溢出   | 0    | claymorphism **9px**、neumorphism **19px**                 |

纯文字链接只写 `min-height`、宽度交给字形，就必然随回退字体浮动；
溢出只剩 9-19px 余量也一样，是「刚好没爆」不是「有余量」。
处置原则：**把下限写进样式，不要调量具去迁就本机**——文字型可点元素补
`min-width: 40px`（下划线只画在文字上，观感不变），小余量的溢出要找到越界的
元凶元素再改，而不是缩一点间距蒙过去。

## 7. 会静默通过的错误（这三类必须靠专门的测试守）

| 静默失效                                              | 守它的东西                       |
| ----------------------------------------------------- | -------------------------------- |
| `styles/` 下组件漏 `import`（不走自动导入）           | `tests/styles-structure.test.ts` |
| `t('key')` 引用不存在的 key → 直接把 key 名当文案显示 | `tests/i18n-keys.test.ts`        |
| 硬编码中文的 `aria-label` → 英文站显示中文            | `tests/i18n-keys.test.ts`        |

构建、lint、类型检查对这三条**全部绿**。历史教训：线上 20 风格 × 中英所有详情页的
上下篇标签长期显示 `"blog.prev"`，因为代码写 `t('blog.prev')` 而语言包里是
`blog.prevPost`，100 页审计也抓不到（审计只看结构量，不看文案渲染结果）。

清理 i18n 死 key（`scripts/dead-keys.mjs`）前必须排除两类按字面量扫不出、运行时却在用的写法：
动态拼接 ``t(`styles.gallery.tier${n}`)`` 与三元 `t(kind === 'post' ? 'blog.title' : ...)`。
提取 key 一律用**括号配对**，不能只写 `t\(\s*'`。

## 8. 无障碍与对比度

- 对比度必须**算**不能凭观感（`scripts/contrast.mjs`，自动解析各风格 `tokens.css` 的当前值）。
  暗色风格浅字压深底通常天然合格；真正易出问题的是**浅色风格的次要文字**。
- 代码块可读性用 `scripts/probe-code.mjs <styleId>` 在真实浏览器里量 token 颜色
  （curl 拿不到 computed style），最低对比度 ≥ 4.5:1。
- 40px 命中区这条已经是 CI 闸门（见 `docs/architecture/style-authoring-guide.md` 的「验证口径」）。

## 9. 本机（Windows + Git Bash）特有的量具坑

这几条会让「明明没问题的代码」看起来有问题，排查前先进它们的对侧：

- **MSYS 会把参数里的 `/` 换成 Windows 路径**：`NUXT_APP_BASE_URL=/` 变成 `D:/code/Git/`，
  整站 baseURL 成了怪值、所有请求 302。任何带裸 `/` 参数的命令前缀 `MSYS_NO_PATHCONV=1`。
- **系统代理会干扰 curl 与 Node fetch**：命令前缀 `NO_PROXY=127.0.0.1,localhost`，
  curl 再加 `--noproxy '*'`。
- **`node:path` 的 `normalize()` 在 Windows 上把 `/` 变成 `\`**：于是「剥掉前导分隔符」的
  `replace(/^\/+/,'')` 失配，残下的 `\style\x` 又被 `resolve()` 当成「当前盘符的根」，
  解析到目标目录外面 → 整个静态服务器全站 404。URL 路径要按段自己处理，别交给 `normalize`。
- **`http.request()` 不会自动收尾**（只有 `http.get()` 会）：漏掉 `req.end()` 的表现是
  「TCP 连上了、请求从未发出、服务端一个包都收不到、客户端只能等到超时」，
  很容易被误判成服务端或端口的问题。
- **调试用的 headless Chrome 会被用坏**：CDP 脚本挂住不退出且无报错。换一个端口起重起，
  **不要 `taskkill` Chrome**（会连正常使用的窗口一起杀掉）。
- **后台服务要按端口找 PID 停**，`TaskStop` 只杀 shell 不杀 node。
- **build 期间别改文件、别同时跑 vitest**：`.nuxt/tsconfig.json` 会短暂消失，
  测试报 `TSConfckParseError` 之类的假故障。
- **截图空白但 `innerText` 是满的 = HMR 脏**，重启即正常，别去改代码。

## 10. 工具清单

| 脚本                       | 干什么                                                                 |
| -------------------------- | ---------------------------------------------------------------------- |
| `audit-a11y-mobile.mjs`    | CI 审计入口：溢出 / h1 / alt / HTTP 状态 / 子资源 4xx / 40px 命中区    |
| `hit-box.mjs`              | 命中区还原模型，被三个探针与审计共用                                   |
| `serve-static.mjs`         | 按 Caddy 语义起静态产物                                                |
| `probe-subpage-layout.mjs` | 子页构图量化：首条正文位置 / 控件间隙 / 重复标题 / 截断                |
| `probe-touch-targets.mjs`  | 不合格目标按「标签.类名 + 尺寸档」聚合                                 |
| `probe-target-detail.mjs`  | 逐条明细（尺寸 / 文本 / 父级链）                                       |
| `probe-code.mjs`           | 代码块 token 对比度实测                                                |
| `audit-all-styles.mjs`     | 20 风格全量：渲染成功 / i18n key 残留 / 统计数字一致                   |
| `contrast.mjs`             | 解析各风格 tokens.css 算对比度                                         |
| `eval-url.mjs`             | 通用 CDP 求值（读 DOM 比看图可靠）                                     |
| `shot.mjs`                 | CDP 截图（默认打线上，不等 hydration 的 `chrome --screenshot` 不可用） |
| `dead-keys.mjs`            | i18n 死 key 盘点（默认只打印，`--delete` 才写盘）                      |

`scripts/` 下的 `.mjs` 会被 `eslint .` 覆盖；`pnpm spellcheck` 的 glob 是
`**/*.{ts,vue,md,json}`，**不含 `.mjs`**，所以脚本里的注释不过拼写检查，文档里要过。

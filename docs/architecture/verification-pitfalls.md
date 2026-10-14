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
**正反两面都要对**：只验证「缺的时候报红」不够，还要验证「有的时候不报」——
语言入口那条判据第一版把 href 里的 `/en` 段剥掉了，于是任何链接都匹配不上，
拿线上产物（真没入口）跑当然全红，看着像判据生效，其实是恒为 0。

命中区不足要用**锚点自身的 `min-width` 兜底**，不要靠「让站名截断腾地方」：
后者把站点标识削成 `Si…`，是把布局问题转嫁成品牌与信息损失。而且它比想象中更早触发——
按「只有 320 会挤」写的截断规则，实测 390 宽就已经截了（截图能立刻看出来，数字看不出来）。
该让路的是本来就 `overflow-x: auto` 的滚动带，不是标识。

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
- **一整批「小目标 39x40 / 25x40」的假阳性，源头是同一个 tab 上挂了两个驱动**：
  CDP 探针在错误路径上只设 `process.exitCode` 就 return，还开着的 WebSocket 让事件循环
  永不空转 → 进程变僵尸，而且它**还在继续 navigate**。下一轮审计与它抢同一个 tab，
  于是每一行量到的都是「下一张页」（`minimalism /` 那行报的是 `/about` 的数）。
  两道修：① 出错路径必须 `ws.close()` + `process.exit(1)`；② 审计把 `location.pathname`
  随结果一起带回来，与本页应测路径不符就报「串页」并判红——宁可炸，不能静默给出一串
  看着可信的数字。排查手法：`Get-CimInstance Win32_Process -Filter "Name='node.exe'"`
  看有没有上一轮留下的探针进程（`TaskStop` 只杀 shell，不杀它生的 node）。

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

**复现手法**：不必等 CI。审计有 `AUDIT_VIEWPORT` 开关，本机把视口压窄
（`AUDIT_VIEWPORT=320,844`）就等价于「文本变宽」，能在家把溢出钓出来。
但它不是等量替换——320 报出来的可能是只在 320 才触发的另一类脆弱：
实测 `en@320` 有 4 类根因，3 类是页头按钮 `flex:none` + 容器不换行，
1 类是 flex 项缺 `min-width: 0`（英文长词把 min-content 撑宽，
而 `overflow-wrap: break-word` 并不压缩 min-content，只有 `anywhere` 会）。

**溢出归因的三条纪律**（在 `scripts/audit-a11y-mobile.mjs` 里）：
越界 且 没有被 `overflow-x` 的祖先裁剪 且 不是 `position: fixed`，再按右缘取前三。
三条各对应一次真实误指——滚动容器里的锚点 chip（右缘 635）、被撑宽的布局视口
顺带显形的 `.scan-overlay`、以及依赖 `scrollWidth` 精确对齐时接不上导致明细为空。
祖先链还必须记忆化：页面一旦整体越界，几乎所有后代的右缘都超过视口，
逐个走祖先会把 `getComputedStyle` 调到几万次（5 页跑满 7 分钟，且每页都撞 40 秒超时）；
记忆化后同样 5 页 22.7 秒。

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
- **调试用的 headless Chrome 会被用坏，而且一半是我自己造成的**：CDP 脚本挂住不退出且无报错。
  换端口起重起（**不要 `taskkill` Chrome**，会连正常使用的窗口一起杀）。
  两个具体信号：僵尸 tab 的表征是**第一条 `Page.enable` 就超时**；
  而制造僵尸最常见的动作是**中途 kill 掉正在跑量测的审计进程**——它留下的挂死导航
  会让下一个复用该实例的脚本全程卡住。所以要么让它跑完，要么换端口。
  审计脚本每个 CDP 调用都有 40 秒超时并抛出，就是为了把这类事变成一行明确报错，
  而不是「无声挂满 job 时限」。
- **后台服务要按端口找 PID 停**，`TaskStop` 只杀 shell 不杀 node。
- **build 期间别改文件、别同时跑 vitest，也别同时跑 `nuxt dev`**：`.nuxt/tsconfig.json` 会短暂消失，
  测试报 `TSConfckParseError` 之类的假故障。dev 与 build 共用 `.nuxt` 时更狠——client 段全绿、
  server 段抛 `Unexpected token 'default'` 并伴随 `vite-builder/dist/vite-node.mjs … treating it as an
  external dependency`，看着像代码错了，其实是 dev 把 `.nuxt/dist/server` 换成了它的中间产物。
  停掉 dev、`rm -rf .nuxt/dist` 重跑即 exit 0。
- **截图空白但 `innerText` 是满的 = HMR 脏**，重启即正常，别去改代码。
- **同一个 headless 实例跨 build 复用 = 量到旧 CSS**：新产物的 HTML 引用的分片名变了，
  旧实例仍按缓存里的旧名取，改好的规则在页面上查不到，很容易被误判成「选择器优先级不够」
  而越改越糟。判据是把 `document.styleSheets` 的 href 拿去 `.output/public/_nuxt/` 里找——
  找不到就是缓存。换 `--user-data-dir` 起冷实例，别在旧实例上反复量。

## 10. 详情页从没被量过，而它占 560 / 802 页

CI 审计跑的是每风格 5 个列表页（100 页 × 中英）。详情页一个都没进过，
第一次拿 `AUDIT_DETAIL=blog` 扫就抓到两个「全绿但根本读不了」的：

- **metro**：`.detail` 写了 `display: grid` 却没给 `grid-template-columns`，
  隐式轨道按正文里最宽的东西（一个 `pre`）定尺 → 正文列 831-873px，
  而外层 `.metro-page` 是 `overflow-x: clip`。**`document.scrollWidth` 量不到**，
  所以溢出判据全绿，用户看到的是每段右半截被剪掉。
  上一轮有人在这里贴过 `max-width: calc(100vw - 48px)` 的症状补丁——根因是轨道，
  补在子元素上只是把面包屑单独按住了一次。
- **dashboard**：外壳 `.main-inner` 是 12 轨网格，详情页的 `.detail` 没声明跨列，
  于是整篇正文被塞进一格：实测 **18.8px 宽、页面高 70006px**。
  不溢出、h1 唯一、也不是滚动带，三条老判据一条都不响。

两条新判据因此进审计：`藏起来的溢出`（超宽且被 hidden/clip 祖先剪掉，且整条祖先链
都没有滚动区）与 `正文列过窄`（最宽正文块 < 视口 40%）。

**判据也要防误报**：`藏起来的溢出` 第一版只看元素自己的 `overflowX`，
于是代码块里的高亮 `<span>`（宽 800+px，外面的 `pre` 才是滚动区）把 5 个风格全报了。
「能不能滚」必须走完整条祖先链。
同理，40px 命中区要豁免正文里的**行内文字链接**（WCAG 2.5.8 的 inline 例外）——
详情页一量就是 30 个目录/正文链接，硬撑到 40px 反而把正文排坏；
判据一旦开始报合法的东西，人就会开始忽略它，那比没有判据更糟。

## 11. 工具清单

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

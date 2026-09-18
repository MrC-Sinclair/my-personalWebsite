# 多风格 UI 架构（目标架构）

> **状态：阶段 1 / 2 已完成，阶段 3 未开始**。本文档是架构总纲；新增风格的操作步骤见 [style-authoring-guide.md](./style-authoring-guide.md)。
>
> 当前落地情况：`styles/` 下已有 **20 个风格**目录（各含 tokens.css / components / pages / index.ts），
> 画廊页 `/styles` 已上线，风格路由薄壳 `/style/[style]/[...slug]` 已跑通。
> 各风格目前均只实现了首页（单页式锚点导航，见下文「当前信息架构的取舍」），
> 因此注册表里 20 条记录的 `status` 全为 `partial`。
>
> 参考实现：`D:\code\codeWork\Next-generation-UI\style-lab`——一套内容、四种界面风格（新粗野主义 / 新拟态 / 像素风 / 终端机）的纯静态验证项目，本文档的核心契约均来自该项目的已验证结论。

## 一、目标

一个网站，包含 20+ 种 UI 大风格（新粗野主义、新拟态、像素风、终端机、液态玻璃……）。核心哲学一句话：

> **结构各写各的，行为只写一份。**

- **UI 不复用**：每种风格拥有完全独立的页面结构、组件和样式。不是同一套 HTML 换配色——一旦共用骨架，所有风格就会被同一套结构框死，设计必然趋同（style-lab 已验证的结论：像素风的技能是 `█████░░` 字符条，新拟态是内凹轨道渐变条，是两套完全不同的 HTML）。
- **业务逻辑复用**：数据获取、数据转换、通用交互行为全站只有一份，所有风格共享。
- **内容复用**：所有文字来自 @nuxt/content 与 i18n 文件，换风格时内容一个字都不会变。

## 二、已定决策

| 决策点     | 结论                                        | 理由                                                                                |
| ---------- | ------------------------------------------- | ----------------------------------------------------------------------------------- |
| 交付方式   | **每风格独立路由**（`/style/[id]/...`），SSG 静态生成 | URL 可分享、SEO 友好、每风格只加载自己的资源，最贴合「SSG 优先」约束                  |
| 现有设计定位 | **过渡层，逐步替换淘汰**                    | 新风格成熟后现有 Indigo/Nuxt UI 页面降级、最终移除                                   |
| 术语       | 用 **style（风格）**，不用 theme            | 避免与 @nuxtjs/color-mode 的亮暗主题、Nuxt UI 的 theme 配置混淆                      |
| 逻辑复用载体 | composables / types / utils（Nuxt 原生方式） | 不采用 style-lab 的全局 DOMAIN 单例模式，适配 SSR/水合环境                           |

## 三、三层分工

| 层           | style-lab 对应物     | 本项目载体                              | 份数      |
| ------------ | -------------------- | --------------------------------------- | --------- |
| 内容层       | `src/content.js`     | `content/` + `content.config.ts` + `i18n/` | 1 份      |
| 业务逻辑层   | `src/domain.js`      | `composables/` + `types/` + `utils/`    | 1 份      |
| 风格表现层   | `themes/<id>/`       | `styles/<id>/`                          | N 份（目标 20+） |
| 风格注册表   | `themes/registry.js` | `styles/registry.ts`                    | 1 份      |
| 变量契约     | `themes/_base/tokens.css` | `styles/_base/tokens.css`          | 1 份      |

**业务逻辑层是关键的一层**——它是全站唯一的行为实现，回答两个问题：

1. 这份数据要变成什么？（数据转换，如日期→相对时间、技能等级→百分比）
2. 用户操作之后要发生什么？（交互行为，如平滑滚动、菜单开关状态、scroll lock）

## 四、目录约定（目标结构）

```
styles/                    ← 【风格区】每种风格一个目录
  registry.ts              ← 风格注册表：只存元信息，不含实现
  _base/
    tokens.css             ← 变量契约：声明全部必填变量 + 中性回落值
  <style-id>/              ← 如 brutalism / pixel / terminal（kebab-case 英文）
    tokens.css             ← 该风格的变量填表（覆盖 _base 回落值）
    components/            ← 该风格专属组件
    pages/                 ← 该风格的页面结构组件（Index / BlogList / BlogDetail / About / Contact）
    index.ts               ← 风格入口：导出页面组件映射 + 元信息
```

**现状（阶段 2 已完成）**：`styles/` 下已有 20 个风格目录，结构与上述约定一致：
`registry.ts` + `_base/tokens.css` + `<id>/{tokens.css, components/, pages/, index.ts}`。
现有 `components/`、`pages/`、`layouts/`、`assets/css/main.css` 仍属过渡层（过渡风格），随阶段 3 推进逐步淘汰。

### 当前信息架构的取舍（重要）

各风格的 `index.ts` 目前**只导出 `/`** 一个页面（如 `styles/y2k/index.ts` 的 `pages: { '/': Y2KIndex }`），
即每个风格是一个**单页式**长页面：导航全部是页内锚点（`#about` / `#projects` / `#posts` / `#contact`）
加一个跳回 `/styles` 的入口。

这是**有意的决策**，不是未完成：

- 路由壳对未导出的 slug 抛 404，所以只要不导出 `/about` 等路径，就不存在「半成品子页」被访问到的问题；
- 在审美打磨尚未定型的阶段铺开 20 × 4 个子页会产生大量返工——样式一改就要动 80 个文件；
- 单页式同样能完整验证全部契约（token 消费、共享层调用、资源隔离、SSG 预渲染）。

子页扩展（20 风格 × 4 页）排在审美定型之后，见第十一节的阶段 4。

## 五、路由与交付（每风格独立路由）

```
/                          ← 迁移期：过渡风格站点；目标态：风格画廊或默认风格（阶段 3 定稿）
/styles                    ← 风格画廊：列出注册表全部风格（名称 / tier / 状态 / 主色签名）
/style/[style]/...         ← 风格路由薄壳：校验风格 id → 渲染该风格的页面组件
```

约定：

- **薄壳路由**：`pages/style/[style]/[...slug].vue` 不含任何 UI，只做两件事——从注册表解析风格（未知 id 必须抛 404，`throw createError({ statusCode: 404 })`），按 slug 渲染该风格 `index.ts` 导出的页面组件映射
- **SSG 预渲染**：预渲染路由清单由注册表驱动（风格 id × 页面映射枚举），保证 `nuxt generate` 为每个风格生成完整静态页。
  当前实现在 `nuxt.config.ts` 的 `nitro.prerender.routes` 中**手工列出** 21 条（`/styles` + 20 个风格首页），
  新增风格时必须同步维护（该文件内已有注释提醒）——这是当前的一处**手工同步点**，未来可改为由注册表生成
- **i18n 叠加**：沿用 `prefix_except_default` 策略，英文路径为 `/en/style/[id]/...`
- **资源隔离**：每风格页面只加载自己的组件 chunk 与 `tokens.css`，不得全局注入其它风格的样式

### 画廊页的呈现方式

画廊页（`pages/styles.vue`）消费注册表元信息渲染卡片，每张卡片：

- 顶部 6px 色条 + 左下角圆点，取该风格的 `accent`（注册表字段，与 `styles/<id>/tokens.css` 的 `--c-accent` 保持一致），
  让「20 种风格」在画廊里就能看出色彩差异，而不是一视同仁的卡片墙；
- 展示 `name` / `en` / `tier` / `status` / `note`。

**注意**：注册表的 `preview` 字段目前 20 条**全部为空字符串**（尚未产出风格预览图），
即画廊页当前靠 `accent` 做视觉签名、不展示缩略图。该字段保留在契约中，待补图后启用。

## 六、业务逻辑层契约

### 业务 / 表现判定标准

**能用「用户做了什么」描述的，是业务，归共享层；需要用形容词描述的（"圆润地"、"硬切地"），是表现，归风格。**

- 业务（共享层）：滚动到锚点、取博客列表、把等级转成百分比或字符条、菜单开关状态、scroll lock
- 表现（风格层）：按钮圆不圆、阴影硬不硬、首屏是不是海报式拼贴、要不要字符画

**判定失效信号**：如果同一段业务逻辑（如滚动、格式化）在两个风格里各写了一遍，分层就漏了，必须收敛回共享层。

### 共享层只允许包含

- 数据获取：`composables/`（useBlog、useProjects、useAppInfo…）
- 数据转换：`utils/`——「把原始数据变成能直接进模板的值」的纯函数
- 通用交互行为（共享 composable，禁止各风格重写）：`useClipboardCopy`（复制 + 已复制反馈 + 定时器清理）、`useActiveSection`（滚动激活区块 scroll spy）、`useScrollReveal`（进入动画）
- 数据转换（共享 util，禁止各风格重写）：`contentSlug`（内容路径 → 裸 slug）、`formatDate`（日期本地化，短语言码 zh/en 自动归一化）
- 类型定义：`types/`

**禁止**：任何 DOM 结构、class 名、样式出现在共享层。

### 风格与共享层的连接方式

- **数据**：风格组件消费 composable 返回值（沿用「组件不得直接调用 queryCollection」规则）
- **行为**：风格组件调用共享层方法（如平滑滚动 composable），用什么标签（`<button>` / `<a>`）由风格自己决定
- **锚点约定**：区块标注 `data-section="区间名"`，配合全局 `[id] { scroll-margin-top: 5rem }` 平滑滚动

### 生命周期纪律（对应 style-lab 的 mount/unmount 成对）

风格组件中 `onMounted` 申请的一切资源（定时器、事件监听、IntersectionObserver、打字机循环）**必须**在 `onUnmounted` 中清理。路由切换即卸载，残留定时器会往已消失的 DOM 写数据。

## 七、Token 变量契约（`styles/_base/tokens.css`）

`_base` 只做两件事（对应 style-lab 的变量契约设计）：

1. **声明「有哪些变量」**——这是所有风格必须填写的清单
2. **提供中性回落值**——风格漏填时不至于崩掉

清单分组：色彩（bg / surface / text / muted / accent / border…）、形态（radius / border-w）、阴影、字体、字号、间距、动效（`--transition`）、渲染模式（`--img-rendering`）、装饰开关。

**当前 `_base` 声明的完整变量清单**（29 个，风格 `tokens.css` 一律按此填表）：

```
--c-bg  --c-surface  --c-text  --c-muted  --c-accent  --c-border  --c-on-accent
--radius  --radius-sm  --border-w
--shadow  --shadow-press
--font-body  --font-head  --font-mono  --font-smooth
--fs-base  --fs-small  --fs-head  --fs-title  --lh-body
--space  --gap  --page-w
--transition  --press-transform
--img-rendering  --deco
```

约定：

- 风格的 `tokens.css` **只做填表**，不新增全局变量；需要新变量时先在 `_base` 声明（含回落值）再填值
- **允许风格自定义私有变量**（如 liquid-glass 的 `--shadow-lg`），但必须留在该风格 `[data-style='<id>']` 作用域内、
  不得被其它风格引用——这与「UI 不跨风格复用」红线一致
- **不是换值、是换性质**：风格可以改变 token 的性质而非数值——如像素风 `--transition: none`（关掉过渡才像素）、`--img-rendering: pixelated`
- 现有 `assets/css/main.css` 的 `@theme` Design Token 归属过渡风格，随过渡层淘汰，不作为新风格的依赖

## 八、风格注册表（`styles/registry.ts`）

只存元信息、不含实现（体积忽略不计），字段沿用 style-lab 并扩展：

| 字段      | 说明                                                  |
| --------- | ----------------------------------------------------- |
| `id`      | kebab-case 英文标识，同时是路由参数与目录名            |
| `name`    | 中文名（如「新粗野主义」）                             |
| `en`      | 英文名（如 Neo-Brutalism）                             |
| `tier`    | 成本档位 1-3（见下）                                   |
| `tierLabel` | 档位说明                                             |
| `note`    | 一句话风格描述                                        |
| `status`  | `ready`（页面齐全）/ `partial`（仅部分页面）/ `planned`（仅登记未开工） |
| `accent`  | 风格主色（hex）——与 `styles/<id>/tokens.css` 的 `--c-accent` 保持一致；画廊页用它给卡片打色彩签名 |
| `preview` | 画廊预览图路径（**当前 20 条均为空串，尚未产出预览图**） |

**状态字段的用法**：`ready` / `partial` / `planned` 描述的是**页面完成度**，不是代码质量或可用性。
当前 20 个风格都只实现了首页，故 `status` 全为 `partial`——这代表「子页待扩展」，
与第十一节阶段 4 是同一件事，读到时不必当成缺陷。

### tier 成本分级

- **tier 1** = 什么都不用加，纯结构 + 样式（如新粗野主义、新拟态）
- **tier 2** = 还要引入外部资源（点阵字体、位图）
- **tier 3** = 还要写交互脚本（终端风的命令解析、输入历史、打字机）

## 九、红线（不可违反）

1. **UI 不跨风格复用**：`styles/A` 的组件、结构、类名不得被 `styles/B` 引用。跨风格共享的只有：业务逻辑层、token 契约、内容
2. **业务动作只写一份**：风格里发现自己在写「滚动/格式化/取数」逻辑，立即停下，收敛进共享层
3. **全局 reset 不定义组件**：reset 层只做盒模型与基础排版，禁止定义「卡片长什么样」这类组件样式，否则所有风格被框死
4. **风格组件不得直接调用 content API**：必须走 composables（沿用现有规则）
5. **资源成对清理**：`onMounted` 申请的定时器 / 监听器 / observer 必须在 `onUnmounted` 清掉
6. **内容不硬编码**：文案走 i18n 或 content，`aria-label` 走 `t()`；风格组件里不允许出现写死的业务文案

## 十、质量验收（每个新风格的标准）

- **内容同源**：页面所有文字来自内容层 / composables / i18n，无硬编码
- **结构独立**：进入该风格路由时旧风格组件完全卸载（Vitest 断言），证明不是换皮
- **行为走共享层**：滚动、数据转换均调用共享层，无重复实现
- **构建通过**：预渲染成功，该风格全部路由生成静态页
- **真实浏览器截图**：jsdom / 单元测试不做布局计算，「分栏有没有真的并排」只能靠截图确认（style-lab 的经验教训）
- **沿用现有横向规范**：i18n、无障碍（对比度 / aria-label / 触控目标）、移动端安全区域、prefers-reduced-motion、交互效果规范（见 AGENTS.md）

### 视觉验收的可行手段（实测结论）

- **`nuxt generate`（全量预渲染）在本机环境代价极高**：曾连续两次跑到 14~16 分钟仍无产物。
  日常视觉验收用 **dev server + Chrome DevTools Protocol 截图**即可，不必等构建：
  只要截图前显式等待 8~9 秒（让 hydration 与懒加载 CSS 完成），dev 模式下的样式与产物一致。
- **`chrome --screenshot` 不可用**：它在 load 事件后立即截图，不等 hydration，截出的页面缺风格 token（背景全白），
  据此判断视觉问题会得出完全错误的结论；`--virtual-time-budget` 在本机会因页面存在无限动画而永久挂起。
- **需要真实构建产物时用 `nuxt build` + `node .output/server/index.mjs`**（约 4 分钟），比 `generate` 稳定得多。

## 十一、迁移路径

| 阶段   | 内容                                                                     | 状态        |
| ------ | ------------------------------------------------------------------------ | ----------- |
| 阶段 0 | 文档地基：本架构文档 + SOP + AGENTS.md 接入                               | ✅ 已完成    |
| 阶段 1 | 搭骨架：`styles/registry.ts` + `_base/tokens.css` + 第一个风格落地（走通 SOP，验证全部契约） | ✅ 已完成    |
| 阶段 2 | 批量扩风格至 20+，画廊页 `/styles` 上线，新交互行为只进共享层              | ✅ 已完成    |
| 阶段 3 | 现有设计降级 / 淘汰：过渡层移除，`/` 的最终归属定稿                       | 未开始      |
| 阶段 4 | 子页扩展：20 风格 × 4 页（blog / projects / about / contact），`status` 由 `partial` 转 `ready` | 未开始（排在审美定型之后） |

**迁移期纪律**（自本文档生效起）：

- 新增交互行为一律进共享层（composables / utils），不要写死在过渡层组件里
- 过渡层组件只维护、不扩展——不为它新增页面或大功能
- 评估新功能时先问：这个功能属于内容层、业务逻辑层还是风格表现层？只实现一次

**阶段 4 的启动前提**：审美打磨定型。当前尚在逐风格迭代视觉细节（如 liquid-glass 的折射强度、
各风格正文对比度、断词策略），此时铺开子页会导致每次样式调整都要改 80 个文件。
定型后再做子页，收益最大。

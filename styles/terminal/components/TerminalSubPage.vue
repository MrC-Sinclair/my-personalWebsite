<!--
  TerminalSubPage - terminal 风格子页的统一外壳
  ------------------------------------------------------------
  为什么要有这一层：
  子页化后每个风格会有 4 个子页（about / projects / blog / contact），
  它们共享「导航 + 状态条 + 页脚 + 子页标题」这套壳，只有主体区块不同。
  如果让 4 个子页各写一遍这套壳与样式，就是 4 份重复代码——一旦要调
  子页的留白或标题样式，得改 4 个文件。抽成外壳后，子页只写主体。

  这与「UI 不跨风格复用」红线不冲突：本组件是 terminal 风格**内部**的
  复用，不是跨风格复用。跨风格复用依然只有业务逻辑层 / token 契约 / 内容。

  用法：
    <TerminalSubPage :title="t('nav.about')">
      <TerminalBlockAbout />
    </TerminalSubPage>
-->
<template>
  <div id="top" class="page">
    <TerminalSubNav />
    <TerminalStatusBar />

    <main class="term">
      <h1 class="page-title">
        <span class="prompt" aria-hidden="true">$</span>
        <span>{{ title }}</span>
      </h1>

      <slot />
    </main>

    <TerminalFooter />
  </div>
</template>

<script setup lang="ts">
import TerminalSubNav from './TerminalSubNav.vue'
import TerminalStatusBar from './TerminalStatusBar.vue'
import TerminalFooter from './TerminalFooter.vue'

defineProps<{
  /** 子页标题（命令回显式展示，传 i18n 文案） */
  title: string
}>()
</script>

<style scoped>
/* —— 子页根：与首页同一套黑底磷光屏 —— */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background:
    radial-gradient(
      ellipse 120% 60% at 50% -10%,
      color-mix(in srgb, var(--c-accent) 7%, transparent),
      transparent 60%
    ),
    var(--c-bg);
}

/* CRT 扫描线覆盖层（--deco，纯装饰不可交互） */
.page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  background: var(--deco);
}

/* 文本选区：磷光绿反色（风格签名） */
.page ::selection {
  background: var(--c-accent);
  color: var(--c-on-accent);
}

.term {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  width: 100%;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: var(--space);
  min-height: 0;
}

/* 子页标题：命令回显式（提示符 + 命令名），与首页的终端流一致 */
.page-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.6em;
  margin: 0 0 calc(var(--space) * 0.75);
  font-family: var(--font-mono);
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--c-accent);
  text-shadow: 0 0 10px color-mix(in srgb, var(--c-accent) 45%, transparent);
}

.prompt {
  color: var(--c-accent-2);
  user-select: none;
}
</style>

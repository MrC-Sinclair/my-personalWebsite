<!--
  MinimalismSubPage - minimalism 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「吸顶导航 + 子页标题 + 页脚」，
  只有主体区块不同。抽成外壳后子页只写主体，避免这层壳写 4 遍。

  这是 minimalism 风格**内部**的复用，不违反「UI 不跨风格复用」红线
  （红线禁止的是 A 风格引用 B 风格的组件）。

  用法：
    <MinimalismSubPage :title="t('nav.about')">
      <MinimalismAbout />
    </MinimalismSubPage>
-->
<template>
  <div class="page">
    <MinimalismSubNav />

    <main class="main">
      <div class="flow">
        <header class="head">
          <h1 class="title">{{ title }}</h1>
        </header>

        <slot />
      </div>
    </main>

    <MinimalismFooter />
  </div>
</template>

<script setup lang="ts">
import MinimalismSubNav from './MinimalismSubNav.vue'
import MinimalismFooter from './MinimalismFooter.vue'

defineProps<{
  /** 子页标题（传 i18n 文案） */
  title: string
}>()
</script>

<style scoped>
/* —— 纸面：与首页同底同色 —— */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.main {
  flex: 1 0 auto;
}

/* —— 主轴：窄测量单列，与首页区块同宽同留白 —— */
.flow {
  display: grid;
  gap: clamp(48px, 8vw, 88px);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(56px, 9vw, 112px) var(--space) clamp(88px, 12vw, 152px);
}

/* 子页标题：大、轻、紧字距；下缘 hairline 与首页的分隔语言一致 */
.head {
  padding-bottom: clamp(16px, 2vw, 24px);
  border-bottom: var(--border-w) solid var(--c-border);
}

.title {
  margin: 0;
  font-size: clamp(30px, 4.6vw, 52px);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--c-text);
}
</style>

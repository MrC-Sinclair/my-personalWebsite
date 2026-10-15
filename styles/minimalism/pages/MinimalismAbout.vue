<!--
  MinimalismAbout - minimalism 风格的「关于」子页（/style/minimalism/about）
  ------------------------------------------------------------
  壳（吸顶导航 / 子页标题 / 页脚）由 MinimalismSubPage 提供，
  本文件只负责主体区块。区块复用首页同款 MinimalismAbout——
  内容同源，改动一处两处同时生效，不会各写一套。
  传 quiet：让区块头降为题注，不与页头 h1 重复标注。

  末尾的「继续浏览」是本页的收尾：关于页是这条路径的终点，
  没有它就一路读到页脚为止；给出去向也让正文与页脚之间那段
  留白不再是一块没有意义的空场。
-->
<template>
  <MinimalismSubPage :title="t('nav.about')">
    <MinimalismAbout quiet />

    <!-- 收尾导航：关于页的两个去处（不新增内容，只把已有去向摆出来） -->
    <nav class="next" :aria-label="t('common.navigation')">
      <NuxtLink class="next-link" :to="localePath('/style/minimalism/projects')">
        <span class="next-label">{{ t('nav.projects') }}</span>
        <span class="next-go">
          <span>{{ t('home.viewProjects') }}</span>
          <span class="next-arrow" aria-hidden="true">→</span>
        </span>
      </NuxtLink>
      <NuxtLink class="next-link" :to="localePath('/style/minimalism/blog')">
        <span class="next-label">{{ t('nav.blog') }}</span>
        <span class="next-go">
          <span>{{ t('home.viewBlog') }}</span>
          <span class="next-arrow" aria-hidden="true">→</span>
        </span>
      </NuxtLink>
    </nav>
  </MinimalismSubPage>
</template>

<script setup lang="ts">
import MinimalismSubPage from '../components/MinimalismSubPage.vue'
import MinimalismAbout from '../components/MinimalismAbout.vue'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* —— 收尾导航：两条 hairline 之间的去向，与全站的细线语言一致 —— */
.next {
  display: grid;
  gap: 0;
  border-top: var(--border-w) solid var(--c-border);
}

.next-link {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px var(--gap);
  min-height: 44px;
  padding: 18px 2px;
  color: var(--c-text);
  text-decoration: none;
  border-bottom: var(--border-w) solid var(--c-border);
  transition: background var(--transition);
}

.next-link:hover,
.next-link:focus-visible {
  background: var(--deco);
}

.next-link:focus-visible {
  outline: 1px solid var(--c-text);
  outline-offset: -1px;
}

.next-label {
  font-size: clamp(18px, 2.4vw, 24px);
  font-weight: 300;
  letter-spacing: -0.01em;
}

.next-go {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: var(--fs-small);
  color: var(--c-muted);
  transition: color var(--transition);
}

/* 箭头在悬停时右移一格：极简风的克制反馈（不放大不变粗） */
.next-arrow {
  display: inline-block;
  transition: transform var(--transition);
}

.next-link:hover .next-go,
.next-link:focus-visible .next-go {
  color: var(--c-text);
}

.next-link:hover .next-arrow,
.next-link:focus-visible .next-arrow {
  transform: translateX(4px);
}

@media (prefers-reduced-motion: reduce) {
  .next-link,
  .next-go,
  .next-arrow {
    transition: none;
  }

  .next-link:hover .next-arrow,
  .next-link:focus-visible .next-arrow {
    transform: none;
  }
}
</style>

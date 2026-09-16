<!--
  风格画廊 —— 多风格架构的入口页

  数据源仅 styles/registry.ts：新增风格注册后自动出现，无需修改此页。
  本页属于过渡层风格的页面，沿用过渡层 Design Token。
-->
<script setup lang="ts">
import { styleRegistry, type StyleMeta } from '~/styles/registry'

const { t, locale } = useI18n()
const localePath = useLocalePath()

// 中文名/英文名按当前语言展示
function displayName(item: StyleMeta) {
  return locale.value.startsWith('zh') ? item.name : item.en
}

// 完成度徽章的展示配置
const statusConfig: Record<StyleMeta['status'], { key: string; className: string }> = {
  ready: { key: 'styles.gallery.statusReady', className: 'bg-success/10 text-success' },
  partial: { key: 'styles.gallery.statusPartial', className: 'bg-warning/10 text-warning' },
  planned: { key: 'styles.gallery.statusPlanned', className: 'bg-gray-500/10 text-gray-500' },
}

useHead({
  title: () => `${t('styles.gallery.title')} · ${t('home.name')}`,
  meta: () => [
    { name: 'description', content: t('styles.gallery.description') },
    { property: 'og:title', content: `${t('styles.gallery.title')} · ${t('home.name')}` },
    { property: 'og:description', content: t('styles.gallery.description') },
  ],
})
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
    <!-- 页头 -->
    <header class="mb-10 text-center md:mb-14">
      <h1 class="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark md:text-4xl">
        {{ t('styles.gallery.title') }}
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-text-secondary-light dark:text-text-secondary-dark">
        {{ t('styles.gallery.description') }}
      </p>
    </header>

    <!-- 风格卡片网格 -->
    <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="item in styleRegistry" :key="item.id">
        <NuxtLink
          :to="localePath(`/style/${item.id}`)"
          :style="{ '--card-accent': item.accent }"
          class="style-card group relative flex h-full flex-col rounded-xl border border-border-light bg-surface-light p-5 shadow-sm transition-all duration-normal hover:-translate-y-1 hover:shadow-lg dark:border-border-dark dark:bg-surface-dark"
        >
          <div class="mb-3 flex items-start justify-between gap-2">
            <div>
              <h2
                class="flex items-center gap-2 text-lg font-semibold text-text-primary-light dark:text-text-primary-dark"
              >
                <span class="accent-dot" aria-hidden="true" />
                {{ displayName(item) }}
              </h2>
              <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">{{ item.en }}</p>
            </div>
            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-xs"
              :class="statusConfig[item.status].className"
            >
              {{ t(statusConfig[item.status].key) }}
            </span>
          </div>

          <p class="mb-4 flex-1 text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
            {{ item.note }}
          </p>

          <div class="flex items-center justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
            <span>{{ t('styles.gallery.tier') }} {{ item.tier }} · {{ item.tierLabel }}</span>
            <span
              class="font-medium text-primary-600 transition-colors duration-fast group-hover:text-primary-400 dark:text-primary-400"
            >
              {{ t('styles.gallery.enter') }} →
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/*
  画廊卡片的风格签名
  ------------------------------------------------------------
  卖 20 种风格的页面自己必须有风格。每张卡片用该风格 tokens.css 的
  --c-accent（经 registry.ts 的 accent 字段以 --card-accent 传入）
  画一条顶部色带 + 一枚标题圆点；hover 时色带加厚、圆点放大。

  色带用伪元素实现、不占布局空间，所以 hover 加厚不会顶动内容；
  上浮与阴影继续交给 Tailwind 的 hover:-translate-y-1 / hover:shadow-lg，
  这里不重复声明 box-shadow，避免同类选择器特异性打架。
*/
.style-card::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  content: '';
  background: var(--card-accent);
  border-radius: 0.75rem 0.75rem 0 0;
  transition: height 200ms ease;
}

.style-card:hover::before {
  height: 6px;
}

/* 标题前的风格色圆点，外圈为同色低透明光晕 */
.accent-dot {
  flex: none;
  width: 9px;
  height: 9px;
  background: var(--card-accent);
  border-radius: 9999px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--card-accent) 20%, transparent);
  transition: transform 200ms ease;
}

.style-card:hover .accent-dot {
  transform: scale(1.35);
}

/* 尊重 prefers-reduced-motion：只关过渡与位移，色彩签名保留 */
@media (prefers-reduced-motion: reduce) {
  .style-card::before,
  .accent-dot {
    transition: none;
  }

  .style-card:hover::before {
    height: 3px;
  }

  .style-card:hover .accent-dot {
    transform: none;
  }
}
</style>

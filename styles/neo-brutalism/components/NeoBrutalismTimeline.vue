<!--
  NeoBrutalismTimeline - neo-brutalism 风格经历时间线
  ------------------------------------------------------------
  海报式错落时间线：条目在 12 栏里左右交错下沉（左 7 栏 /
  右 5 栏并下沉），纸底与海报黄底交替；时间段是黑底等宽字
  「铅块」。数据来自共享层 useAppInfo 的 timeline（页面传入）。
  窄屏回退为单列，交错与撞色签名保留。
-->
<template>
  <section class="timeline">
    <NeoBrutalismSectionTitle :text="t('about.experience')" tone="ink" />

    <ol class="list">
      <li v-for="item in safeItems" :key="`${item.period}-${item.title}`" class="item">
        <span class="period">{{ item.period }}</span>
        <div class="body">
          <h3 class="title">{{ item.title }}</h3>
          <p class="org">{{ item.organization }}</p>
          <p class="desc">{{ item.description }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import type { TimelineItem } from '~/types/site'
import NeoBrutalismSectionTitle from './NeoBrutalismSectionTitle.vue'

const props = defineProps<{
  /** 时间线条目（来自 useAppInfo） */
  items: TimelineItem[]
}>()

const { t } = useI18n()

/** 防御性归一化：仅保留字段齐全的条目 */
const safeItems = computed<TimelineItem[]>(() =>
  (Array.isArray(props.items) ? props.items : []).filter((item) => !!item.title && !!item.period),
)
</script>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 32px;
  border-top: calc(var(--border-w) * 2) solid var(--c-border);
}

.list {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
  align-items: start;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* —— 错落排布：左 7 栏 / 右 5 栏下沉，第二排再交错 —— */
.item:nth-child(4n + 1) {
  grid-column: 1 / 8;
}

.item:nth-child(4n + 2) {
  grid-column: 8 / -1;
  margin-top: 44px;
}

.item:nth-child(4n + 3) {
  grid-column: 2 / 9;
}

.item:nth-child(4n + 4) {
  grid-column: 9 / -1;
  margin-top: 44px;
}

.item {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 18px 20px;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

/* 偶数条目换海报黄底，纸黄交替 */
.item:nth-child(even) {
  background: var(--c-accent);
  color: var(--c-on-accent);
}

.item:hover {
  transform: translate(-3px, -3px);
  box-shadow: 9px 9px 0 var(--c-border);
}

/* —— 时间段：黑底等宽字铅块 —— */
.period {
  justify-self: start;
  padding: 3px 10px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-bg);
  background: var(--c-text);
}

.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 900;
  line-height: 1.3;
}

.org {
  margin: 2px 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
}

.desc {
  margin: 6px 0 0;
  font-size: 15px;
  line-height: 1.7;
}

/* —— 窄屏：单列，保留撞色与硬影 —— */
@media (max-width: 860px) {
  .list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .item:nth-child(4n + 2),
  .item:nth-child(4n + 4) {
    margin-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .item {
    transition: none;
  }

  .item:hover {
    transform: none;
  }
}
</style>

<!--
  PixelAboutBlock - pixel 风格 ABOUT 对话框（首页与 /about 子页共用）
  ------------------------------------------------------------
  原先这段「简介段落 + 经历时间线」写在 PixelIndex 的模板里，子页化后
  首页与 /about 需要同一份内容，抽出来单一来源；首页只保留
  <PixelAboutBlock class="col-full" id="about" data-section="about" />。

  游戏语义：这是「角色档案」对话框——先一段自述（prose），再一列
  「存档记录」式经历条目（period 徽章 + 标题@组织 + 描述）。
  id / data-section / class 由使用处透传到 PixelPanel 的根元素。
  数据来自共享层 useAppInfo 的 timeline（无需异步：随 locale 变化）。

  title 可覆盖：首页沿用导航词 nav.about，/about 子页传 about.title
  （「关于我」）——同一块面板在两处的层级位置不同，标题随之升级。

  用法：
    <PixelAboutBlock class="col-full" id="about" data-section="about" />
    <PixelAboutBlock :title="t('about.title')" />
-->
<template>
  <PixelPanel head="ABOUT" :title="panelTitle" :level="level">
    <p class="prose">{{ t('about.description') }}</p>
    <ul v-if="items.length" class="timeline">
      <li v-for="item in items" :key="`${item.period}-${item.title}`" class="tl-row">
        <span class="tl-period">{{ item.period }}</span>
        <div class="tl-body">
          <p class="tl-head">
            {{ item.title }}<span class="tl-org"> @ {{ item.organization }}</span>
          </p>
          <p class="tl-desc">{{ item.description }}</p>
        </div>
      </li>
    </ul>
    <PixelEmpty v-else :message="t('projects.noResults')" />
  </PixelPanel>
</template>

<script setup lang="ts">
import type { TimelineItem } from '~/types/site'
import PixelPanel from './PixelPanel.vue'
import PixelEmpty from './PixelEmpty.vue'

/** 面板标题：默认取导航词，子页可传 about.title 覆盖；
 *  level 同理——子页把本块当页头用，标题需升为 h1 */
const { title = '', level = 2 } = defineProps<{
  title?: string
  level?: 1 | 2
}>()

const { t } = useI18n()
const { timeline } = useAppInfo()

const panelTitle = computed(() => title || t('nav.about'))

/** 防御：timeline 非数组时退化为空列表（不渲染空 <ul>） */
const items = computed<TimelineItem[]>(() => (Array.isArray(timeline.value) ? timeline.value : []))
</script>

<style scoped>
/* —— 自述段落（与首页 CONTACT 面板的 .prose 同款，scoped 不跨组件） —— */
.prose {
  margin: 0;
  max-width: 70ch;
}

/* —— 经历时间线：存档记录式条目 —— */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tl-row {
  display: grid;
  grid-template-columns: minmax(96px, auto) 1fr;
  align-items: start;
  gap: 12px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--c-bg) 55%, var(--c-surface));
  border: 2px solid color-mix(in srgb, var(--c-muted) 40%, transparent);
}

/* 列表项 hover：底色轻微变化（瞬时，无过渡） */
.tl-row:hover {
  background: color-mix(in srgb, var(--c-accent) 14%, var(--c-surface));
  border-color: var(--c-border);
}

/* 期间徽章：草绿底 + 等宽数字 */
.tl-period {
  padding: 2px 8px;
  font-size: var(--fs-small);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  border: 2px solid var(--c-border);
}

.tl-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tl-head {
  margin: 0;
  font-weight: 700;
  color: var(--c-text);
}

.tl-org {
  font-weight: 400;
  color: var(--c-muted);
}

.tl-desc {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 窄屏：徽章与正文改为纵排，避免 96px 徽章挤掉正文 */
@media (max-width: 559px) {
  .tl-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>

<!--
  MetroAboutBlock - Metro 风格「关于」内容块（首页与 /about 共用）
  ------------------------------------------------------------
  首页关于区块里那块 2x2 的紫色大 Tile：自述 + 经历时间线。
  抽成独立组件后，首页与子页共用同一份内容，避免两处各写一遍
  导致后续改文案时漂移。技能 Tiles 不在这里——它由调用方在
  mosaic 里继续排出（首页与子页一致）。

  数据来自共享层 useAppInfo 的 timeline（随 locale 变化）。
-->
<template>
  <MetroTile span="large" variant="violet" class="about-block">
    <p class="about__heading">{{ t('about.description') }}</p>
    <div>
      <p class="about__exp-label">{{ t('about.experience') }}</p>
      <ol class="about__timeline">
        <li v-for="item in safeTimeline" :key="item.period" class="about__row">
          <span class="about__period">{{ item.period }}</span>
          <span class="about__role">{{ item.title }} · {{ item.organization }}</span>
        </li>
      </ol>
    </div>
  </MetroTile>
</template>

<script setup lang="ts">
import MetroTile from './MetroTile.vue'

const { t } = useI18n()
const { timeline } = useAppInfo()

// 防御：数组字段非数组时回退为空列表
const safeTimeline = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))
</script>

<style scoped>
.about__heading {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(19px, 2vw, 26px);
  font-weight: 400;
  line-height: 1.4;
}

.about__exp-label {
  margin: 0 0 10px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.about__timeline {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.about__row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
}

.about__period {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
}

.about__role {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}
</style>

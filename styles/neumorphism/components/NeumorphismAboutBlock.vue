<!--
  NeumorphismAboutBlock - neumorphism 风格「关于」面板的内容
  ------------------------------------------------------------
  原先这段（小节标题 + 经历时间线）写在 NeumorphismIndex 的模板里，
  子页化后首页与 /about 需要同一份内容，抽出来单一来源。

  新拟态语义：时间线是一条从材料里凸出来的轨道——凸起圆点做节点，
  期间是凹槽芯片（inset 阴影），标题与正文平铺在材料表面。
  数据来自共享层 useAppInfo 的 timeline（随 locale 变化，无需异步）。
-->
<template>
  <div class="about">
    <h3 class="block-title">{{ t('about.experience') }}</h3>
    <ol class="timeline">
      <li v-for="item in items" :key="item.title" class="tl-item">
        <span class="tl-dot" aria-hidden="true" />
        <div class="tl-body">
          <div class="tl-head">
            <h4 class="tl-title">{{ item.title }}</h4>
            <span class="tl-period">{{ item.period }}</span>
          </div>
          <p class="tl-org">{{ item.organization }}</p>
          <p class="tl-desc">{{ item.description }}</p>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { TimelineItem } from '~/types/site'

const { t } = useI18n()
const { timeline } = useAppInfo()

/** 防御：timeline 非数组时退化为空列表 */
const items = computed<TimelineItem[]>(() => (Array.isArray(timeline.value) ? timeline.value : []))
</script>

<style scoped>
/* —— 区块标题（面板内的小节标题，与首页同款） —— */
.block-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-muted);
}

/* —— 时间线：凸起圆点 + 凹槽期间芯片 —— */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tl-item {
  position: relative;
  padding-left: 32px;
}

.tl-dot {
  position: absolute;
  top: 7px;
  left: 0;
  width: 14px;
  height: 14px;
  background: var(--deco);
  border-radius: 50%;
  box-shadow: 2px 2px 5px #a3b1c6, -2px -2px 5px #ffffff;
}

.tl-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tl-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 14px;
}

.tl-title {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
}

.tl-period {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-muted);
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: inset 2px 2px 5px #a3b1c6, inset -2px -2px 5px #ffffff;
}

.tl-org {
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent);
}

.tl-desc {
  margin: 0;
  color: var(--c-muted);
}
</style>

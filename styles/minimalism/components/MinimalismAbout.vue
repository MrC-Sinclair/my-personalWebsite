<!--
  MinimalismAbout - minimalism 风格的「关于 / 技能 / 经历」区块
  ------------------------------------------------------------
  词典式排版：左列区块头（关于我），右列两组「词条」——
  技能（类别 → 顿点连接的纯文本技能串，无标签盒）与经历
  （等宽时间段 → 职位 · 组织 → 描述）。行与行之间用 hairline
  细线分隔，悬停时浮起 --deco 静默底色（最小限度的反馈）。
  数据来自共享层 useAppInfo（skillGroups / timeline），数组
  字段全部做 Array.isArray 防御。
-->
<template>
  <MinimalismSection
    id="about"
    data-section="about"
    :eyebrow="t('nav.about')"
    :title="t('about.title')"
    :desc="t('about.description')"
  >
    <!-- 技能：类别 → 纯文本技能串 -->
    <h3 class="sub">{{ t('about.skills') }}</h3>
    <ul class="def-list">
      <li v-for="group in groups" :key="group.category" class="def-row">
        <span class="def-term">{{ group.category }}</span>
        <span class="def-items">
          <span v-for="skill in group.skills" :key="skill" class="def-item">{{ skill }}</span>
        </span>
      </li>
    </ul>

    <!-- 经历：时间段 → 职位 · 组织 → 描述 -->
    <h3 class="sub sub-later">{{ t('about.experience') }}</h3>
    <ol class="def-list">
      <li v-for="item in timelineItems" :key="`${item.period}-${item.title}`" class="xp-row">
        <span class="xp-period">{{ item.period }}</span>
        <div class="xp-main">
          <p class="xp-title">
            {{ item.title }}<span v-if="item.organization" class="xp-org"> · {{ item.organization }}</span>
          </p>
          <p class="xp-desc">{{ item.description }}</p>
        </div>
      </li>
    </ol>
  </MinimalismSection>
</template>

<script setup lang="ts">
import MinimalismSection from './MinimalismSection.vue'

const { t } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { skillGroups, timeline } = useAppInfo()

/** 技能分组防御：skills 数组字段逐项检查，异常时回退空数组 */
const groups = computed(() =>
  (Array.isArray(skillGroups.value) ? skillGroups.value : []).map((group) => ({
    category: group.category,
    skills: Array.isArray(group.skills) ? group.skills : [],
  })),
)

/** 经历防御：时间线数组异常时回退空列表 */
const timelineItems = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))
</script>

<style scoped>
/* —— 词条小标：安静的间隔标签 —— */
.sub {
  margin: 0 0 6px;
  font-size: var(--fs-small);
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--c-muted);
}

.sub-later {
  margin-top: var(--space);
}

/* —— 词典行：hairline 分隔 + 悬停静默渲染 —— */
.def-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.def-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 4px 20px;
  padding: 14px 10px;
  border-top: var(--border-w) solid var(--c-border);
  transition: background var(--transition);
}

.def-row:hover {
  background: var(--deco);
}

.def-term {
  padding-top: 2px;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 技能串：顿点连接的纯文本（无标签盒，内容优先） */
.def-items {
  min-width: 0;
  line-height: 1.9;
  color: var(--c-text);
  /* 用 break-word 而非 anywhere：放不下时把整个技能名（如 ECharts）
     移到下一行，而不是在词中间劈开（anywhere 会折成 EC/harts）；
     极长的单词仍可断开，防溢出能力不丢 */
  overflow-wrap: break-word;
}

.def-item + .def-item::before {
  content: '·';
  margin: 0 9px;
  color: var(--c-muted);
}

/* —— 经历行：等宽时间段 → 职位 · 组织 → 描述 —— */
.xp-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 4px 20px;
  padding: 16px 10px;
  border-top: var(--border-w) solid var(--c-border);
  transition: background var(--transition);
}

.xp-row:hover {
  background: var(--deco);
}

.xp-period {
  padding-top: 3px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
  white-space: nowrap;
}

.xp-title {
  margin: 0;
  font-weight: 600;
  color: var(--c-text);
}

.xp-org {
  font-weight: 400;
  color: var(--c-muted);
}

.xp-desc {
  margin: 4px 0 0;
  color: var(--c-muted);
}

/* —— 窄屏：词条退化为单列堆叠（回退布局不回退设计） —— */
@media (max-width: 560px) {
  .def-row,
  .xp-row {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .def-row,
  .xp-row {
    transition: none;
  }
}
</style>

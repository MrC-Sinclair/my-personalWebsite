<!--
  RetroComputerAboutBlock - 复古电脑风格「关于」窗口的内容
  ------------------------------------------------------------
  原先这段（自述 + 经历时间线 + 技能凹槽）写在 RetroComputerIndex 的
  模板里，子页化后首页与 /about 需要同一份内容，抽出来单一来源。

  桌面隐喻：这是「记事本」窗口里的文档——自述段落在上，经历是带
  深蓝左侧竖条的条目，技能是白色凹陷槽（像只读文本框）。
  数据来自共享层 useAppInfo（随 locale 变化，无需异步）。
-->
<template>
  <div class="rc-about">
    <p class="rc-about__intro">{{ t('about.description') }}</p>

    <h3 class="rc-sub">{{ t('about.experience') }}</h3>
    <ol class="rc-timeline">
      <li v-for="item in safeTimeline" :key="item.period" class="rc-timeline__item">
        <p class="rc-timeline__head">
          <span class="rc-timeline__period">{{ item.period }}</span>
          <span class="rc-timeline__title">{{ item.title }} · {{ item.organization }}</span>
        </p>
        <p class="rc-timeline__desc">{{ item.description }}</p>
      </li>
    </ol>

    <h3 class="rc-sub">{{ t('about.skills') }}</h3>
    <div class="rc-skills">
      <div v-for="group in safeSkillGroups" :key="group.category" class="rc-skills__group">
        <h4 class="rc-skills__label">{{ group.category }}</h4>
        <ul class="rc-skills__well">
          <li v-for="skill in safeSkillList(group)" :key="skill" class="rc-skills__item">
            {{ skill }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'

const { t } = useI18n()
const { skillGroups, timeline } = useAppInfo()

// —— 防御：数组字段非数组时回退为空列表 ——
const safeSkillGroups = computed(() => (Array.isArray(skillGroups.value) ? skillGroups.value : []))
const safeTimeline = computed(() => (Array.isArray(timeline.value) ? timeline.value : []))

/** 防御：技能列表非数组时回退为空列表 */
function safeSkillList(group: SkillGroup): string[] {
  return Array.isArray(group.skills) ? group.skills : []
}
</script>

<style scoped>
.rc-about__intro {
  margin: 0 0 14px;
}

/* 小节标题：深蓝下划线（像菜单分组线） */
.rc-sub {
  margin: 18px 0 10px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--c-accent);
  font-family: var(--font-head);
  font-size: var(--fs-title);
}

/* ============ 经历时间线 ============ */
.rc-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}

.rc-timeline__item {
  padding: 10px 12px;
  box-shadow: inset 3px 0 0 0 var(--c-accent);
}

.rc-timeline__item:hover {
  background: #d4d4d4;
}

.rc-timeline__item + .rc-timeline__item {
  margin-top: 6px;
}

.rc-timeline__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.rc-timeline__period {
  padding: 2px 8px;
  background: var(--c-accent);
  color: var(--c-on-accent);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  white-space: nowrap;
}

.rc-timeline__title {
  font-weight: 700;
}

.rc-timeline__desc {
  margin: 6px 0 0;
  color: var(--c-muted);
}

/* ============ 技能：白色凹陷槽（像文本输入框）============ */
.rc-skills {
  display: grid;
  gap: 12px;
}

.rc-skills__label {
  margin: 0 0 6px;
  font-family: var(--font-head);
  font-size: var(--fs-base);
}

.rc-skills__well {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 8px 10px;
  background: #ffffff;
  border: var(--border-w) solid;
  border-color: var(--c-border) #ffffff #ffffff var(--c-border);
  box-shadow: inset 1px 1px 0 0 #0a0a0a;
  list-style: none;
}

.rc-skills__item {
  color: var(--c-text);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
}
</style>

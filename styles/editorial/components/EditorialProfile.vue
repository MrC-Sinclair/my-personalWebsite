<!--
  EditorialProfile - editorial 风格的「01 关于」区块
  ------------------------------------------------------------
  杂志「人物特稿」版面：左栏为导语（about.description，
  首字下沉 drop cap 是本风格签名）+ 技能目录（分类小标签
  带尾随细线，技能以衬线斜体排成「印刷目录」行）；右栏为
  履历（工作/教育时间线，期刊号式编号 + 墨绿时间注记），
  两栏之间以 hairline 细线分隔，窄屏回退单栏。
-->
<template>
  <section id="about" class="section" data-section="about">
    <EditorialSectionHead :no="'01'" :title="t('about.title')" />

    <div class="body">
      <!-- 左栏：导语 + 技能目录 -->
      <div class="col col-intro">
        <p class="standfirst">{{ t('about.description') }}</p>

        <h3 class="sub">{{ t('about.skills') }}</h3>
        <div v-if="skillGroups.length" class="skill-groups">
          <div v-for="group in skillGroups" :key="group.category" class="skill-group">
            <h4 class="skill-cat">{{ group.category }}</h4>
            <ul class="skill-list">
              <li v-for="skill in groupSkills(group)" :key="skill" class="skill">{{ skill }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 右栏：履历时间线 -->
      <div class="col col-exp">
        <h3 class="sub">{{ t('about.experience') }}</h3>
        <ol v-if="timeline.length" class="timeline">
          <li v-for="(item, i) in timeline" :key="item.period" class="entry">
            <span class="entry-no" aria-hidden="true">{{ padNo(i + 1) }}</span>
            <div class="entry-main">
              <p class="entry-period">{{ item.period }}</p>
              <h4 class="entry-title">{{ item.title }}</h4>
              <p class="entry-org">{{ item.organization }}</p>
              <p class="entry-desc">{{ item.description }}</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { SkillGroup } from '~/types/site'
import EditorialSectionHead from './EditorialSectionHead.vue'

const { t } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { skillGroups, timeline } = useAppInfo()

/** 两位编号（01、02…） */
function padNo(n: number): string {
  return String(n).padStart(2, '0')
}

/** 技能防御：只保留非空技能项 */
function groupSkills(group: SkillGroup): string[] {
  return (Array.isArray(group.skills) ? group.skills : [])
    .map((skill) => String(skill).trim())
    .filter(Boolean)
}
</script>

<style scoped>
.section {
  --ink-soft: color-mix(in srgb, var(--c-text) 32%, transparent);
}

/* 非对称双栏：左 5 / 右 7，中缝 hairline */
.body {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: clamp(24px, 4vw, 48px);
  margin-top: calc(var(--space) * 1.1);
}

/* 栏目小标签：小字 + 尾随细线 */
.sub {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.26em;
  color: var(--c-accent);
}

.sub::after {
  flex: 1 1 auto;
  height: 1px;
  content: '';
  background: var(--c-border);
}

/* 导语：衬线正文 + 首字下沉（印刷签名） */
.standfirst {
  margin: 0 0 calc(var(--space) * 1.1);
  font-family: var(--font-head);
  font-size: clamp(19px, 2.1vw, 23px);
  line-height: 1.72;
  color: var(--c-text);
}

.standfirst::first-letter {
  float: left;
  padding-right: 10px;
  font-size: 3.05em;
  font-weight: 700;
  line-height: 0.82;
  color: var(--c-accent);
}

/* 技能目录：分类 + 衬线斜体技能行（中圆点分隔） */
.skill-groups {
  display: grid;
  gap: 18px;
}

.skill-cat {
  margin: 0 0 4px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--c-muted);
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skill {
  font-family: var(--font-head);
  font-size: 17px;
  font-style: italic;
  line-height: 1.7;
  color: var(--c-text);
}

/* 目录行分隔点：印刷目录式中圆点 */
.skill + .skill::before {
  margin: 0 9px;
  content: '·';
  color: var(--c-accent);
}

/* 履历：条目间 hairline，时间注记用墨绿第二印刷色 */
.timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  gap: 10px 16px;
  padding: 18px 0;
}

.entry + .entry {
  border-top: var(--border-w) solid var(--c-border);
}

.entry-no {
  padding-top: 4px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-accent);
}

.entry-main {
  min-width: 0;
}

.entry-period {
  margin: 0 0 4px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  color: var(--c-accent-2);
}

.entry-title {
  margin: 0 0 2px;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  line-height: 1.3;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.entry-org {
  margin: 0 0 8px;
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--c-muted);
}

.entry-org::before {
  margin-right: 8px;
  content: '——';
  color: var(--ink-soft);
}

.entry-desc {
  margin: 0;
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
}

/* 窄屏：双栏回退单栏，右栏加顶部细线（保留分隔语义） */
@media (max-width: 880px) {
  .body {
    grid-template-columns: 1fr;
  }

  .col-exp {
    padding-top: 22px;
    border-top: var(--border-w) solid var(--c-border);
  }

  .entry {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>

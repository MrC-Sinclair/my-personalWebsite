<!--
  TerminalBlockSkills - terminal 风格「技能栈」区块
  ------------------------------------------------------------
  技能不做进度条（共享层 SkillGroup 没有等级数据，不虚构），
  改用终端目录树形态：分组为琥珀色目录名，技能为 ├─/└─ 树形
  文本行（前缀为伪元素装饰，读屏不朗读）。行 hover 提亮。
  数据来自共享层 useAppInfo（skillGroups 随 i18n 自动更新）。
-->
<template>
  <div class="blk">
    <ul class="groups">
      <li v-for="group in groups" :key="group.category" class="group">
        <p class="group-name">
          <span class="group-glyph" aria-hidden="true">▍</span>
          {{ group.category }}
          <span class="group-count" aria-hidden="true">({{ group.skills.length }})</span>
        </p>
        <ul class="skills">
          <li v-for="skill in group.skills" :key="skill" class="skill">
            <span class="skill-name">{{ skill }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// —— 共享层数据（同步 computed，随 i18n 自动更新） ——
const { skillGroups } = useAppInfo()

/** 防御：确保为分组数组（skillGroups 来自 i18n computed，恒为数组） */
const groups = computed(() => {
  const list = skillGroups.value
  return Array.isArray(list) ? list : []
})
</script>

<style scoped>
.blk {
  padding: 4px 0;
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 分组名：琥珀 + 左侧竖条（ls -l 的目录感） */
.group-name {
  display: flex;
  align-items: center;
  margin: 0;
  color: var(--c-accent-2);
  overflow-wrap: break-word;
}

.group-glyph {
  color: var(--c-text);
  text-shadow: 0 0 6px color-mix(in srgb, var(--c-text) 55%, transparent);
}

.group-count {
  margin-left: 6px;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.skills {
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}

/* 技能行：├─ 树形前缀（末行自动转 └─），hover 提亮 */
.skill {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 2px 0 2px 28px;
  color: var(--c-text);
}

.skill::before {
  content: '├─';
  position: absolute;
  left: 8px;
  color: var(--c-border);
}

.skill:last-child::before {
  content: '└─';
}

.skill:hover {
  color: var(--c-accent);
}

.skill:hover::before {
  color: var(--c-text);
}

.skill-name {
  overflow-wrap: break-word;
}

.skill-name::before {
  content: '[';
  color: var(--c-muted);
}

.skill-name::after {
  content: ']';
  color: var(--c-muted);
}
</style>

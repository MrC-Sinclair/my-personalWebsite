<!--
  NeoBrutalismSectionTitle - neo-brutalism 风格区块标题
  ------------------------------------------------------------
  「盖章式」标题：一块微微歪斜的实心色块压在区块左上角，
  就像海报上盖下去的橡皮章。三种墨色：
  ink（黑底纸字）/ paper（纸底黑字，用于黑块内部）/ accent（海报黄底黑字）。
-->
<template>
  <h2 class="nb-title" :class="`is-${tone}`">{{ text }}</h2>
</template>

<script setup lang="ts">
/** 标题墨色：ink = 黑底反白；paper = 纸底黑字（黑块内用）；accent = 海报黄底 */
withDefaults(defineProps<{
  /** 标题文案（i18n） */
  text: string
  /** 墨色档位，默认 ink */
  tone?: 'ink' | 'paper' | 'accent'
}>(), {
  tone: 'ink',
})
</script>

<style scoped>
.nb-title {
  align-self: flex-start;
  margin: 0;
  padding: 4px 16px;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: 0.02em;
  /* 盖章的歪斜感（装饰） */
  transform: rotate(-0.8deg);
}

.is-ink {
  background: var(--c-text);
  color: var(--c-bg);
}

.is-paper {
  background: var(--c-bg);
  color: var(--c-text);
}

.is-accent {
  background: var(--c-accent);
  color: var(--c-on-accent);
  box-shadow: 4px 4px 0 var(--c-border);
}
</style>

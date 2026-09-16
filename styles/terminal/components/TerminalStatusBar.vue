<!--
  TerminalStatusBar - terminal 风格顶部状态条
  ------------------------------------------------------------
  终端窗口的标题栏/状态条：左侧「访客@主机名」会话标识（主机名
  由站点名 t('home.name') 派生，属展示转换），右侧风格画廊入口
  （站内路由，localePath 包裹，写成 cd 命令样式的可点击链接）。
  hover 反色为琥珀底，瞬时切换（--transition: none 是本风格性质）。
-->
<template>
  <header class="bar">
    <p class="session">
      <span class="dot" aria-hidden="true">●</span>
      <span class="host">{{ host }}:~</span>
    </p>

    <NuxtLink class="gallery" :to="localePath('/styles')">
      <span class="gallery-cmd" aria-hidden="true">cd&nbsp;</span>
      <span class="gallery-label">{{ t('styles.gallery.enter') }}</span>
      <span class="gallery-arrow" aria-hidden="true">&nbsp;↗</span>
    </NuxtLink>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

/** 会话主机名：由站点名派生的小写串（纯展示转换，非业务逻辑） */
const host = computed(() => `guest@${t('home.name')}`.toLowerCase())
</script>

<style scoped>
.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
  min-height: 44px;
  padding: 6px var(--space);
  background: var(--c-surface);
  border-bottom: var(--border-w) solid var(--c-border);
}

.session {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
  min-width: 0;
  overflow-wrap: anywhere;
}

/* 磷光绿呼吸点：表示「会话在线」 */
.dot {
  color: var(--c-text);
  text-shadow: 0 0 6px color-mix(in srgb, var(--c-text) 55%, transparent);
}

.host {
  color: var(--c-text);
}

/* 画廊入口：cd 命令样式，hover 琥珀反色（瞬时） */
.gallery {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 10px;
  margin-left: auto;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  text-decoration: none;
  border: var(--border-w) solid transparent;
}

.gallery-cmd {
  color: var(--c-muted);
}

.gallery:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  border-color: var(--c-accent-2);
}

.gallery:hover .gallery-cmd {
  color: var(--c-on-accent);
}

.gallery:active {
  transform: var(--press-transform);
}

.gallery:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 2px;
}

/* 窄屏：会话标识允许换行，入口保持可点 */
@media (max-width: 479px) {
  .session {
    flex: 1 1 100%;
  }

  .gallery {
    margin-left: 0;
  }
}
</style>

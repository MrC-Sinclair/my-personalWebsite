<!--
  SciFiHudTopBar - sci-fi-hud 风格顶部主控条
  ------------------------------------------------------------
  驾驶舱主控条（sticky 吸顶）：左侧站点标识块 + 状态灯装饰，
  中部页内锚点通道（移动端横向滚动），右侧「风格画廊」入口
  （localePath 包裹，不写死路径）。下缘刻度尺装饰。
  触控目标均 ≥ 40px，reduced-motion 下状态灯停止闪烁。
-->
<template>
  <header class="topbar">
    <div class="topbar-inner">
      <!-- 站点标识 + 系统状态灯（灯为装饰） -->
      <div class="ident">
        <span class="ident-gem" aria-hidden="true"/>
        <span class="ident-name">{{ name }}</span>
        <span class="ident-dot" aria-hidden="true"/>
      </div>

      <!-- 页内锚点通道（原生锚点跳转） -->
      <nav class="channels" :aria-label="t('common.mobileNav')">
        <a v-for="section in sections" :key="section.id" class="channel" :href="`#${section.id}`">
          <span class="channel-tick" aria-hidden="true"/>
          {{ section.label }}
        </a>
      </nav>

      <!-- 风格画廊入口 -->
      <NuxtLink class="gallery" :to="localePath('/styles')">
        {{ t('styles.gallery.title') }}<span class="gallery-glyph" aria-hidden="true">↗</span>
      </NuxtLink>
    </div>

    <!-- 下缘刻度尺（纯装饰） -->
    <div class="topbar-ruler" aria-hidden="true"/>
  </header>
</template>

<script setup lang="ts">
/** 页内锚点通道定义：id 对应首页区块，label 随语言更新 */
interface ChannelSection {
  id: string
  label: string
}

defineProps<{
  /** 站点名称（来自 useAppInfo().siteConfig.name） */
  name: string
  /** 页内锚点列表（label 走 i18n，由页面传入） */
  sections: ChannelSection[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* —— 主控条：吸顶 + 座舱底色 —— */
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: color-mix(in srgb, var(--c-bg) 88%, transparent);
  border-bottom: var(--border-w) solid var(--c-border);
  backdrop-filter: blur(8px);
}

.topbar-inner {
  display: flex;
  align-items: center;
  gap: var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 8px var(--gap);
}

/* —— 站点标识 —— */
.ident {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  min-height: 40px;
}

/* 标识徽标：菱形信号块 */
.ident-gem {
  width: 12px;
  height: 12px;
  background: var(--c-accent);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  box-shadow: var(--shadow-press);
}

.ident-name {
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-text);
  white-space: nowrap;
}

/* 状态灯：呼吸闪烁（装饰） */
.ident-dot {
  width: 7px;
  height: 7px;
  background: var(--c-accent);
  border-radius: 50%;
  box-shadow: 0 0 6px rgb(74 240 198 / 0.9);
  animation: ident-pulse 2.2s ease-in-out infinite;
}

@keyframes ident-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.25;
  }
}

/* —— 锚点通道：窄屏横向滚动 —— */
.channels {
  display: flex;
  flex: 1 1 auto;
  gap: 2px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.channels::-webkit-scrollbar {
  display: none;
}

.channel {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  transition:
    color var(--transition),
    background var(--transition);
}

/* 通道前指示刻度：hover / active 点亮 */
.channel-tick {
  width: 3px;
  height: 12px;
  background: var(--c-border);
  transition: background var(--transition);
}

.channel:hover {
  color: var(--c-text);
  background: color-mix(in srgb, var(--c-accent) 8%, transparent);
}

.channel:hover .channel-tick,
.channel:focus-visible .channel-tick {
  background: var(--c-accent);
}

.channel:active {
  transform: var(--press-transform);
}

/* —— 画廊入口 —— */
.gallery {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent) 45%, transparent);
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.gallery:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.gallery:active {
  transform: var(--press-transform);
}

.gallery-glyph {
  font-family: var(--font-mono);
}

/* 下缘刻度尺：细密刻度整幅排布（装饰） */
.topbar-ruler {
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    color-mix(in srgb, var(--c-accent) 40%, transparent) 0 1px,
    transparent 1px 12px
  );
}

@media (max-width: 640px) {
  .ident-name {
    max-width: 30vw;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ident-dot {
    animation: none;
  }

  .channel,
  .gallery {
    transition: none;
  }

  .channel:active,
  .gallery:active {
    transform: none;
  }
}
</style>

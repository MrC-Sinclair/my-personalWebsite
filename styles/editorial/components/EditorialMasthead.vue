<!--
  EditorialMasthead - editorial 风格的刊头导航
  ------------------------------------------------------------
  杂志「刊头」吸顶导航：左侧站点标识（№ 记号 + 衬线站名，
  点击回封面），中部页内锚点（01–04 编号 + 无衬线小字，
  原生 <a href="#...">，全局已有平滑滚动与锚点偏移补偿），
  右侧动作组是「风格画廊」入口（localePath 包裹）+ 一条语言切换
  页边注（行为走共享层 useLocaleSwitch）。底部压印刷双规
  线；窄屏锚点行折行横滑（两端渐隐提示可滑）。
-->
<template>
  <header class="mast safe-top">
    <div class="inner">
      <a class="brand" href="#home">
        <span class="brand-mark" aria-hidden="true">№</span>
        <span class="brand-name">{{ t('home.name') }}</span>
      </a>

      <nav class="anchors-scroll" :aria-label="t('common.mobileNav')">
        <ul class="anchors">
          <li v-for="item in anchorItems" :key="item.href">
            <a class="anchor" :href="item.href">
              <span class="anchor-no" aria-hidden="true">{{ item.no }}</span>
              <span class="anchor-label">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="actions">
        <!-- 语言切换：页边注式安静文字链，比画廊的铅字框低一级 -->
        <NuxtLink class="lang" :to="targetPath" :aria-label="t('common.language')">
          {{ targetLabel }}
        </NuxtLink>

        <NuxtLink class="gallery" :to="localePath('/styles')">
          {{ t('styles.gallery.enter') }}
        </NuxtLink>
      </div>
    </div>
    <div class="rule" aria-hidden="true"/>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
// 切换行为走共享层，外观由本风格决定
const { targetPath, targetLabel } = useLocaleSwitch()

/** 页内锚点（编号 + i18n 文案，原生锚点跳转） */
const anchorItems = computed(() => [
  { no: '01', href: '#about', label: t('nav.about') },
  { no: '02', href: '#projects', label: t('nav.projects') },
  { no: '03', href: '#posts', label: t('nav.blog') },
  { no: '04', href: '#contact', label: t('nav.contact') },
])
</script>

<style scoped>
.mast {
  --ink-strong: color-mix(in srgb, var(--c-text) 82%, transparent);
  --ink-soft: color-mix(in srgb, var(--c-text) 32%, transparent);

  position: sticky;
  top: 0;
  z-index: 30;
  background: color-mix(in srgb, var(--c-bg) 90%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px var(--gap);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 12px var(--space);
}

/* 站点标识：№ 记号 + 衬线站名 */
.brand {
  display: inline-flex;
  flex: none;
  align-items: baseline;
  gap: 8px;
  min-height: 40px;
  color: var(--c-text);
  text-decoration: none;
  transition: color var(--transition);
}

.brand:hover {
  color: var(--c-accent);
}

.brand:active {
  transform: var(--press-transform);
}

.brand-mark {
  font-family: var(--font-head);
  font-size: 18px;
  font-style: italic;
  line-height: 1;
  color: var(--c-accent);
}

.brand-name {
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* 锚点行：窄屏横向滚动 + 两端渐隐提示 */
.anchors-scroll {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  mask-image: linear-gradient(90deg, transparent, #000 10px, #000 calc(100% - 10px), transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10px, #000 calc(100% - 10px), transparent);
}

.anchors-scroll::-webkit-scrollbar {
  display: none;
}

.anchors {
  display: flex;
  justify-content: flex-end;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 锚点：编号（红）+ 小字标签，悬停时下划线从左划入 */
.anchor {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 12px;
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-muted);
  text-decoration: none;
  white-space: nowrap;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 13px 100%;
  background-size: 0% 1px;
  transition:
    color var(--transition),
    background-size var(--transition);
}

.anchor-no {
  font-family: var(--font-mono);
  color: var(--c-accent);
  letter-spacing: 0.14em;
}

.anchor:hover {
  color: var(--c-text);
  background-size: calc(100% - 26px) 1px;
}

.anchor:active {
  transform: var(--press-transform);
}

/* 右侧动作组：语言切换 + 画廊入口（贴右成组，窄屏整组换行） */
.actions {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  margin-left: auto;
  flex-wrap: wrap;
}

/* 语言切换：页边注——发丝竖线 + 斜体衬线小字，比铅字框低一级 */
.lang {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  min-width: 40px;
  padding: 8px 12px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-style: italic;
  letter-spacing: 0.08em;
  color: var(--c-muted);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 1px;
  text-underline-offset: 5px;
  white-space: nowrap;
  border-left: var(--border-w) solid var(--ink-strong);
  transition:
    color var(--transition),
    text-decoration-color var(--transition);
}

.lang:hover {
  color: var(--c-accent);
  text-decoration-color: var(--c-accent);
}

.lang:active {
  transform: var(--press-transform);
}

/* 画廊入口：印刷「铅字按钮」——直角描边框 */
.gallery {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 40px;
  padding: 8px 16px;
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  color: var(--c-text);
  text-decoration: none;
  white-space: nowrap;
  border: var(--border-w) solid var(--ink-strong);
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

/* 键盘可达：文字链需要可见焦点环 */
.lang:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* 底部印刷双规线（与区块刊头同构） */
.rule {
  border-top: 2px solid var(--ink-strong);
}

.rule::after {
  display: block;
  height: 1px;
  margin-top: 3px;
  content: '';
  background: var(--ink-soft);
}

/* 窄屏：锚点行折到第三行横滑，动作组（语言切换 + 画廊）贴右成行 */
@media (max-width: 820px) {
  .inner {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .anchors {
    justify-content: flex-start;
  }

  .anchors-scroll {
    flex-basis: 100%;
    order: 3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .brand,
  .anchor,
  .lang,
  .gallery {
    transition: none;
  }

  .brand:active,
  .anchor:active,
  .lang:active,
  .gallery:active {
    transform: none;
  }
}
</style>

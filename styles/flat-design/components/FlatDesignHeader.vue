<!--
  FlatDesignHeader - 扁平化风格顶部导航条
  ------------------------------------------------------------
  纯色深蓝灰导航条（sticky）：几何方形站点标识 + 页内锚点导航 +
  风格画廊扁平按钮，动作组里另有一条语言切换扁平色块（行为走共享层
  useLocaleSwitch）。本风格是单页纵向色带结构，窄屏收起锚点导航
  （区块随页面自然滚动到达）；交互反馈只有颜色变化（扁平签名）。
-->
<template>
  <header class="hdr">
    <div class="hdr__inner">
      <!-- 站点标识：黄色几何方块 + 站名，点击回页首（原生锚点） -->
      <a href="#top" class="hdr__brand">
        <span class="hdr__mark" aria-hidden="true"/>
        <span class="hdr__name">{{ t('home.name') }}</span>
      </a>

      <!-- 页内锚点导航：原生锚点跳转，标签走 i18n -->
      <nav class="hdr__nav">
        <a v-for="item in navLinks" :key="item.href" :href="item.href" class="hdr__link">
          {{ item.label }}
        </a>
      </nav>

      <!-- 右侧动作组：语言切换 + 风格画廊（窄屏整组换行，不撑出横向滚动） -->
      <div class="hdr__actions">
        <!-- 语言切换：扁平半透色块，比画廊的实心按钮低一级 -->
        <NuxtLink class="hdr__lang" :to="targetPath" :aria-label="t('common.language')">
          {{ targetLabel }}
        </NuxtLink>

        <!-- 风格画廊入口：站内路由，localePath 包裹 -->
        <NuxtLink :to="localePath('/styles')" class="hdr__gallery">
          {{ t('styles.gallery.enter') }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
// 切换行为走共享层，外观由本风格决定
const { targetPath, targetLabel } = useLocaleSwitch()

/** 页内锚点导航项 */
const navLinks = computed(() => [
  { label: t('nav.about'), href: '#about' },
  { label: t('nav.projects'), href: '#projects' },
  { label: t('nav.blog'), href: '#blog' },
  { label: t('nav.contact'), href: '#contact' },
])
</script>

<style scoped>
.hdr {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--c-text);
}

.hdr__inner {
  display: flex;
  /* 320 宽下站点标识与动作组两个块自己就接近视口宽度，
     给一条退路：放不下就换行而不是撑出横向滚动。 */
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(14px, 3vw, 28px);
  max-width: var(--page-w);
  margin-inline: auto;
  padding: 10px clamp(16px, 4vw, 40px);
}

/* 站点标识：黄色几何方块（本风格的「几何代替图标」签名） */
.hdr__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  transition: color var(--transition);
}

.hdr__mark {
  width: 14px;
  height: 14px;
  background: var(--deco);
  border-radius: var(--radius-sm);
}

.hdr__brand:hover {
  color: var(--deco);
}

/* 锚点链接：浅白文字，hover 提亮 + 淡色底（纯颜色反馈） */
.hdr__link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 10px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgb(255 255 255 / 0.75);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition),
    background var(--transition);
}

.hdr__link:hover {
  color: #ffffff;
  background: rgb(255 255 255 / 0.12);
}

/* 右侧动作组：语言切换 + 画廊入口（贴右成组） */
.hdr__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(10px, 2vw, 20px);
  min-width: 0;
  margin-left: auto;
}

/* 语言切换：无底色块的安静文字，hover 才泛起一层扁平白块 */
.hdr__lang {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 40px;
  padding: 0 10px;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.06em;
  /* 与锚点链接同族的浅白（用 token 混透明度，不写裸色值） */
  color: color-mix(in srgb, var(--c-bg) 78%, transparent);
  text-decoration: none;
  white-space: nowrap;
  background: transparent;
  border-radius: var(--radius-sm);
  transition:
    color var(--transition),
    background var(--transition);
}

.hdr__lang:hover {
  color: var(--c-on-accent);
  /* 深色条上的淡色扁平块：沿用本文件锚点 hover 的白色 12% 底色做法 */
  background: color-mix(in srgb, var(--c-on-accent) 12%, transparent);
}

/* 扁平签名：按压只换色，不做位移 */
.hdr__lang:active {
  color: var(--c-on-accent);
  background: color-mix(in srgb, var(--c-on-accent) 24%, transparent);
}

/* 画廊入口：强调蓝扁平按钮，hover 加深 */
.hdr__gallery {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 16px;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-on-accent);
  text-decoration: none;
  white-space: nowrap;
  background: var(--c-accent);
  border-radius: var(--radius);
  transition: background var(--transition);
}

.hdr__gallery:hover {
  background: #1b5a86;
}

.hdr__gallery:active {
  background: #174e74;
}

.hdr__brand:focus-visible,
.hdr__link:focus-visible,
.hdr__lang:focus-visible,
.hdr__gallery:focus-visible {
  outline: 3px solid var(--deco);
  outline-offset: 2px;
}

/* 移动端：收起锚点导航（区块随滚动到达），动作组顶到右侧 */
@media (max-width: 768px) {
  .hdr__nav {
    display: none;
  }
}
</style>

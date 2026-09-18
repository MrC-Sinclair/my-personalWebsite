<!--
  EditorialCover - editorial 风格的杂志封面（首页英雄区）
  ------------------------------------------------------------
  整屏「创刊号封面」版面：顶部 kicker（问候语拉宽字距 +
  右侧 № 期号装饰）→ 巨大衬线刊名（t('home.name')，末尾缀
  刊头红句点）→ 非对称双栏（左：衬线斜体封面语 tagline /
  右：hairline 分隔的提要 description）→ 底部「本期目录」
  条（01–04 编号锚点，原生 <a href="#..."> 平滑滚动）。
  封面撑满首屏（min-height clamp），窄屏回退单栏但保留
  巨大标题与编号装饰。
-->
<template>
  <section id="home" class="cover" data-section="cover">
    <div class="inner">
      <header class="top">
        <p class="kicker">{{ t('home.greeting') }}</p>
        <span class="folio" aria-hidden="true">№ 01</span>
      </header>

      <h1 class="name">{{ t('home.name') }}<span class="dot" aria-hidden="true">.</span></h1>

      <div class="spread">
        <p class="tagline">{{ t('home.tagline') }}</p>
        <p class="desc">{{ t('home.description') }}</p>
      </div>

      <nav class="toc" :aria-label="t('blog.toc')">
        <p class="toc-caption">{{ t('blog.toc') }}</p>
        <ul class="toc-list">
          <li v-for="item in tocItems" :key="item.href">
            <a class="toc-item" :href="item.href">
              <span class="toc-no" aria-hidden="true">{{ item.no }}</span>
              <span class="toc-label">{{ item.label }}</span>
              <span class="toc-arrow" aria-hidden="true">→</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

/** 本期目录条目（编号 + i18n 文案，原生锚点跳转） */
const tocItems = computed(() => [
  { no: '01', href: '#about', label: t('nav.about') },
  { no: '02', href: '#projects', label: t('nav.projects') },
  { no: '03', href: '#posts', label: t('nav.blog') },
  { no: '04', href: '#contact', label: t('nav.contact') },
])
</script>

<style scoped>
.cover {
  --ink-soft: color-mix(in srgb, var(--c-text) 32%, transparent);

  display: flex;
  min-height: clamp(560px, 92vh, 940px);
}

.inner {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(22px, 4vw, 44px) var(--space) clamp(26px, 4vw, 48px);
}

/* 顶部：kicker + 期号装饰 */
.top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--gap);
}

/* kicker：问候语拉宽字距，像杂志封面上的题签 */
.kicker {
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.42em;
  color: var(--c-accent);
}

.folio {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-muted);
}

/* 刊名：巨大衬线字，末尾缀刊头红句点 */
.name {
  margin: clamp(14px, 3vw, 34px) 0 clamp(18px, 3.4vw, 40px);
  font-family: var(--font-head);
  font-size: clamp(48px, 11.5vw, 164px);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -0.015em;
  color: var(--c-text);
  overflow-wrap: break-word;
}

.dot {
  color: var(--c-accent);
}

/* 非对称双栏：左封面语 / 右提要（hairline 分隔） */
.spread {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
  gap: var(--space);
  align-items: end;
}

.tagline {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(22px, 3vw, 34px);
  font-style: italic;
  line-height: 1.4;
  color: var(--c-text);
  /* 均衡各行长度，避免折行后末行只挂一个字（如「…开发者」的「者」独占一行）。
     短句用 balance 效果最好；不支持的浏览器降级为普通换行，无副作用 */
  text-wrap: balance;
}

.desc {
  margin: 0;
  padding-left: var(--space);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-muted);
  border-left: var(--border-w) solid var(--ink-soft);
}

/* 本期目录：hairline 顶线 + 编号条目 */
.toc {
  margin-top: clamp(30px, 6vh, 64px);
  border-top: var(--border-w) solid var(--ink-soft);
}

.toc-caption {
  margin: 10px 0 4px;
  font-size: var(--fs-small);
  letter-spacing: 0.32em;
  color: var(--c-accent);
}

.toc-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-height: 48px;
  padding: 12px 10px 12px 0;
  color: var(--c-text);
  text-decoration: none;
  background: transparent;
  transition: background var(--transition);
}

/* 荧光笔淡染：悬停时整条泛起刊头红淡染 */
.toc-item:hover {
  background: var(--deco);
}

.toc-item:active {
  transform: var(--press-transform);
}

.toc-no {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--c-muted);
  transition: color var(--transition);
}

.toc-item:hover .toc-no {
  color: var(--c-accent);
}

.toc-label {
  font-family: var(--font-head);
  font-size: clamp(19px, 2.2vw, 25px);
  font-weight: 700;
  line-height: 1.25;
}

.toc-arrow {
  align-self: flex-end;
  font-family: var(--font-mono);
  color: var(--c-accent);
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.toc-item:hover .toc-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 窄屏：双栏回退单栏，封面语与提要上下排布 */
@media (max-width: 760px) {
  .spread {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .desc {
    padding-left: 14px;
  }
}

@media (max-width: 480px) {
  .toc-list {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .toc-item,
  .toc-no,
  .toc-arrow {
    transition: none;
  }

  .toc-item:active,
  .toc-item:hover .toc-arrow {
    transform: none;
  }
}
</style>

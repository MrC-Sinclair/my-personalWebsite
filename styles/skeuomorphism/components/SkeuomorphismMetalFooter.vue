<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismMetalFooter - 拟物风格页脚
  ------------------------------------------------------------
  「铁质铭牌」页脚：深铁拉丝渐变 + 两侧黄铜铆钉 + 蚀刻文字
  （版权/作者 + 构建说明）+ 黄铜「回到顶部」按钮（回 #top
  锚点）。文案全部走 i18n。
-->
<template>
  <footer class="ft">
    <div class="ft-inner">
      <span class="ft-rivet" aria-hidden="true" />

      <p class="ft-copy">© {{ t('footer.author') }} · {{ t('footer.copyright') }}</p>
      <p class="ft-built">{{ t('footer.builtWith') }}</p>

      <a class="ft-top" href="#top">
        {{ t('common.backToTop') }}
        <span class="ft-top-arrow" aria-hidden="true">↑</span>
      </a>

      <span class="ft-rivet" aria-hidden="true" />
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的页脚组件
 * @description 铁质铭牌：蚀刻版权 + 构建说明 + 黄铜回顶按钮。
 */
const { t } = useI18n()
</script>

<style scoped>
.ft {
  margin-top: calc(var(--space) * 2);
}

.ft-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: min(100% - 2 * var(--space), var(--page-w));
  min-height: 76px;
  margin-inline: auto;
  padding: var(--gap) 22px;
  border: 1px solid rgb(0 0 0 / 0.65);
  border-radius: var(--radius);
  /* 深铁拉丝：细拉丝线 + 冷灰金属渐变 */
  background:
    repeating-linear-gradient(105deg, rgb(255 255 255 / 0.04) 0 1px, transparent 1px 3px),
    linear-gradient(180deg, #56503f 0%, #463f31 48%, #373126 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 244 210 / 0.22),
    inset 0 -2px 6px rgb(0 0 0 / 0.5),
    var(--shadow);
}

/* 两侧黄铜铆钉 */
.ft-rivet {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f0dca6 0%, #c39a4c 52%, #6e4c1a 100%);
  box-shadow:
    inset 0 -1px 2px rgb(0 0 0 / 0.55),
    0 1px 1px rgb(255 244 210 / 0.4);
}

/* —— 蚀刻文字 —— */
.ft-copy {
  display: inline-flex;
  align-items: center;
  margin: 0;
  font-size: var(--fs-small);
  color: #e6d5b4;
}

.ft-built {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: rgb(230 213 180 / 0.85);
}

/* —— 黄铜回顶按钮 —— */
.ft-top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 18px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-on-accent);
  text-decoration: none;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #e0bc72 0%, #b8893a 55%, #91632a 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    inset 0 -2px 4px rgb(0 0 0 / 0.35),
    0 3px 6px rgb(10 4 0 / 0.55);
  transition:
    filter var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.ft-top:hover {
  filter: brightness(1.1);
}

/* 按压行程：按进铁牌 */
.ft-top:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.ft-top-arrow {
  font-family: var(--font-mono);
  font-size: 12px;
}

/* —— 窄屏：铭牌文字纵向排列 —— */
@media (max-width: 640px) {
  .ft-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .ft-top {
    width: 100%;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ft-top {
    transition: none;
  }

  .ft-top:active {
    transform: none;
  }
}
</style>

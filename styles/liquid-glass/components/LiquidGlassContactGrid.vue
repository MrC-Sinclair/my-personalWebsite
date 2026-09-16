<!--
  LiquidGlassContactGrid - liquid-glass 风格的社交联系展台
  ------------------------------------------------------------
  社交信息以玻璃展台呈现：GitHub 为外链玻璃卡（整卡跳转），
  其余平台展示二维码（img）+ 平台名；有号码的平台（微信）
  以等宽字展示号码文本（可长按/选中复制）。
  注意：仅做信息展示，不复用过渡层 ContactForm，也不实现
  剪贴板写入（共享层暂无复制工具，避免在风格里重复实现
  业务逻辑；缺口已反馈）。
-->
<template>
  <div class="grid">
    <component
      :is="item.url ? 'a' : 'div'"
      v-for="item in socials"
      :key="item.name"
      class="cell"
      :href="item.url || undefined"
      :target="item.url ? '_blank' : undefined"
      :rel="item.url ? 'noopener noreferrer' : undefined"
    >
      <span class="cell-glow" aria-hidden="true"/>
      <header class="cell-head">
        <span class="dot" aria-hidden="true"/>
        <h3 class="cell-name">{{ item.name }}</h3>
      </header>

      <img
        v-if="item.qrCode"
        class="qr"
        :src="item.qrCode"
        :alt="item.name"
        loading="lazy"
        width="96"
        height="96"
      >

      <p v-if="item.value" class="value">
        <span class="value-label">{{ t('contact.wechatId') }}</span>
        <span class="value-mono">{{ item.value }}</span>
      </p>

      <footer v-if="item.url" class="cell-foot">
        <span class="visit">{{ item.name }}</span>
        <span class="visit-arrow" aria-hidden="true">↗</span>
      </footer>
    </component>
  </div>
</template>

<script setup lang="ts">
import type { SocialLinkItem } from '~/types/site'

defineProps<{
  /** 社交链接列表（来自共享层 useAppInfo） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--gap);
}

/* 内嵌玻璃展台（无 backdrop-filter，避免面板内嵌套模糊） */
.cell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  overflow: hidden;
  text-decoration: none;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.07), rgb(255 255 255 / 0.02));
  border: var(--border-w) solid rgb(255 255 255 / 0.15);
  border-radius: var(--radius-sm);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.2);
  transition:
    transform var(--transition),
    border-color var(--transition),
    box-shadow var(--transition);
}

/* 链接型展台 hover：上浮 + 边缘泛光（div 型无交互，保持静态） */
a.cell:hover {
  border-color: rgb(94 227 255 / 0.45);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.28),
    0 10px 24px rgb(4 2 18 / 0.3),
    0 0 18px rgb(94 227 255 / 0.15);
  transform: translateY(-4px);
}

a.cell:active {
  transform: var(--press-transform);
}

/* 角落辉光装饰 */
.cell-glow {
  position: absolute;
  top: -46px;
  right: -46px;
  width: 96px;
  height: 96px;
  pointer-events: none;
  background: radial-gradient(closest-side, rgb(94 227 255 / 0.16), transparent);
}

.cell-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 平台指示光点 */
.dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: linear-gradient(140deg, var(--c-accent), var(--c-accent-2));
  border-radius: 50%;
  box-shadow: 0 0 8px rgb(94 227 255 / 0.6);
}

.cell-name {
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
}

.qr {
  align-self: flex-start;
  width: 96px;
  height: 96px;
  image-rendering: var(--img-rendering);
  background: rgb(255 255 255 / 0.9);
  border: var(--border-w) solid rgb(255 255 255 / 0.3);
  border-radius: var(--radius-sm);
  padding: 4px;
}

.value {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
}

.value-label {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.value-mono {
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  color: var(--c-text);
  overflow-wrap: anywhere;
  user-select: all;
}

/* 外链型展台底部提示行 */
.cell-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  min-height: 40px;
}

.visit {
  font-size: var(--fs-small);
  color: var(--c-accent);
}

.visit-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-family: var(--font-mono);
  color: var(--c-accent);
  background: rgb(94 227 255 / 0.1);
  border: var(--border-w) solid rgb(94 227 255 / 0.35);
  border-radius: 50%;
  transition: transform var(--transition);
}

a.cell:hover .visit-arrow {
  transform: translate(2px, -2px);
}

@media (prefers-reduced-motion: reduce) {
  .cell,
  .visit-arrow {
    transition: none;
  }

  a.cell:hover {
    transform: none;
  }

  a.cell:active {
    transform: none;
  }
}
</style>

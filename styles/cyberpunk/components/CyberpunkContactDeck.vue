<!--
  CyberpunkContactDeck - cyberpunk 风格联系「通讯终端」面板
  ------------------------------------------------------------
  社交信息以切角终端卡网格呈现：有二维码的平台展示二维码
  图片；有值的平台（微信）展示等宽号码并提供「复制」按钮
  （复用共享层 useClipboardCopy，客户端守卫与定时器清理由
  其内部完成）；GitHub 为外链卡。不复用过渡层的
  ContactForm 组件。hover 时卡片点亮青色辉光并上浮。
-->
<template>
  <div class="deck">
    <article v-for="(item, index) in socials" :key="item.name" class="deck-card">
      <header class="card-head">
        <span class="head-index" aria-hidden="true">{{ slotIndex(index) }}</span>
        <h3 class="card-name">{{ item.name }}</h3>
      </header>

      <!-- 二维码（有则展示） -->
      <img
        v-if="item.qrCode"
        class="card-qr"
        :src="item.qrCode"
        :alt="item.name"
        loading="lazy"
        width="96"
        height="96"
      >

      <!-- 号码值（微信） -->
      <p v-if="item.value" class="card-value">
        <span class="value-label">{{ t('contact.wechatId') }}</span>
        <span class="value-mono">{{ item.value }}</span>
      </p>

      <footer v-if="item.url || item.value" class="card-foot">
        <!-- 外链（GitHub）：整卡外跳按钮 -->
        <a
          v-if="item.url"
          class="card-action card-link"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.name }}<span class="arrow" aria-hidden="true">↗</span>
        </a>
        <!-- 复制按钮（微信号码） -->
        <button v-else-if="item.value" type="button" class="card-action card-copy" @click="copy(item.value ?? '')">
          {{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}
        </button>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import type { SocialLinkItem } from '~/types/site'

defineProps<{
  /** 社交链接列表（来自共享层 useAppInfo，含二维码与号码） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

/** 卡槽编号：SLOT.01 起（纯装饰，确定性推导） */
function slotIndex(index: number): string {
  return `SLOT.${String(index + 1).padStart(2, '0')}`
}

/** 剪贴板复制走共享层：copied 为最近成功复制的号码（2 秒后自动清空，客户端守卫与定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
.deck {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: var(--gap);
}

/* —— 切角终端卡 —— */
.deck-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--space);
  background: rgb(255 255 255 / 0.02);
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
  box-shadow: inset 0 0 0 var(--border-w) var(--c-border);
  transition:
    box-shadow var(--transition),
    transform var(--transition);
}

.deck-card:hover {
  transform: translateY(-3px);
  box-shadow:
    inset 0 0 0 var(--border-w) rgb(34 211 238 / 0.65),
    0 0 18px rgb(34 211 238 / 0.25);
}

.card-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

/* 卡槽编号：等宽小注 */
.head-index {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: rgb(34 211 238 / 0.55);
}

.card-name {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-text);
}

/* 二维码：切角框 + 扫描线纹理 */
.card-qr {
  align-self: flex-start;
  width: 96px;
  height: 96px;
  padding: 4px;
  image-rendering: var(--img-rendering);
  background: var(--deco), var(--c-bg);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  box-shadow: inset 0 0 0 var(--border-w) rgb(34 211 238 / 0.4);
}

.card-value {
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
  color: var(--c-accent);
  text-shadow: 0 0 8px rgb(34 211 238 / 0.4);
  overflow-wrap: anywhere;
}

.card-foot {
  margin-top: auto;
}

/* 外链 / 复制按钮：≥40px 触控目标 + hover 点亮 */
.card-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  transition:
    color var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    transform var(--transition);
}

.card-link {
  color: var(--c-on-accent);
  background: var(--c-accent);
  box-shadow: 0 0 12px rgb(34 211 238 / 0.4);
}

.card-link:hover {
  box-shadow: 0 0 22px rgb(34 211 238 / 0.7);
}

.card-copy {
  color: var(--c-accent-2);
  background: rgb(255 45 149 / 0.08);
  box-shadow: inset 0 0 0 var(--border-w) rgb(255 45 149 / 0.55);
}

.card-copy:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  box-shadow:
    inset 0 0 0 var(--border-w) var(--c-accent-2),
    0 0 16px rgb(255 45 149 / 0.5);
}

.card-action:active {
  transform: var(--press-transform);
}

.arrow {
  font-family: var(--font-mono);
  transition: transform var(--transition);
}

.card-link:hover .arrow {
  transform: translate(2px, -2px);
}

@media (prefers-reduced-motion: reduce) {
  .deck-card,
  .card-action,
  .arrow {
    transition: none;
  }

  .deck-card:hover,
  .card-action:active,
  .card-link:hover .arrow {
    transform: none;
  }
}
</style>

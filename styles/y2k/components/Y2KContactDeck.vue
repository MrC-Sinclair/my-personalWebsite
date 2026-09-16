<!--
  Y2KContactDeck - y2k 风格联系方式面板
  ------------------------------------------------------------
  「星际通讯台」：社交信息以铬框塑料磁贴呈现 —— 有二维码的
  平台展示二维码（铬框相框），GitHub 为外链铬按钮，微信号提供
  「复制」按钮（复用共享层 useClipboardCopy，客户端守卫、失败
  兜底与定时器清理在其内部完成）。
  不复用过渡层的 ContactForm 组件。
-->
<template>
  <div class="deck">
    <article v-for="item in socials" :key="item.name" class="tile">
      <h3 class="tile-name">
        <span class="tile-star" aria-hidden="true">✦</span>
        {{ item.name }}
      </h3>

      <img
        v-if="item.qrCode"
        class="tile-qr"
        :src="item.qrCode"
        :alt="item.name"
        loading="lazy"
        width="104"
        height="104"
      >

      <p v-if="item.value" class="tile-value">
        <span class="tile-value-label">{{ t('contact.wechatId') }}</span>
        <span class="tile-value-mono">{{ item.value }}</span>
      </p>

      <div class="tile-foot">
        <a
          v-if="item.url"
          class="tile-action"
          :href="item.url"
          target="_blank"
          rel="noopener"
        >
          {{ item.name }}<span class="tile-ext" aria-hidden="true">↗</span>
        </a>
        <button
          v-else-if="item.value"
          type="button"
          class="tile-action"
          @click="copy(item.value ?? '')"
        >
          {{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}
        </button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
/**
 * @file Y2K 风格的联系方式面板组件
 * @description 二维码磁贴 + 外链/复制铬按钮；数据来自共享层 useAppInfo()。
 */
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import type { SocialLinkItem } from '~/types/site'

defineProps<{
  /** 社交链接列表（来自 useAppInfo，含二维码与号码数据） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

/** 剪贴板复制走共享层：copied 为最近成功复制的号码（2 秒后自动清空，客户端守卫与定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
.deck {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
  gap: var(--gap);
}

/* —— 通讯磁贴：铬框塑料片 —— */
.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--space);
  border: var(--border-w) solid rgb(200 210 255 / 0.42);
  border-radius: var(--radius-sm);
  background: linear-gradient(
    170deg,
    rgb(255 255 255 / 0.16) 0%,
    rgb(255 255 255 / 0.05) 44%,
    rgb(139 123 255 / 0.12) 100%
  );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.55),
    0 8px 22px rgb(5 0 42 / 0.45);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    border-color var(--transition);
}

/* hover：磁贴点亮 */
.tile:hover {
  transform: translateY(-4px);
  border-color: rgb(255 255 255 / 0.7);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.75),
    0 16px 34px rgb(5 0 42 / 0.55),
    0 0 20px rgb(255 92 225 / 0.3);
}

.tile-name {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
}

.tile-star {
  color: var(--c-accent-2);
}

/* —— 二维码：铬框相框 —— */
.tile-qr {
  align-self: flex-start;
  width: 104px;
  height: 104px;
  image-rendering: var(--img-rendering);
  border: var(--border-w) solid rgb(255 255 255 / 0.55);
  border-radius: var(--radius-sm);
  box-shadow:
    inset 0 0 0 3px rgb(23 16 72 / 0.6),
    0 0 14px rgb(139 123 255 / 0.35);
}

.tile-value {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
}

.tile-value-label {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.tile-value-mono {
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  letter-spacing: 0.06em;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

/* —— 动作按钮：铬胶囊（≥40px 触控目标） —— */
.tile-foot {
  margin-top: auto;
}

.tile-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--c-on-accent);
  text-decoration: none;
  cursor: pointer;
  border: var(--border-w) solid rgb(255 255 255 / 0.65);
  border-radius: 999px;
  background: linear-gradient(180deg, #f8faff 0%, #ccd6f6 38%, #8e9ad0 56%, #aeb9e8 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 8px 18px rgb(110 90 255 / 0.35);
  transition:
    filter var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.tile-action:hover {
  filter: brightness(1.1);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.9),
    0 12px 26px rgb(139 92 255 / 0.5);
}

.tile-action:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.tile-ext {
  font-family: var(--font-mono);
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .tile-action {
    transition: none;
  }

  .tile:hover {
    transform: none;
  }

  .tile-action:active {
    transform: none;
  }
}
</style>

<!--
  Soft3DContactPod - soft-3d 风格联系方式舱
  ------------------------------------------------------------
  一格「联系方式展示体」：平台小球（球面为平台名首字符，
  数据派生）+ 平台名 + 二维码（白底相框式展示）或号码值，
  有外链的平台（GitHub）提供胶囊外链按钮。
  纯展示型：不做复制等交互（剪贴板属共享层行为，避免在
  风格里重复实现），hover 仅舱体上浮。
-->
<template>
  <article class="contact-pod">
    <header class="contact-pod-head">
      <Soft3DOrb :size="42" :variant="variant" float :duration="6.5" :delay="0.5" />
      <h3 class="contact-pod-name">{{ item.name }}</h3>
    </header>

    <!-- 二维码：白底相框，像贴在舱体上的卡片 -->
    <img
      v-if="item.qrCode"
      class="contact-pod-qr"
      :src="item.qrCode"
      :alt="item.name"
      loading="lazy"
      width="104"
      height="104"
    >

    <p v-if="item.value" class="contact-pod-value">
      <span class="contact-pod-value-label">{{ t('contact.wechatId') }}</span>
      <span class="contact-pod-value-text">{{ item.value }}</span>
    </p>

    <footer v-if="item.url" class="contact-pod-foot">
      <a class="contact-pod-link" :href="item.url" target="_blank" rel="noopener">
        {{ item.name }}<span class="contact-pod-link-arrow" aria-hidden="true">↗</span>
      </a>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { SocialLinkItem } from '~/types/site'
import Soft3DOrb from './Soft3DOrb.vue'

withDefaults(
  defineProps<{
    /** 社交条目（来自 useAppInfo 的 socialLinks） */
    item: SocialLinkItem
    /** 平台小球配色 */
    variant?: 'violet' | 'cyan' | 'pink' | 'mint' | 'sun'
  }>(),
  {
    variant: 'violet',
  },
)

const { t } = useI18n()
</script>

<style scoped>
.contact-pod {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  padding: var(--space);
  background: linear-gradient(158deg, color-mix(in srgb, var(--c-accent) 10%, var(--c-surface)), var(--c-surface) 56%);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition);
}

.contact-pod:hover {
  transform: translateY(-6px);
  box-shadow:
    0 34px 60px rgb(6 3 26 / 0.66),
    0 14px 28px rgb(139 92 246 / 0.3),
    0 4px 9px rgb(6 3 26 / 0.5),
    inset 0 2px 5px rgb(255 255 255 / 0.24),
    inset 0 -8px 16px rgb(9 5 40 / 0.5);
}

.contact-pod-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-pod-name {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--c-text);
}

/* —— 二维码：白底圆角相框 —— */
.contact-pod-qr {
  align-self: flex-start;
  width: 104px;
  height: 104px;
  padding: 6px;
  background: #ffffff;
  border-radius: var(--radius-sm);
  box-shadow:
    inset 0 1px 2px rgb(9 5 40 / 0.12),
    0 8px 16px rgb(6 3 26 / 0.4);
}

/* —— 号码展示 —— */
.contact-pod-value {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
}

.contact-pod-value-label {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.contact-pod-value-text {
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  letter-spacing: 0.04em;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

/* —— 外链胶囊：≥40px 触控目标 —— */
.contact-pod-foot {
  margin-top: auto;
}

.contact-pod-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 40px;
  padding: 8px 16px;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-accent-2);
  text-decoration: none;
  background: color-mix(in srgb, var(--c-accent-2) 13%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-accent-2) 40%, transparent);
  border-radius: 999px;
  transition: color var(--transition), background var(--transition), transform var(--transition),
    box-shadow var(--transition);
}

.contact-pod-link:hover {
  color: #083344;
  background: linear-gradient(135deg, #67e8f9, #22d3ee);
  border-color: rgb(255 255 255 / 0.3);
  transform: translateY(-2px);
  box-shadow:
    0 10px 20px rgb(34 211 238 / 0.35),
    inset 0 1px 3px rgb(255 255 255 / 0.4);
}

.contact-pod-link:active {
  transform: var(--press-transform);
}

.contact-pod-link-arrow {
  transition: transform var(--transition);
}

/* 键盘可见焦点环 */
.contact-pod-link:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 3px;
}

.contact-pod-link:hover .contact-pod-link-arrow {
  transform: translate(2px, -2px);
}

@media (prefers-reduced-motion: reduce) {
  .contact-pod {
    transition: none;
  }

  .contact-pod:hover {
    transform: none;
  }

  .contact-pod-link,
  .contact-pod-link-arrow {
    transition: none;
  }

  .contact-pod-link:hover {
    transform: none;
  }

  .contact-pod-link:active {
    transform: none;
  }
}
</style>

<!--
  SwissContact - swiss 风格联系方式
  ------------------------------------------------------------
  社交信息以「编号条目 + 细则线」呈现：平台名（大号加粗）
  + 二维码（内容图片）+ 号码 / 外链。GitHub 为外链条目；
  微信等有号码的条目提供「复制」按钮（复制动作复用共享层
  useClipboardCopy：客户端守卫、失败静默兜底与反馈定时器
  清理均在 composable 内完成）。不复用过渡层的 ContactForm 组件。
  数据来自共享层 useAppInfo 的 socialLinks（页面传入）。
-->
<template>
  <div>
    <p class="contact-lead">{{ t('contact.description') }}</p>

    <ul class="contact-list">
      <li v-for="(item, i) in socials" :key="item.name" class="contact-row">
        <div class="contact-info">
          <p class="contact-head">
            <span class="row-no" aria-hidden="true">{{ pad(i + 1) }}</span>
            <span class="contact-name">{{ item.name }}</span>
          </p>

          <p v-if="item.value" class="contact-value">
            <span class="value-label">{{ t('contact.wechatId') }}</span>
            <span class="value-text">{{ item.value }}</span>
          </p>

          <div v-if="item.url || item.value" class="contact-actions">
            <a
              v-if="item.url"
              class="contact-link"
              :href="item.url"
              target="_blank"
              rel="noopener"
            >
              {{ item.name }}
              <span class="link-arrow" aria-hidden="true">↗</span>
            </a>
            <button
              v-else-if="item.value"
              type="button"
              class="contact-copy"
              @click="copy(item.value)"
            >
              {{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}
            </button>
          </div>
        </div>

        <img
          v-if="item.qrCode"
          class="contact-qr"
          :src="item.qrCode"
          :alt="item.name"
          loading="lazy"
          width="96"
          height="96"
        >
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { SocialLinkItem } from '~/types/site'
import { useClipboardCopy } from '~/composables/useClipboardCopy'

defineProps<{
  /** 社交链接列表（来自 useAppInfo，名称随语言更新） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

/** 编号补零：1 → "01"（条目编号水印） */
function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// —— 复制动作收敛到共享层 useClipboardCopy ——
// copied 为最近一次成功复制的文本（2 秒自动清空），模板用
// copied === item.value 判断哪个条目处于「已复制」反馈态；
// 客户端守卫、失败静默兜底与定时器清理均在 composable 内完成。
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
.contact-lead {
  margin: 0 0 var(--space);
  max-width: 46ch;
  font-size: clamp(19px, 2.2vw, 26px);
  font-weight: 500;
  line-height: 1.5;
  color: var(--c-text);
}

.contact-list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: var(--border-w) solid var(--c-border);
}

/* 条目：细则线行，左信息右二维码 */
.contact-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--gap);
  padding: var(--space) 0;
  border-top: var(--border-w) solid var(--c-border);
}

.contact-info {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.contact-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0;
}

.row-no {
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-accent);
  font-variant-numeric: tabular-nums;
}

/* 平台名：大号、大写、紧凑字距 */
.contact-name {
  font-size: clamp(20px, 2.4vw, 30px);
  font-weight: 700;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.contact-value {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  margin: 0;
}

.value-label {
  font-size: var(--fs-small);
  color: var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.value-text {
  font-size: 15px;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

/* 外链 / 复制按钮：强调色下划线反馈，触控目标 ≥ 40px */
.contact-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 32px;
}

.contact-link,
.contact-copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 4px 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: transparent;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  border: none;
  cursor: pointer;
  transition: background-size var(--transition);
}

.contact-link:hover,
.contact-link:focus-visible,
.contact-copy:hover,
.contact-copy:focus-visible {
  background-size: 100% 2px;
}

.contact-link:active,
.contact-copy:active {
  color: var(--c-accent);
}

.link-arrow {
  color: var(--c-accent);
  transition: transform var(--transition);
}

.contact-link:hover .link-arrow {
  transform: translate(2px, -2px);
}

/* 二维码：内容图片，黑色细框（直角） */
.contact-qr {
  flex: none;
  width: 96px;
  height: 96px;
  image-rendering: var(--img-rendering);
  border: var(--border-w) solid var(--c-border);
}

@media (max-width: 480px) {
  .contact-row {
    flex-direction: column;
  }

  /* 窄屏二维码排到信息之后，仍保持左对齐的版面秩序 */
  .contact-qr {
    order: 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contact-link,
  .contact-copy,
  .link-arrow {
    transition: none;
  }
}
</style>

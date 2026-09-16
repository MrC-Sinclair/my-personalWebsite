<!--
  DashboardContactGrid - dashboard 风格联系方式卡片
  ------------------------------------------------------------
  社交信息以密集卡片网格呈现：有二维码的平台展示二维码图片，
  有值的平台展示等宽字号码并提供「复制」按钮（复制动作复用
  共享层 useClipboardCopy：客户端守卫、失败静默兜底与定时器
  清理均在 composable 内完成）。
  GitHub 为外链卡片。不复用过渡层的 ContactForm 组件。
-->
<template>
  <div class="contact-grid">
    <article v-for="item in socials" :key="item.name" class="contact-card">
      <header class="contact-head">
        <span class="contact-chip" aria-hidden="true"/>
        <h3 class="contact-name">{{ item.name }}</h3>
      </header>

      <img
        v-if="item.qrCode"
        class="contact-qr"
        :src="item.qrCode"
        :alt="item.name"
        loading="lazy"
        width="88"
        height="88"
      >

      <p v-if="item.value" class="contact-value">
        <span class="contact-value-label">{{ t('contact.wechatId') }}</span>
        <span class="contact-value-mono">{{ item.value }}</span>
      </p>

      <footer v-if="item.url || item.value" class="contact-foot">
        <a
          v-if="item.url"
          class="contact-link"
          :href="item.url"
          target="_blank"
          rel="noopener"
        >
          {{ item.name }}<span class="contact-arrow" aria-hidden="true">↗</span>
        </a>
        <button v-else-if="item.value" type="button" class="contact-copy" @click="copy(item.value)">
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
  /** 社交链接列表（来自 useAppInfo，含二维码与号码数据） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

// —— 复制动作收敛到共享层 useClipboardCopy ——
// copied 为最近一次成功复制的文本（2 秒自动清空），模板用
// copied === item.value 判断哪个条目处于「已复制」反馈态；
// 客户端守卫、失败静默兜底与定时器清理均在 composable 内完成。
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--gap);
}

.contact-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: var(--space);
  background: var(--c-bg);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  transition:
    transform var(--transition),
    border-color var(--transition);
}

/* 交互反馈：hover 边框点亮 + 微上浮 */
.contact-card:hover {
  transform: translateY(-2px);
  border-color: var(--c-accent);
}

.contact-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 平台指示色块（装饰） */
.contact-chip {
  flex: none;
  width: 8px;
  height: 8px;
  background: var(--c-accent-2);
  border-radius: 2px;
}

.contact-name {
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
}

.contact-qr {
  align-self: flex-start;
  width: 88px;
  height: 88px;
  image-rendering: var(--img-rendering);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
}

.contact-value {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
}

.contact-value-label {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.contact-value-mono {
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  font-variant-numeric: tabular-nums;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.contact-foot {
  margin-top: auto;
}

/* 外链 / 复制按钮：≥40px 触控目标 + hover 点亮 */
.contact-link,
.contact-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  transition:
    color var(--transition),
    border-color var(--transition),
    background var(--transition);
}

.contact-link {
  color: var(--c-accent);
}

.contact-copy {
  color: var(--c-muted);
}

.contact-link:hover,
.contact-copy:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.contact-link:active,
.contact-copy:active {
  transform: var(--press-transform);
}

.contact-arrow {
  font-family: var(--font-mono);
}

@media (prefers-reduced-motion: reduce) {
  .contact-card,
  .contact-link,
  .contact-copy {
    transition: none;
  }

  .contact-link:active,
  .contact-copy:active {
    transform: none;
  }
}
</style>

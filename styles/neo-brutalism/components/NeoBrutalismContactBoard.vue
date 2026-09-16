<!--
  NeoBrutalismContactBoard - neo-brutalism 风格联系看板
  ------------------------------------------------------------
  全宽黑幕收尾段：标题盖海报黄章，社交信息做成一排纸面卡片，
  卡片在黑幕上压出海报黄硬影（签名对比）。GitHub 卡为外链，
  微信卡提供号码复制（复用共享层 useClipboardCopy，客户端守卫
  与定时器清理由其内部完成），钉钉 / 飞书 / 微信展示共享层下发的二维码。
  数据来自共享层 useAppInfo 的 socialLinks（页面传入）。
  不复用过渡层的 ContactForm 组件。
-->
<template>
  <section class="board">
    <div class="board-inner">
      <NeoBrutalismSectionTitle :text="t('contact.title')" tone="accent" />
      <p class="lede">{{ t('contact.description') }}</p>
      <p class="kicker">{{ t('contact.socialLinks') }}</p>

      <div class="grid">
        <article v-for="item in socials" :key="item.name" class="cell">
          <h3 class="name">{{ item.name }}</h3>

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

          <div v-if="item.url || item.value" class="foot">
            <a
              v-if="item.url"
              class="action is-fill"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.name }}<span class="arrow" aria-hidden="true">↗</span>
            </a>
            <button v-else-if="item.value" type="button" class="action" @click="copy(item.value ?? '')">
              {{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import type { SocialLinkItem } from '~/types/site'
import NeoBrutalismSectionTitle from './NeoBrutalismSectionTitle.vue'

defineProps<{
  /** 社交链接列表（来自 useAppInfo，含二维码与号码） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

/** 剪贴板复制走共享层：copied 为最近成功复制的号码（2 秒后自动清空，定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
/* —— 全宽黑幕 —— */
.board {
  background: var(--c-text);
  color: var(--c-bg);
  border-top: calc(var(--border-w) * 2) solid var(--c-border);
}

.board-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 56px var(--space) 64px;
}

.lede {
  margin: 0;
  max-width: 52ch;
  font-size: 17px;
  font-weight: 600;
  /* 黑幕上的正文提亮（对比度 ≥ 4.5:1） */
  color: color-mix(in srgb, var(--c-bg) 82%, var(--c-text));
}

.kicker {
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--c-accent);
}

/* —— 卡片网格：黑幕上的纸面卡 + 海报黄硬影 —— */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: var(--gap);
  width: 100%;
  margin-top: 10px;
}

.cell {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  box-shadow: 8px 8px 0 var(--c-accent);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.cell:hover {
  transform: translate(-3px, -3px);
  box-shadow: 11px 11px 0 var(--c-accent);
}

.name {
  margin: 0;
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 900;
  text-transform: uppercase;
}

.qr {
  align-self: flex-start;
  width: 96px;
  height: 96px;
  image-rendering: var(--img-rendering);
  border: var(--border-w) solid var(--c-border);
}

.value {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
}

.value-label {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-muted);
}

.value-mono {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.foot {
  margin-top: auto;
}

/* —— 外链 / 复制按钮 —— */
.action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--c-text);
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  cursor: pointer;
  transition:
    color var(--transition),
    background var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.action.is-fill {
  color: var(--c-on-accent);
  background: var(--c-accent);
}

.action:hover {
  color: var(--c-bg);
  background: var(--c-accent-2);
}

.action:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.action:focus-visible,
.cell:focus-within {
  outline: var(--border-w) solid var(--c-accent-2);
  outline-offset: 3px;
}

.arrow {
  font-family: var(--font-mono);
}

/* —— 窄屏：网格自动换行，签名保留 —— */
@media (max-width: 640px) {
  .board-inner {
    padding: 40px 16px 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cell,
  .action {
    transition: none;
  }

  .cell:hover {
    transform: none;
  }

  .action:active {
    transform: none;
  }
}
</style>

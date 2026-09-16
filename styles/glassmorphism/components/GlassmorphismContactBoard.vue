<!--
  GlassmorphismContactBoard - glassmorphism 风格的联系板块
  ------------------------------------------------------------
  社交信息展示（不复用过渡层 ContactForm）：左侧为介绍、
  GitHub 外链药丸与微信号复制（复用共享层 useClipboardCopy，
  客户端守卫、失败静默降级与反馈定时器清理由其内部完成）；
  右侧为二维码玻璃片网格（钉钉/飞书/微信）。数据来自
  useAppInfo 的 socialLinks，组件内按能力拆分（有 url /
  有 value / 有 qrCode）。
-->
<template>
  <div class="contact-board">
    <!-- 左：介绍 + GitHub 外链 + 微信号复制 -->
    <div class="contact-info">
      <p class="contact-desc">{{ t('contact.description') }}</p>

      <a
        v-if="githubItem"
        class="github-pill"
        :href="githubItem.url ?? '#'"
        target="_blank"
        rel="noopener"
      >
        {{ githubItem.name }}<span class="pill-arrow" aria-hidden="true">↗</span>
      </a>

      <div v-if="wechatItem" class="wechat-row">
        <span class="wechat-label">{{ t('contact.wechatId') }}</span>
        <code class="wechat-id">{{ wechatItem.value }}</code>
        <button type="button" class="copy-btn" @click="copy(wechatItem.value ?? '')">
          {{ copied === wechatItem.value ? t('contact.copied') : t('contact.copyWechatId') }}
        </button>
      </div>

      <p class="qr-tip">{{ t('contact.qrTip') }}</p>
    </div>

    <!-- 右：二维码玻璃片网格 -->
    <ul class="qr-grid" :aria-label="t('contact.socialLinks')">
      <li v-for="item in qrItems" :key="item.name" class="qr-tile">
        <img
          v-if="item.qrCode"
          class="qr-img"
          :src="item.qrCode"
          :alt="item.name"
          loading="lazy"
          width="96"
          height="96"
        >
        <span class="qr-name">{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import type { SocialLinkItem } from '~/types/site'

const props = defineProps<{
  /** 社交链接清单（来自 useAppInfo，含外链/号码/二维码） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

// 按能力拆分：外链平台 / 可复制号码平台 / 二维码平台
const githubItem = computed(() => props.socials.find((item) => !!item.url) ?? null)
const wechatItem = computed(() => props.socials.find((item) => !!item.value) ?? null)
const qrItems = computed(() => props.socials.filter((item) => !!item.qrCode))

/** 剪贴板复制走共享层：copied 为最近成功复制的号码（2 秒后自动清空，定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
/* 双栏：窄屏上下堆叠，桌面左右分栏（尺寸悬殊：左 7 右 5） */
.contact-board {
  display: grid;
  gap: var(--space);
}

@media (min-width: 820px) {
  .contact-board {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: start;
  }
}

.contact-desc {
  max-width: 52ch;
  margin: 0 0 18px;
  color: var(--c-muted);
}

/* GitHub 外链：极光渐变胶囊（签名 Glow） */
.github-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 24px;
  font-size: var(--fs-base);
  font-weight: 700;
  text-decoration: none;
  color: var(--c-on-accent);
  background-image: linear-gradient(120deg, #6d28d9 0%, #8b5cf6 55%, #db2777 100%);
  border-radius: 999px;
  box-shadow: 0 8px 22px rgb(139 92 246 / 0.4);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.github-pill:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgb(139 92 246 / 0.55);
}

.github-pill:active {
  transform: var(--press-transform);
}

.pill-arrow {
  font-family: var(--font-mono);
}

/* 微信号行：标签 + 等宽号码 + 复制按钮 */
.wechat-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding: 12px 16px;
  background: rgb(255 255 255 / 0.4);
  border: var(--border-w) solid rgb(255 255 255 / 0.6);
  border-radius: var(--radius-sm);
}

.wechat-label {
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-muted);
}

.wechat-id {
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.copy-btn {
  min-height: 40px;
  padding: 6px 16px;
  margin-left: auto;
  font-size: var(--fs-small);
  font-weight: 700;
  cursor: pointer;
  color: var(--c-accent);
  background: rgb(255 255 255 / 0.55);
  border: var(--border-w) solid rgb(255 255 255 / 0.7);
  border-radius: 999px;
  transition:
    transform var(--transition),
    background var(--transition),
    box-shadow var(--transition),
    color var(--transition);
}

.copy-btn:hover {
  color: var(--c-on-accent);
  background-image: linear-gradient(120deg, #6d28d9 0%, #8b5cf6 100%);
  box-shadow: 0 8px 18px rgb(139 92 246 / 0.35);
}

.copy-btn:active {
  transform: var(--press-transform);
}

.qr-tip {
  margin: 14px 0 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 二维码网格：自适应玻璃片 */
.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: var(--gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 玻璃片内层：内凹白托盘，hover 提亮（不再叠 blur，控制合成层开销） */
.qr-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 12px;
  background: rgb(255 255 255 / 0.45);
  border: var(--border-w) solid rgb(255 255 255 / 0.65);
  border-radius: var(--radius-sm);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7);
  transition:
    transform var(--transition),
    background var(--transition),
    box-shadow var(--transition);
}

.qr-tile:hover {
  transform: translateY(-4px);
  background: rgb(255 255 255 / 0.65);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.8),
    0 10px 22px rgb(31 38 135 / 0.16);
}

.qr-img {
  width: 96px;
  height: 96px;
  image-rendering: var(--img-rendering);
  border-radius: calc(var(--radius-sm) / 2);
  background: #fff;
}

.qr-name {
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
}

@media (prefers-reduced-motion: reduce) {
  .github-pill,
  .copy-btn,
  .qr-tile {
    transition: none;
  }

  .github-pill:hover,
  .copy-btn:active,
  .qr-tile:hover {
    transform: none;
  }
}
</style>

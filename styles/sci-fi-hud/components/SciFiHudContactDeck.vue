<!--
  SciFiHudContactDeck - sci-fi-hud 风格通讯频道面板
  ------------------------------------------------------------
  社交信息呈现为「通讯频道」模块阵列：每频道 = 频道号读数
  （装饰 CH-xx）+ 平台名 + 二维码图样（有则展示）+ 等宽
  号码读数（微信）+ 动作按钮（GitHub 外链 / 复制微信号）。
  复制走共享层 useClipboardCopy（客户端守卫、失败兜底与
  反馈定时器清理在其内部完成）。
  不复用过渡层 ContactForm 组件。
-->
<template>
  <div class="deck">
    <article v-for="(item, index) in socials" :key="item.name" class="channel">
      <header class="channel-head">
        <span class="channel-code" aria-hidden="true">CH-{{ String(index + 1).padStart(2, '0') }}</span>
        <h3 class="channel-name">{{ item.name }}</h3>
      </header>

      <!-- 二维码图样（有则展示） -->
      <img
        v-if="item.qrCode"
        class="channel-qr"
        :src="item.qrCode"
        :alt="item.name"
        loading="lazy"
        width="96"
        height="96"
      >

      <!-- 号码读数（微信等） -->
      <p v-if="item.value" class="channel-value">
        <span class="value-label">{{ t('contact.wechatId') }}</span>
        <span class="value-mono">{{ item.value }}</span>
      </p>

      <footer v-if="item.url || item.value" class="channel-foot">
        <!-- 外链频道：原生 <a> 新开窗口 -->
        <a
          v-if="item.url"
          class="channel-action"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.name }}<span class="action-glyph" aria-hidden="true">↗</span>
        </a>
        <!-- 无链接频道：复制号码（走共享层 useClipboardCopy） -->
        <button v-else-if="item.value" type="button" class="channel-action" @click="copy(item.value)">
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
  /** 社交频道列表（来自 useAppInfo，含二维码与号码数据） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

/** 剪贴板复制走共享层 useClipboardCopy：copied 为最近成功复制的号码
 *  （2 秒后自动清空，客户端守卫、失败兜底与定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
/* —— 频道阵列 —— */
.deck {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--gap);
}

/* —— 频道模块 —— */
.channel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: color-mix(in srgb, var(--c-bg) 62%, transparent);
  border: var(--border-w) solid var(--c-border);
  transition:
    border-color var(--transition),
    box-shadow var(--transition);
}

.channel:hover {
  border-color: color-mix(in srgb, var(--c-accent) 45%, var(--c-border));
  box-shadow: var(--shadow);
}

.channel-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.channel-code {
  flex: none;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: color-mix(in srgb, var(--c-accent) 70%, transparent);
}

.channel-name {
  margin: 0;
  overflow: hidden;
  font-family: var(--font-head);
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 二维码：细线框图样（不做反色滤镜，保证可扫描） */
.channel-qr {
  align-self: flex-start;
  width: 96px;
  height: 96px;
  padding: 4px;
  background: #fff;
  border: var(--border-w) solid var(--c-border);
}

/* 号码读数 */
.channel-value {
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
  font-variant-numeric: tabular-nums;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.channel-foot {
  margin-top: auto;
}

/* 动作按钮：≥40px 触控目标 + hover 信号色填充 */
.channel-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  color: var(--c-accent);
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: var(--border-w) solid color-mix(in srgb, var(--c-accent) 45%, transparent);
  transition:
    color var(--transition),
    background var(--transition),
    border-color var(--transition);
}

.channel-action:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.channel-action:active {
  transform: var(--press-transform);
}

.action-glyph {
  font-family: var(--font-mono);
}

@media (prefers-reduced-motion: reduce) {
  .channel,
  .channel-action {
    transition: none;
  }

  .channel-action:active {
    transform: none;
  }
}
</style>

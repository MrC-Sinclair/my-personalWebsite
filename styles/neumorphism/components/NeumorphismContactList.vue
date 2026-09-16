<!--
  NeumorphismContactList - neumorphism 风格联系方式列表
  ------------------------------------------------------------
  社交信息 = 一条条压进材料里的凹槽行：平台名 + 微信号 /
  外链操作。操作按钮均为凸起小件、按下凹进材料：
  · GitHub → 外链按钮（↗）
  · 微信   → 「复制微信号」按钮（复用共享层 useClipboardCopy，
             客户端守卫、失败兜底与反馈定时器清理在其内部完成）
  · 钉钉/飞书/微信 → 「查看二维码」开合按钮（aria-expanded），
    展开后在凹槽里露出二维码图片（max-height 过渡，
    reduced-motion 下关闭）。
  不复用过渡层的 ContactForm 组件。
-->
<template>
  <ul class="contact-list">
    <li v-for="item in socials" :key="item.name" class="contact">
      <div class="contact-row">
        <span class="contact-name">{{ item.name }}</span>

        <span v-if="item.value" class="contact-value">
          <span class="contact-value-label">{{ t('contact.wechatId') }}</span>
          <span class="contact-value-mono">{{ item.value }}</span>
        </span>

        <span class="contact-actions">
          <a
            v-if="item.url"
            class="mini-btn"
            :href="item.url"
            target="_blank"
            rel="noopener"
            :aria-label="item.name"
          >
            <span aria-hidden="true">↗</span>
          </a>

          <button
            v-if="item.value"
            type="button"
            class="mini-btn"
            @click="copy(item.value)"
          >
            {{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}
          </button>

          <button
            v-if="item.qrCode"
            type="button"
            class="mini-btn"
            :aria-expanded="!!expanded[item.name]"
            @click="toggle(item.name)"
          >
            {{ t('contact.qrTip') }}
          </button>
        </span>
      </div>

      <!-- 二维码凹槽：展开时露出 -->
      <Transition name="qr">
        <div v-show="expanded[item.name]" class="contact-qr">
          <img
            class="qr-img"
            :src="item.qrCode"
            :alt="item.name"
            loading="lazy"
            width="176"
            height="176"
          >
        </div>
      </Transition>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import type { SocialLinkItem } from '~/types/site'

defineProps<{
  /** 社交链接列表（来自共享层 useAppInfo，含二维码与号码数据） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

/** 各平台二维码展开状态（键为平台名） */
const expanded = ref<Record<string, boolean>>({})

/** 剪贴板复制走共享层 useClipboardCopy：copied 为最近成功复制的号码
 *  （2 秒后自动清空，客户端守卫、失败兜底与定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()

/** 开合某平台的二维码凹槽 */
function toggle(name: string): void {
  expanded.value[name] = !expanded.value[name]
}
</script>

<style scoped>
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contact {
  display: flex;
  flex-direction: column;
}

/* —— 凹槽行 —— */
.contact-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  padding: 14px 18px;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  box-shadow: inset 4px 4px 9px #a3b1c6, inset -4px -4px 9px #ffffff;
}

.contact-name {
  flex: none;
  min-width: 64px;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  text-shadow: 1px 1px 1px rgb(255 255 255 / 0.9);
}

.contact-value {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.contact-value-label {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.contact-value-mono {
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: auto;
}

/* —— 凸起小按钮：hover 加深、active 凹进 —— */
.mini-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 8px 16px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-accent);
  cursor: pointer;
  background: var(--c-bg);
  border: none;
  border-radius: 999px;
  box-shadow: 4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.mini-btn:hover {
  color: var(--c-text);
  box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
}

.mini-btn:active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.mini-btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 二维码凹槽：展开时露出（max-height 过渡） —— */
.contact-qr {
  align-self: flex-start;
  max-height: 240px;
  margin: 12px 12px 0;
  padding: 12px;
  overflow: hidden;
  background: var(--c-bg);
  border-radius: var(--radius-sm);
  box-shadow: inset 4px 4px 9px #a3b1c6, inset -4px -4px 9px #ffffff;
}

.qr-img {
  display: block;
  width: 176px;
  height: 176px;
  border-radius: 8px;
  image-rendering: var(--img-rendering);
}

/* 展开过渡：凹槽从材料里「长出来」 */
.qr-enter-active,
.qr-leave-active {
  overflow: hidden;
  transition:
    max-height var(--transition),
    opacity var(--transition),
    margin-top var(--transition);
}

.qr-enter-from,
.qr-leave-to {
  max-height: 0;
  margin-top: 0;
  opacity: 0;
}

.qr-enter-to,
.qr-leave-from {
  max-height: 240px;
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .mini-btn,
  .qr-enter-active,
  .qr-leave-active {
    transition: none;
  }
}
</style>

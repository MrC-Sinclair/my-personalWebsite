<!--
  PixelContactList - pixel 风格联络面板内容
  ------------------------------------------------------------
  联系方式做成老游戏「存档情报」的键值行：KEY = 平台名（金黄
  全大写），VALUE = 外链 / 微信号（复制复用共享层 useClipboardCopy）/
  二维码提示；有二维码的行在行尾展示二维码图
  （image-rendering: pixelated 硬像素放大，风格签名）。
  整行 hover 色块反转。数据来自共享层 useAppInfo 的 socialLinks（页面传入）。
-->
<template>
  <ul class="list">
    <li v-for="item in socials" :key="item.name" class="crow">
      <span class="crow-key">{{ item.name }}</span>

      <span class="crow-val">
        <a
          v-if="item.url"
          class="crow-link"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ linkText(item.url) }}<span aria-hidden="true"> ↗</span>
        </a>
        <template v-else-if="item.value">
          <span class="crow-mono">{{ t('contact.wechatId') }}: {{ item.value }}</span>
          <button type="button" class="crow-copy" @click="copy(item.value ?? '')">
            {{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}
          </button>
        </template>
        <span v-else class="crow-tip">{{ t('contact.qrTip') }}</span>
      </span>

      <img
        v-if="item.qrCode"
        class="crow-qr"
        :src="item.qrCode"
        :alt="item.name"
        loading="lazy"
        width="56"
        height="56"
      >
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import type { SocialLinkItem } from '~/types/site'

defineProps<{
  /** 社交链接列表（来自 useAppInfo，含二维码与号码） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

/** 剪贴板复制走共享层：copied 为最近成功复制的号码（2 秒后自动清空，客户端守卫与定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()

/** 外链展示文本：去掉协议头（纯展示转换） */
function linkText(url: string): string {
  return url.replace(/^https?:\/\//, '')
}
</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.crow {
  display: grid;
  grid-template-columns: minmax(64px, auto) 1fr auto;
  align-items: center;
  gap: 8px 12px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--c-bg) 55%, var(--c-surface));
  border: 2px solid color-mix(in srgb, var(--c-muted) 40%, transparent);
}

/* hover 色块反转：整行变金黄底 */
.crow:hover {
  background: var(--c-accent);
  border-color: var(--c-border);
}

.crow-key {
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-accent);
  text-shadow: 2px 2px 0 var(--c-border);
  overflow-wrap: anywhere;
}

.crow-val {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  min-width: 0;
  font-size: var(--fs-small);
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.crow-link {
  color: var(--c-text);
  text-decoration: none;
}

.crow-mono {
  overflow-wrap: anywhere;
}

/* 复制按钮：40px 触控目标，hover 反转为草绿底 */
.crow-copy {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 10px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--c-text);
  background: var(--c-bg);
  border: 2px solid var(--c-border);
  cursor: pointer;
}

.crow-copy:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
}

.crow-copy:active {
  transform: var(--press-transform);
}

.crow-tip {
  color: var(--c-muted);
}

/* 二维码：pixelated 硬像素放大（风格签名） */
.crow-qr {
  width: 56px;
  height: 56px;
  image-rendering: var(--img-rendering);
  border: 2px solid var(--c-border);
  justify-self: end;
}

/* hover 反转后文字转深色 */
.crow:hover .crow-key,
.crow:hover .crow-link,
.crow:hover .crow-mono,
.crow:hover .crow-tip {
  color: var(--c-on-accent);
}

.crow-link:focus-visible,
.crow-copy:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
</style>

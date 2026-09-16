<!--
  Web2GlossySocialTile - Web 2.0 光泽风格的社交联系方式磁贴
  ------------------------------------------------------------
  白色光泽磁贴：凝胶字母圆牌（取平台名首字符）+ 平台名 + 附加值。
  - 有 url 的平台（GitHub）：整块渲染为 <a> 外链，hover 浮起 + 高光扫过
  - 无 url 的平台（钉钉/飞书/微信）：渲染为静态磁贴；微信号展示
    t('contact.wechatId') + 值
  不复用过渡层的图标体系与二维码图片，装饰全部纯 CSS。
-->
<template>
  <a
    v-if="link.url"
    :href="link.url"
    target="_blank"
    rel="noopener noreferrer"
    class="stile stile--link"
  >
    <span class="stile__medal" aria-hidden="true">{{ initial }}</span>
    <span class="stile__body">
      <span class="stile__name">{{ link.name }}</span>
      <span v-if="host" class="stile__value">{{ host }}</span>
    </span>
    <span class="stile__arrow" aria-hidden="true"/>
  </a>

  <div v-else class="stile">
    <span class="stile__medal" aria-hidden="true">{{ initial }}</span>
    <span class="stile__body">
      <span class="stile__name">{{ link.name }}</span>
      <span v-if="link.value" class="stile__value">
        <span class="stile__value-label">{{ t('contact.wechatId') }}</span>
        {{ link.value }}
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
/**
 * @file Web 2.0 光泽风格的社交联系方式磁贴组件
 * @description 数据来自共享层 useAppInfo().socialLinks（SocialLinkItem）。
 */
import type { SocialLinkItem } from '~/types/site'

const props = defineProps<{
  /** 社交链接数据（共享层返回值） */
  link: SocialLinkItem
}>()

const { t } = useI18n()

/** 字母圆牌取平台名首字符（文案本身来自 i18n，无硬编码） */
const initial = computed(() => props.link.name.charAt(0))

/** 外链域名展示（纯字符串解析，SSR 安全）；无外链则为空 */
const host = computed(() => {
  if (!props.link.url) return ''
  try {
    return new URL(props.link.url).host
  } catch {
    return ''
  }
})
</script>

<style scoped>
/* —— 白色光泽磁贴 —— */
.stile {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 84px;
  padding: 16px 18px;
  overflow: hidden;
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  background: linear-gradient(180deg, #ffffff 0%, #f3f9ff 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 2px 6px rgb(9 34 64 / 0.25),
    0 10px 22px rgb(9 34 64 / 0.22);
}

/* 可点击磁贴的交互反馈：浮起 + 高光扫过 */
.stile--link {
  color: inherit;
  text-decoration: none;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.stile--link::after {
  content: '';
  position: absolute;
  top: -25%;
  bottom: -25%;
  left: -32%;
  width: 34%;
  background: linear-gradient(90deg, rgb(255 255 255 / 0), rgb(255 255 255 / 0.55), rgb(255 255 255 / 0));
  transform: skewX(-20deg) translateX(-160%);
  transition: transform 540ms ease;
  pointer-events: none;
}

.stile--link:hover {
  transform: translateY(-4px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.95),
    0 6px 14px rgb(9 34 64 / 0.32),
    0 18px 36px rgb(9 34 64 / 0.26);
}

.stile--link:hover::after {
  transform: skewX(-20deg) translateX(460%);
}

.stile--link:active {
  transform: var(--press-transform);
}

.stile--link:focus-visible {
  outline: 3px solid rgb(255 255 255 / 0.75);
  outline-offset: 3px;
}

/* —— 凝胶字母圆牌 —— */
.stile__medal {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border: 1px solid #14417e;
  border-radius: 50%;
  color: var(--c-on-accent);
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 800;
  text-shadow: 0 1px 1px rgb(9 34 64 / 0.45);
  background: linear-gradient(180deg, #4f9cf0 0%, #2b72c6 52%, #1d5fae 100%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.6),
    0 3px 6px rgb(9 34 64 / 0.35);
}

/* 圆牌顶部高光 */
.stile__medal::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.55) 0%, rgb(255 255 255 / 0) 58%);
  pointer-events: none;
}

/* —— 文本区 —— */
.stile__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stile__name {
  font-family: var(--font-head);
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--c-text);
}

.stile__value {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  color: var(--c-muted);
  font-size: var(--fs-small);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.stile__value-label {
  color: #1a5fc0;
}

/* —— 外链箭头（纯 CSS 折角） —— */
.stile__arrow {
  flex: none;
  width: 11px;
  height: 11px;
  margin-left: auto;
  border-top: 3px solid #1a5fc0;
  border-right: 3px solid #1a5fc0;
  border-radius: 2px;
  transform: rotate(45deg);
  transition: transform var(--transition);
}

.stile--link:hover .stile__arrow {
  transform: rotate(45deg) translate(2px, -2px);
}
</style>

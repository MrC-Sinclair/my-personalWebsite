<!--
  FlatDesignSocialCard - 扁平化风格社交联系卡片
  ------------------------------------------------------------
  形态由共享层 useAppInfo 的 socialLinks 数据决定：
  - url 平台（GitHub）→ 整卡外链，新窗口打开
  - value 平台（微信号）→ 整卡复制按钮，点击复制并显示「已复制」
  - qrCode 平台（钉钉、飞书）→ 整卡切换按钮，点击展开二维码
  - 其余情况回退为纯信息展示
  标识是色圈 + 白色几何图形（几何图形代替图标）；
  复制与「已复制」反馈复用共享层 useClipboardCopy（客户端守卫与反馈定时器清理均在 composable 内完成）。
-->
<template>
  <!-- 外链形态 -->
  <a
    v-if="link.url"
    :href="link.url"
    target="_blank"
    rel="noopener"
    class="social-card"
    :style="{ '--tone': tone.main, '--tone-deep': tone.deep }"
  >
    <span class="social-card__mark" aria-hidden="true">
      <span class="social-card__glyph" :class="`social-card__glyph--v${variant}`"/>
    </span>
    <span class="social-card__text">
      <span class="social-card__name">{{ link.name }}</span>
      <span class="social-card__meta">{{ host }}</span>
    </span>
    <span class="social-card__arrow" aria-hidden="true">↗</span>
  </a>

  <!-- 可复制形态（微信号）：整卡为按钮，点击复制并反馈 -->
  <button
    v-else-if="link.value"
    type="button"
    class="social-card"
    :style="{ '--tone': tone.main, '--tone-deep': tone.deep }"
    :aria-label="t('contact.copyWechatId')"
    @click="copyValue"
  >
    <span class="social-card__mark" aria-hidden="true">
      <span class="social-card__glyph" :class="`social-card__glyph--v${variant}`"/>
    </span>
    <span class="social-card__text">
      <span class="social-card__name">{{ link.name }}</span>
      <span class="social-card__meta">
        {{ copied === link.value ? t('contact.copied') : `${t('contact.wechatId')} · ${link.value}` }}
      </span>
    </span>
    <span class="social-card__arrow" aria-hidden="true">{{ copied === link.value ? '✓' : '⧉' }}</span>
  </button>

  <!-- 二维码形态：整卡为切换按钮，点击展开 / 收起二维码 -->
  <button
    v-else-if="link.qrCode"
    type="button"
    class="social-card"
    :style="{ '--tone': tone.main, '--tone-deep': tone.deep }"
    :aria-expanded="qrOpen"
    :aria-label="qrAriaLabel"
    @click="qrOpen = !qrOpen"
  >
    <template v-if="qrOpen">
      <span class="social-card__qr">
        <img :src="link.qrCode" :alt="qrAriaLabel" width="96" height="96" loading="lazy" >
      </span>
      <span class="social-card__text">
        <span class="social-card__name">{{ link.name }}</span>
      </span>
      <span class="social-card__arrow" aria-hidden="true">✕</span>
    </template>
    <template v-else>
      <span class="social-card__mark" aria-hidden="true">
        <span class="social-card__glyph" :class="`social-card__glyph--v${variant}`"/>
      </span>
      <span class="social-card__text">
        <span class="social-card__name">{{ link.name }}</span>
        <span class="social-card__meta">{{ t('contact.qrTip') }}</span>
      </span>
      <span class="social-card__arrow" aria-hidden="true">▾</span>
    </template>
  </button>

  <!-- 回退：纯信息展示 -->
  <div
    v-else
    class="social-card social-card--static"
    :style="{ '--tone': tone.main, '--tone-deep': tone.deep }"
  >
    <span class="social-card__mark" aria-hidden="true">
      <span class="social-card__glyph" :class="`social-card__glyph--v${variant}`"/>
    </span>
    <span class="social-card__text">
      <span class="social-card__name">{{ link.name }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import type { SocialLinkItem } from '~/types/site'
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import { flatTone } from '../tones'

const props = defineProps<{
  /** 社交链接数据（来自共享层 useAppInfo） */
  link: SocialLinkItem
  /** 序号：决定色圈颜色与几何图形（循环取用，SSR 安全） */
  toneIndex: number
}>()

const { t } = useI18n()

/** 当前色调（主色 + 加深色，经 CSS 变量注入） */
const tone = computed(() => flatTone(props.toneIndex))

/** 几何图形变体（0-3 循环：三角 / 方形 / 菱形 / 圆环） */
const variant = computed(() => ((props.toneIndex % 4) + 4) % 4)

/** 二维码按钮的无障碍名称（平台名 + 提示语均来自内容层/i18n） */
const qrAriaLabel = computed(() => `${props.link.name} · ${t('contact.qrTip')}`)

/** 外链平台的主机名（纯解析，SSR 安全；解析失败回退空串） */
const host = computed(() => {
  if (!props.link.url) return ''
  try {
    return new URL(props.link.url).host
  } catch {
    return ''
  }
})

/** 剪贴板复制走共享层 useClipboardCopy：copied 为最近成功复制的文本（2 秒自动清空，定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()

/** 二维码展开状态 */
const qrOpen = ref(false)

/** 复制平台值（如微信号）到剪贴板，成功后由 copied 驱动 2 秒反馈 */
function copyValue() {
  const value = props.link.value
  if (value) void copy(value)
}
</script>

<style scoped>
.social-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 64px;
  padding: 14px 16px;
  font: inherit;
  text-align: left;
  color: inherit;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color var(--transition);
}

/* 非交互回退形态：去掉指针与边框反馈 */
.social-card--static {
  cursor: default;
}

.social-card:hover {
  border-color: var(--tone);
}

.social-card:focus-visible {
  outline: 3px solid var(--tone);
  outline-offset: 2px;
}

/* 色圈标识：纯色圆 + 白色几何图形（代替图标），hover 加深 */
.social-card__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  background: var(--tone);
  border-radius: 50%;
  transition: background var(--transition);
}

.social-card:hover .social-card__mark {
  background: var(--tone-deep);
}

/* 几何图形：三角 / 方形 / 菱形 / 圆环 */
.social-card__glyph {
  display: block;
}

.social-card__glyph--v0 {
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 16px solid #ffffff;
}

.social-card__glyph--v1 {
  width: 15px;
  height: 15px;
  background: #ffffff;
  border-radius: 2px;
}

.social-card__glyph--v2 {
  width: 14px;
  height: 14px;
  background: #ffffff;
  transform: rotate(45deg);
}

.social-card__glyph--v3 {
  width: 16px;
  height: 16px;
  border: 4px solid #ffffff;
  border-radius: 50%;
}

.social-card__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.social-card__name {
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text);
  transition: color var(--transition);
}

.social-card:hover .social-card__name {
  color: var(--tone);
}

.social-card__meta {
  font-size: var(--fs-small);
  color: var(--c-muted);
  overflow-wrap: anywhere;
}

/* 尾部符号：随卡片 hover 变色（无位移） */
.social-card__arrow {
  margin-left: auto;
  font-size: 16px;
  font-weight: 700;
  color: var(--tone);
  transition: color var(--transition);
}

.social-card:hover .social-card__arrow {
  color: var(--tone-deep);
}

/* 二维码：白色衬底保证可扫描，图片为既有公共资源 */
.social-card__qr {
  flex: 0 0 auto;
  padding: 6px;
  background: #ffffff;
  border: var(--border-w) solid var(--c-border);
  border-radius: var(--radius-sm);
}

.social-card__qr img {
  display: block;
  width: 96px;
  height: auto;
}
</style>

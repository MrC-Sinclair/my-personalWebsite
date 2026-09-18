<!--
  MetroSocialTile - 社交联系方式 Tile
  ------------------------------------------------------------
  形态由共享层 useAppInfo 的 socialLinks 数据决定：
  - url 平台（GitHub）→ 整块外链，新窗口打开
  - value 平台（微信号）→ 整块复制按钮，点击复制并显示「已复制」反馈
  - qrCode 平台（钉钉、飞书）→ 整块切换按钮，点击在 Tile 内展开二维码
  - 其余情况回退为纯信息 Tile
  复制与「已复制」反馈复用共享层 useClipboardCopy（客户端守卫、
  失败兜底与定时器清理在其内部完成）。
-->
<template>
  <!-- 外链形态 -->
  <MetroTile v-if="link.url" :variant="variant" :href="link.url" class="social">
    <span class="social__glyph" aria-hidden="true">↗</span>
    <span class="social__name">{{ link.name }}</span>
  </MetroTile>

  <!-- 可复制形态：整块为按钮，点击复制并反馈 -->
  <MetroTile
    v-else-if="link.value"
    :variant="variant"
    button
    :aria-label="t('contact.copyWechatId')"
    class="social"
    @click="copyValue"
  >
    <span class="social__glyph" aria-hidden="true">{{ copied === link.value ? '✓' : '⧉' }}</span>
    <span class="social__name">{{ copied === link.value ? t('contact.copied') : link.value }}</span>
    <span class="social__meta">{{ t('contact.wechatId') }}</span>
  </MetroTile>

  <!-- 二维码形态：整块为按钮，点击展开/收起二维码 -->
  <MetroTile
    v-else-if="link.qrCode"
    :variant="variant"
    button
    :aria-label="qrAriaLabel"
    class="social"
    @click="toggleQr"
  >
    <template v-if="qrOpen">
      <span class="social__qr">
        <img :src="link.qrCode" :alt="qrAriaLabel" width="96" height="96" loading="lazy" >
      </span>
      <span class="social__name">{{ link.name }}</span>
    </template>
    <template v-else>
      <span class="social__glyph" aria-hidden="true">▣</span>
      <span class="social__name">{{ link.name }}</span>
      <span class="social__meta">{{ t('contact.qrTip') }}</span>
    </template>
  </MetroTile>

  <!-- 回退：纯信息展示 -->
  <MetroTile v-else :variant="variant" class="social">
    <span class="social__name">{{ link.name }}</span>
  </MetroTile>
</template>

<script setup lang="ts">
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import type { SocialLinkItem } from '~/types/site'
import MetroTile from './MetroTile.vue'
import type { MetroTileVariant } from './MetroTile.vue'

const props = defineProps<{
  /** 社交链接数据（来自共享层 useAppInfo） */
  link: SocialLinkItem
  /** 色块变体 */
  variant?: MetroTileVariant
}>()

const { t } = useI18n()

/** 剪贴板复制走共享层：copied 为最近成功复制的文本（2 秒后自动清空），客户端守卫与定时器清理在其内部完成 */
const { copied, copy } = useClipboardCopy()

/** 二维码展开状态 */
const qrOpen = ref(false)

/** 二维码按钮的无障碍名称（平台名 + 提示语均来自内容层/i18n） */
const qrAriaLabel = computed(() => `${props.link.name} · ${t('contact.qrTip')}`)

/** 复制平台值（如微信号）到剪贴板，「已复制」反馈与定时器清理由共享层处理 */
async function copyValue() {
  const value = props.link.value
  if (value) await copy(value)
}

/** 展开/收起二维码 */
function toggleQr() {
  qrOpen.value = !qrOpen.value
}
</script>

<style scoped>
.social__glyph {
  font-size: 22px;
  font-weight: 300;
  line-height: 1;
}

.social__name {
  font-family: var(--font-head);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: break-word;
}

.social__meta {
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
}

/* 二维码：白色衬底保证可扫描，图片为既有公共资源 */
.social__qr {
  align-self: flex-start;
  padding: 5px;
  background: #ffffff;
}

.social__qr img {
  display: block;
  width: 96px;
  height: auto;
}
</style>

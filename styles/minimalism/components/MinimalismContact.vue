<!--
  MinimalismContact - minimalism 风格的「联系」区块
  ------------------------------------------------------------
  社交联系方式以安静的行列表呈现（不复用过渡层 ContactForm）：
  平台名（+ 微信号等值）居左，二维码缩略图（默认灰度、悬停
  恢复彩色的克制反馈）与操作居右——GitHub 为外链，微信号
  提供「复制」按钮（复制动作复用共享层 useClipboardCopy：
  客户端守卫、失败静默兜底与反馈定时器清理均在 composable
  内完成）。
  数据来自共享层 useAppInfo（socialLinks）。
-->
<template>
  <MinimalismSection
    id="contact"
    data-section="contact"
    :eyebrow="t('nav.contact')"
    :title="t('contact.title')"
    :desc="t('contact.description')"
  >
    <ul class="cta">
      <li v-for="item in socials" :key="item.name" class="cta-row">
        <div class="cta-info">
          <span class="cta-name">{{ item.name }}</span>
          <span v-if="item.value" class="cta-value">{{ item.value }}</span>
        </div>

        <img
          v-if="item.qrCode"
          class="cta-qr"
          :src="item.qrCode"
          :alt="item.name"
          loading="lazy"
          width="56"
          height="56"
        >

        <a
          v-if="item.url"
          class="cta-link"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.name }}<span class="cta-out" aria-hidden="true">↗</span>
        </a>
        <button
          v-else-if="item.value"
          type="button"
          class="cta-copy"
          @click="copy(item.value)"
        >
          {{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}
        </button>
      </li>
    </ul>
  </MinimalismSection>
</template>

<script setup lang="ts">
import type { SocialLinkItem } from '~/types/site'
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import MinimalismSection from './MinimalismSection.vue'

const { t } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { socialLinks } = useAppInfo()

/** 社交列表防御：数组异常时回退空列表 */
const socials = computed<SocialLinkItem[]>(() =>
  Array.isArray(socialLinks.value) ? socialLinks.value : [],
)

// —— 复制动作收敛到共享层 useClipboardCopy ——
// copied 为最近一次成功复制的文本（2 秒自动清空），模板用
// copied === item.value 判断哪个条目处于「已复制」反馈态；
// 客户端守卫、失败静默兜底与定时器清理均在 composable 内完成。
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
/* —— 联系行：平台名 | 二维码 | 操作，hairline 分隔 —— */
.cta {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 18px;
  padding: 16px 10px;
  border-top: var(--border-w) solid var(--c-border);
  transition: background var(--transition);
}

.cta-row:hover {
  background: var(--deco);
}

.cta-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  margin-right: auto;
}

.cta-name {
  font-weight: 500;
  color: var(--c-text);
}

.cta-value {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
  overflow-wrap: anywhere;
}

/* —— 二维码缩略图：默认灰度，悬停恢复（克制的显现） —— */
.cta-qr {
  flex: none;
  width: 56px;
  height: 56px;
  background: var(--c-surface);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  filter: grayscale(1);
  opacity: 0.85;
  image-rendering: var(--img-rendering);
  transition:
    filter var(--transition),
    opacity var(--transition),
    transform var(--transition);
}

.cta-row:hover .cta-qr {
  filter: none;
  opacity: 1;
  transform: translateY(-2px);
}

/* —— 外链 / 复制：下划线文字按钮（≥40px 触控目标） —— */
.cta-link,
.cta-copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 40px;
  padding: 6px 2px;
  font-size: var(--fs-small);
  color: var(--c-text);
  text-decoration: underline;
  text-decoration-color: var(--c-border);
  text-decoration-thickness: 1px;
  text-underline-offset: 6px;
  cursor: pointer;
  background: transparent;
  border: none;
  transition:
    color var(--transition),
    text-decoration-color var(--transition);
}

.cta-link:hover,
.cta-copy:hover {
  color: var(--c-accent);
  text-decoration-color: var(--c-accent);
}

.cta-link:active,
.cta-copy:active {
  transform: var(--press-transform);
}

.cta-out {
  font-size: 0.9em;
}

@media (prefers-reduced-motion: reduce) {
  .cta-row,
  .cta-qr,
  .cta-link,
  .cta-copy {
    transition: none;
  }

  .cta-row:hover .cta-qr {
    transform: none;
  }

  .cta-link:active,
  .cta-copy:active {
    transform: none;
  }
}
</style>

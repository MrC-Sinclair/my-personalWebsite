<!--
  ClaymorphismContactClump - claymorphism 风格联系方式黏土鹅卵石
  ------------------------------------------------------------
  社交信息以一排「鹅卵石黏土卡」呈现：有二维码的平台展示
  圆角二维码（数据来自共享层 socialLinks.qrCode，不新增图片
  资源）；GitHub 为外链鹅卵石；微信展示号码并提供「复制」
  按钮（复用共享层 useClipboardCopy，客户端守卫、失败兜底与
  反馈定时器清理在其内部完成）。
  不复用过渡层的 ContactForm 组件。
-->
<template>
  <div class="clump">
    <article v-for="item in socials" :key="item.name" class="pebble">
      <header class="head">
        <!-- 平台小黏土点 -->
        <span class="pip" aria-hidden="true"/>
        <h3 class="name">{{ item.name }}</h3>
      </header>

      <img
        v-if="item.qrCode"
        class="qr"
        :src="item.qrCode"
        :alt="item.name"
        loading="lazy"
        width="104"
        height="104"
      >

      <p v-if="item.value" class="value-line">
        <span class="value-label">{{ t('contact.wechatId') }}</span>
        <span class="value-text">{{ item.value }}</span>
      </p>

      <footer v-if="item.url || item.value" class="foot">
        <a v-if="item.url" class="pill" :href="item.url" target="_blank" rel="noopener noreferrer">
          {{ item.name }}<span class="arrow" aria-hidden="true">→</span>
        </a>
        <button v-else-if="item.value" type="button" class="pill" @click="copy(item.value)">
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
  /** 社交链接列表（来自共享层 useAppInfo，含二维码与号码） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

/** 剪贴板复制走共享层 useClipboardCopy：copied 为最近成功复制的号码
 *  （2 秒后自动清空，客户端守卫、失败兜底与定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
/* 鹅卵石排布：自适应等宽 */
.clump {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: var(--gap);
}

.pebble {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: var(--space);
  background: var(--c-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.pebble:hover {
  transform: translateY(-4px);
  box-shadow:
    0 26px 44px rgb(150 90 210 / 0.28),
    0 10px 18px rgb(150 90 210 / 0.16),
    inset 0 10px 18px rgb(255 255 255 / 0.65),
    inset 0 -10px 16px rgb(125 63 201 / 0.1);
}

.head {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 平台小黏土点（Pastel 轮换装饰） */
.pip {
  flex: none;
  width: 16px;
  height: 16px;
  background: var(--deco), var(--pip-color, #c3a6f5);
  border-radius: 50%;
  box-shadow: 0 4px 7px rgb(150 90 210 / 0.3);
}

.pebble:nth-child(5n + 1) .pip {
  --pip-color: #f7a8c8;
}

.pebble:nth-child(5n + 2) .pip {
  --pip-color: #8fddb7;
}

.pebble:nth-child(5n + 3) .pip {
  --pip-color: #ffd97a;
}

.pebble:nth-child(5n + 4) .pip {
  --pip-color: #c3a6f5;
}

.pebble:nth-child(5n) .pip {
  --pip-color: #93c2f5;
}

.name {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 800;
  color: var(--c-text);
}

/* 二维码：圆角 + 黏土压印框（图片来自共享层数据） */
.qr {
  align-self: flex-start;
  width: 104px;
  height: 104px;
  image-rendering: var(--img-rendering);
  border-radius: var(--radius-sm);
  box-shadow:
    inset 0 3px 6px rgb(125 63 201 / 0.14),
    inset 0 -2px 4px rgb(255 255 255 / 0.85),
    0 5px 9px rgb(150 90 210 / 0.16);
}

.value-line {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
}

.value-label {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

.value-text {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.foot {
  margin-top: auto;
}

/* 外链 / 复制按钮：紫黏土胶囊（≥40px 触控目标） */
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 40px;
  padding: 8px 16px;
  font-family: inherit;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-on-accent);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  background: var(--c-accent);
  border: 0;
  border-radius: 999px;
  box-shadow:
    0 8px 14px rgb(125 63 201 / 0.32),
    inset 0 4px 7px rgb(255 255 255 / 0.4),
    inset 0 -4px 6px rgb(90 40 150 / 0.25);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.pill:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 20px rgb(125 63 201 / 0.36),
    inset 0 4px 7px rgb(255 255 255 / 0.4),
    inset 0 -4px 6px rgb(90 40 150 / 0.25);
}

.pill:active {
  transform: var(--press-transform);
  box-shadow:
    0 4px 8px rgb(125 63 201 / 0.3),
    inset 0 3px 6px rgb(255 255 255 / 0.35),
    inset 0 -4px 8px rgb(90 40 150 / 0.3);
}

.arrow {
  transition: transform var(--transition);
}

.pill:hover .arrow {
  transform: translateX(3px);
}

@media (prefers-reduced-motion: reduce) {
  .pebble,
  .pill,
  .arrow {
    transition: none;
  }

  .pebble:hover,
  .pill:hover,
  .pill:active {
    transform: none;
  }
}
</style>

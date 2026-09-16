<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismBrassPlate - 拟物风格联系方式铭牌
  ------------------------------------------------------------
  一块「黄铜蚀刻铭牌」：拉丝金属渐变 + 斜向高光扫光
  （--deco）+ 四角铆钉；社交信息以蚀刻槽位分格呈现 —— 有
  二维码的平台展示二维码（黄铜相框），GitHub 为皮革外链
  按钮，微信号提供「复制」按钮（复用共享层 useClipboardCopy，
  客户端守卫、失败兜底与定时器清理在其内部完成）。
  不复用过渡层的 ContactForm 组件。
-->
<template>
  <div class="plate">
    <span class="rivet rivet--tl" aria-hidden="true" />
    <span class="rivet rivet--tr" aria-hidden="true" />
    <span class="rivet rivet--bl" aria-hidden="true" />
    <span class="rivet rivet--br" aria-hidden="true" />

    <p class="plate-intro">{{ t('contact.description') }}</p>
    <p class="plate-caption">{{ t('contact.socialLinks') }}</p>

    <div class="plate-grid">
      <section v-for="item in socials" :key="item.name" class="cell">
        <h3 class="cell-name">{{ item.name }}</h3>

        <!-- 二维码：黄铜相框（内凹开槽） -->
        <img
          v-if="item.qrCode"
          class="cell-qr"
          :src="item.qrCode"
          :alt="item.name"
          loading="lazy"
          width="104"
          height="104"
        >

        <p v-if="item.value" class="cell-value">
          <span class="cell-value-label">{{ t('contact.wechatId') }}</span>
          <span class="cell-value-mono">{{ item.value }}</span>
        </p>

        <div class="cell-foot">
          <!-- 外链（GitHub）：皮革按钮 -->
          <a v-if="item.url" class="cell-btn" :href="item.url" target="_blank" rel="noopener">
            {{ item.name }}<span class="cell-ext" aria-hidden="true"> ↗</span>
          </a>
          <!-- 复制微信号：皮革按钮 -->
          <button
            v-else-if="item.value"
            type="button"
            class="cell-btn"
            @click="copy(item.value ?? '')"
          >
            {{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file 拟物风格的联系方式铭牌组件
 * @description 黄铜拉丝铭牌：蚀刻槽位 + 二维码相框 + 皮革动作按钮；
 *              数据来自共享层 useAppInfo()。
 */
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import type { SocialLinkItem } from '~/types/site'

defineProps<{
  /** 社交链接列表（来自 useAppInfo，含二维码与号码数据） */
  socials: SocialLinkItem[]
}>()

const { t } = useI18n()

/** 剪贴板复制走共享层：copied 为最近成功复制的号码（2 秒后自动清空，客户端守卫与定时器清理在其内部完成） */
const { copied, copy } = useClipboardCopy()
</script>

<style scoped>
.plate {
  position: relative;
  padding: calc(var(--space) * 1.3) calc(var(--space) * 1.4);
  border: 1px solid rgb(0 0 0 / 0.65);
  border-radius: var(--radius);
  /* 黄铜拉丝：细拉丝线 + 多段金属渐变 + 斜向高光扫光（--deco） */
  background:
    var(--deco),
    repeating-linear-gradient(105deg, rgb(255 255 255 / 0.06) 0 1px, transparent 1px 3px),
    linear-gradient(180deg, #d9b36a 0%, #bd9040 36%, #9a6d2c 56%, #c49a4e 80%, #a87c34 100%);
  background-size: 100% 100%, auto, 100% 100%;
  box-shadow:
    inset 0 1px 0 rgb(255 244 210 / 0.65),
    inset 0 -2px 6px rgb(0 0 0 / 0.42),
    var(--shadow);
}

/* —— 四角铆钉 —— */
.rivet {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f6e7ba 0%, #a67c34 58%, #59400f 100%);
  box-shadow:
    inset 0 -2px 3px rgb(0 0 0 / 0.6),
    0 1px 1px rgb(255 244 210 / 0.5);
}

.rivet--tl { top: 12px; left: 12px; }
.rivet--tr { top: 12px; right: 12px; }
.rivet--bl { bottom: 12px; left: 12px; }
.rivet--br { bottom: 12px; right: 12px; }

/* —— 蚀刻文字（深棕刻进黄铜） —— */
.plate-intro {
  margin: 0 0 6px;
  max-width: 58ch;
  color: var(--c-on-accent);
}

.plate-caption {
  margin: 0 0 var(--gap);
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: rgb(42 24 8 / 0.85);
}

/* —— 槽位网格：蚀刻分隔（暗上亮下 = 凹槽） —— */
.plate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: var(--gap);
}

.cell {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: var(--gap) 16px;
  border-radius: var(--radius-sm);
  /* 凹槽：上暗下亮的内嵌 + 微弱落影 */
  box-shadow:
    inset 0 2px 4px rgb(0 0 0 / 0.38),
    inset 0 -1px 0 rgb(255 244 210 / 0.45);
  transition: box-shadow var(--transition), transform var(--transition);
}

.cell:hover {
  box-shadow:
    inset 0 2px 4px rgb(0 0 0 / 0.3),
    inset 0 -1px 0 rgb(255 244 210 / 0.55),
    0 4px 8px rgb(10 4 0 / 0.35);
  transform: translateY(-2px);
}

.cell-name {
  display: flex;
  align-items: center;
  margin: 0;
  font-family: var(--font-head);
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-on-accent);
}

/* —— 二维码：黄铜相框（内凹开槽嵌照片） —— */
.cell-qr {
  align-self: flex-start;
  width: 104px;
  height: 104px;
  image-rendering: var(--img-rendering);
  border: 4px solid #c39a4c;
  border-radius: var(--radius-sm);
  box-shadow:
    inset 0 0 0 2px rgb(0 0 0 / 0.45),
    0 2px 5px rgb(10 4 0 / 0.45);
  transition: transform var(--transition);
}

.cell:hover .cell-qr {
  transform: scale(1.03);
}

.cell-value {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
}

.cell-value-label {
  font-size: var(--fs-small);
  color: rgb(42 24 8 / 0.85);
}

.cell-value-mono {
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--c-on-accent);
  overflow-wrap: anywhere;
}

/* —— 动作按钮：皮革按钮（在黄铜上跳出来） —— */
.cell-foot {
  margin-top: auto;
}

.cell-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 40px;
  padding: 8px 14px;
  font-family: var(--font-head);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #f3e7c9;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid rgb(0 0 0 / 0.55);
  border-radius: var(--radius-sm);
  background:
    radial-gradient(circle at 24% 32%, rgb(255 255 255 / 0.05) 1px, transparent 1.6px),
    linear-gradient(180deg, #6b4223 0%, #543116 100%);
  background-size: 8px 8px, 100% 100%;
  box-shadow:
    inset 0 1px 0 rgb(255 240 210 / 0.16),
    inset 0 -2px 4px rgb(0 0 0 / 0.4),
    0 3px 6px rgb(10 4 0 / 0.5);
  transition:
    filter var(--transition),
    transform var(--transition),
    box-shadow var(--transition);
}

.cell-btn:hover {
  filter: brightness(1.12);
}

/* 按压行程：按进黄铜面 */
.cell-btn:active {
  transform: var(--press-transform);
  box-shadow: var(--shadow-press);
}

.cell-ext {
  font-family: var(--font-mono);
}

/* —— 窄屏：铭牌内边距收紧 —— */
@media (max-width: 640px) {
  .plate {
    padding: var(--space);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cell,
  .cell-qr,
  .cell-btn {
    transition: none;
  }

  .cell:hover {
    transform: none;
  }

  .cell:hover .cell-qr {
    transform: none;
  }

  .cell-btn:active {
    transform: none;
  }
}
</style>

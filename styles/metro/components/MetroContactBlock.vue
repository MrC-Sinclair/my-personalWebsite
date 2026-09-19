<!--
  MetroContactBlock - Metro 风格「联系」内容块（首页与 /contact 共用）
  ------------------------------------------------------------
  首页联系区块里的整行紫色大 Tile（社交引导语）+ 社交链接 Tiles。
  抽成独立组件后，首页与子页共用同一份内容。社交配色用 MetroTileVariant
  循环（与首页同款节奏）。

  数据来自共享层 useAppInfo 的 socialLinks（随 locale 变化）。
-->
<template>
  <div class="mosaic">
    <MetroTile span="full" variant="violet" class="contact-intro">
      <span class="contact__kicker">{{ t('contact.socialLinks') }}</span>
      <p class="contact__text">{{ t('contact.description') }}</p>
    </MetroTile>

    <MetroSocialTile
      v-for="(link, index) in safeSocialLinks"
      :key="link.name"
      :link="link"
      :variant="pickVariant(socialVariants, index)"
    />
  </div>
</template>

<script setup lang="ts">
import MetroSocialTile from './MetroSocialTile.vue'
import MetroTile from './MetroTile.vue'
import type { MetroTileVariant } from './MetroTile.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()

// 防御：数组字段非数组时回退为空列表
const safeSocialLinks = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))

// Tile 配色循环（Metro 经典色块的排布节奏）
const socialVariants: MetroTileVariant[] = ['cobalt', 'teal', 'purple', 'green']

/** 按索引取配色，越界回退 cobalt */
function pickVariant(list: MetroTileVariant[], index: number): MetroTileVariant {
  return list[index] ?? 'cobalt'
}
</script>

<style scoped>
/* ================= 联系色带（整行 Tile）内容 ================= */
.contact__kicker {
  font-size: var(--fs-small);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.contact__text {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(20px, 2.6vw, 32px);
  font-weight: 300;
  line-height: 1.3;
}
</style>

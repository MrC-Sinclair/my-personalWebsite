<!--
  ClaymorphismContact - claymorphism 风格的「联系」子页（/style/claymorphism/contact）
  ------------------------------------------------------------
  壳由 ClaymorphismSubPage 提供；主体是奶油色「联系岛」+ 鹅卵石卡，
  与首页 05 号岛同一套（不复用过渡层 ContactForm）。
-->
<template>
  <ClaymorphismSubPage>
    <section class="island island-butter">
      <ClaymorphismSectionHead eyebrow="05" :level="1" :title="t('contact.title')" tone="pink" />
      <p class="intro">{{ t('contact.description') }}</p>
      <ClaymorphismContactClump :socials="socialLinks" />
    </section>
  </ClaymorphismSubPage>
</template>

<script setup lang="ts">
import ClaymorphismSubPage from '../components/ClaymorphismSubPage.vue'
import ClaymorphismSectionHead from '../components/ClaymorphismSectionHead.vue'
import ClaymorphismContactClump from '../components/ClaymorphismContactClump.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()
</script>

<style scoped>
/* —— 黏土岛：厚板 + 超大圆角（与首页同款） —— */
.island {
  padding: clamp(24px, 4vw, 40px);
  border-radius: clamp(32px, 5vw, 44px);
  box-shadow: var(--shadow);
}

.island-butter {
  background: #fff3cd;
}

/* 岛内简介文本 */
.intro {
  margin: 0 0 var(--space);
  color: var(--c-text);
}
</style>

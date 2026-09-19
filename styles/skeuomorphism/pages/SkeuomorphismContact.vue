<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismContact - 拟物风格的「联系」子页（/style/skeuomorphism/contact）
  ------------------------------------------------------------
  壳由 SkeuomorphismSubPage 提供；主体是黄铜蚀刻铭牌
  （不复用过渡层 ContactForm）。
-->
<template>
  <SkeuomorphismSubPage>
    <section id="contact" data-section="contact" class="section" aria-labelledby="contact-title">
      <SkeuomorphismSectionHead
        id="contact-title"
        :level="1"
        :badge="t('nav.contact')"
        :title="t('contact.title')"
      />
      <SkeuomorphismBrassPlate
        v-if="safeSocials.length"
        :socials="safeSocials"
        class="contact-plate scroll-reveal"
      />
      <SkeuomorphismEmptyNote v-else :message="t('contact.description')" />
    </section>
  </SkeuomorphismSubPage>
</template>

<script setup lang="ts">
import SkeuomorphismSubPage from '../components/SkeuomorphismSubPage.vue'
import SkeuomorphismSectionHead from '../components/SkeuomorphismSectionHead.vue'
import SkeuomorphismBrassPlate from '../components/SkeuomorphismBrassPlate.vue'
import SkeuomorphismEmptyNote from '../components/SkeuomorphismEmptyNote.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()

const safeSocials = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))
</script>

<style scoped>
.section {
  scroll-margin-top: 6.5rem;
  min-width: 0;
}

/* 铭牌略微右倾，像随手摆在桌面上 */
.contact-plate {
  display: block;
  transform: rotate(-0.6deg);
}
</style>

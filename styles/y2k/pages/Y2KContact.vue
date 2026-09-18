<!--
  Y2KContact - y2k 风格的「联系」子页（/style/y2k/contact）
  ------------------------------------------------------------
  壳由 Y2KSubPage 提供；主体是首页那块「星际通讯台」——pink 塑料板
  内嵌社交卡槽（号码可复制）。社交链接是站点静态信息，
  无异步数据，因此本页不含 useAsyncData。
-->
<template>
  <Y2KSubPage>
    <section class="section" aria-labelledby="contact-title">
      <Y2KSectionHead id="contact-title" :badge="t('nav.contact')" :title="t('contact.title')"/>
      <Y2KPlasticPanel variant="pink" class="contact-panel scroll-reveal">
        <p class="contact-intro">{{ t('contact.description') }}</p>
        <Y2KContactDeck v-if="safeSocials.length" :socials="safeSocials"/>
      </Y2KPlasticPanel>
    </section>
  </Y2KSubPage>
</template>

<script setup lang="ts">
import Y2KSubPage from '../components/Y2KSubPage.vue'
import Y2KSectionHead from '../components/Y2KSectionHead.vue'
import Y2KPlasticPanel from '../components/Y2KPlasticPanel.vue'
import Y2KContactDeck from '../components/Y2KContactDeck.vue'

const { t } = useI18n()

// —— 共享层站点信息（数组字段一律 Array.isArray 防御） ——
const { socialLinks } = useAppInfo()
const safeSocials = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))
</script>

<style scoped>
.section {
  min-width: 0;
}

.contact-panel {
  min-width: 0;
}

.contact-intro {
  margin: 0 0 var(--gap);
  color: var(--c-muted);
}
</style>

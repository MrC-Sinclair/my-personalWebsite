<!--
  Web2GlossyContact - web2-glossy 风格的「联系」子页（/style/web2-glossy/contact）
  ------------------------------------------------------------
  壳由 Web2GlossySubPage 提供；主体是首页那块深蓝大色块里的
  「白色光泽磁贴」网格（section--band 的整块玻璃感保留）。
  社交链接是站点静态信息，无异步数据，因此本页不含 useAsyncData。
-->
<template>
  <Web2GlossySubPage>
    <section class="section section--band" aria-labelledby="contact-title">
      <div class="container contact-inner">
        <Web2GlossySectionHead
          id="contact-title"
          :badge="t('contact.socialLinks')"
          :title="t('contact.title')"
          theme="light"
          align="center"
        />
        <p class="contact-inner__desc">{{ t('contact.description') }}</p>

        <div class="social-grid">
          <Web2GlossySocialTile
            v-for="link in safeSocialLinks"
            :key="link.name"
            :link="link"
            class="scroll-reveal"
          />
        </div>
      </div>
    </section>
  </Web2GlossySubPage>
</template>

<script setup lang="ts">
import Web2GlossySubPage from '../components/Web2GlossySubPage.vue'
import Web2GlossySectionHead from '../components/Web2GlossySectionHead.vue'
import Web2GlossySocialTile from '../components/Web2GlossySocialTile.vue'

const { t } = useI18n()

// —— 共享层站点信息（数组字段一律 Array.isArray 防御） ——
const { socialLinks } = useAppInfo()
const safeSocialLinks = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))
</script>

<style scoped>
/* —— 区块容器 —— */
.container {
  max-width: var(--page-w);
  margin-inline: auto;
  padding-inline: clamp(16px, 4vw, 32px);
}

.section {
  padding-block: clamp(56px, 9vw, 96px);
}

/* 深蓝色带（联系区）：整块光泽玻璃感 */
.section--band {
  position: relative;
  overflow: hidden;
  border-top: 2px solid rgb(255 255 255 / 0.5);
  background: linear-gradient(180deg, #2b72c6 0%, #1d5fae 45%, #174a8f 100%);
}

/* 深蓝色带顶部的半条光泽反光 */
.section--band::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 42%;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.2) 0%, rgb(255 255 255 / 0) 100%);
  pointer-events: none;
}

.contact-inner {
  position: relative;
  z-index: 1;
  display: grid;
  gap: var(--gap);
  justify-items: center;
}

.contact-inner__desc {
  margin: 0;
  color: rgb(255 255 255 / 0.85);
  text-align: center;
}

/* 磁贴网格：自动填充 */
.social-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--gap);
  width: 100%;
}
</style>

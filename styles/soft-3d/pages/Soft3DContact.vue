<!--
  Soft3DContact - soft-3d 风格的「联系」子页（/style/soft-3d/contact）
  ------------------------------------------------------------
  壳由 Soft3DSubPage 提供（标题 sun 档）；主体是「漂浮联系舱」网格，
  与首页联系区一致（展示型，不复用过渡层 ContactForm）。
  社交链接是站点静态信息，无异步数据，因此本页不含 useAsyncData。
-->
<template>
  <Soft3DSubPage
    :eyebrow="t('nav.contact')"
    :title="t('contact.title')"
    :description="t('contact.description')"
    variant="sun"
  >
    <div class="contact-grid">
      <div
        v-for="(item, i) in socialLinks"
        :key="item.name"
        class="reveal-wrap scroll-reveal scroll-reveal-up"
        :class="revealClass(i)"
      >
        <Soft3DContactPod :item="item" :variant="contactVariants[i % contactVariants.length]"/>
      </div>
    </div>
  </Soft3DSubPage>
</template>

<script setup lang="ts">
import Soft3DSubPage from '../components/Soft3DSubPage.vue'
import Soft3DContactPod from '../components/Soft3DContactPod.vue'

const { t } = useI18n()

// —— 共享层站点信息（社交链接） ——
const { socialLinks } = useAppInfo()

// —— 配色轮换（纯装饰，索引取模，SSR 安全） ——
const contactVariants = ['violet', 'cyan', 'pink', 'sun'] as const

/** reveal 交错延迟类（滚动进入动画的全局类，确定性） */
function revealClass(index: number): string {
  const delays = ['', 'scroll-reveal-delay-1', 'scroll-reveal-delay-2']
  return delays[index % 3]!
}
</script>

<style scoped>
/* —— 联系舱网格（与首页同款自动填充） —— */
.contact-grid {
  display: grid;
  gap: var(--gap);
  margin-top: calc(var(--space) * 1.1);
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.reveal-wrap {
  min-width: 0;
}
</style>

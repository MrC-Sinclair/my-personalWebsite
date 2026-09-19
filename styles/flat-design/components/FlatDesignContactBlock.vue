<!--
  FlatDesignContactBlock - 扁平化风格「联系」内容块（首页与 /contact 共用）
  ------------------------------------------------------------
  首页联系色带里的那段：SectionHead + 社交信息色圈卡片网格。抽成独立
  组件后，首页与子页共用同一份内容与布局。level 控制 SectionHead 的
  标题层级：首页并列区块用 2，子页唯一区块用 1。

  数据来自共享层 useAppInfo 的 socialLinks（随 locale 变化）。
-->
<template>
  <section :id="id || undefined" class="band band--white" :data-section="id || undefined">
    <div class="band__inner">
      <FlatDesignSectionHead
        :title="t('contact.title')"
        :subtitle="t('contact.description')"
        bar-color="#7d3c98"
        :level="level"
      />
      <div class="social-grid">
        <FlatDesignSocialCard
          v-for="(social, i) in socialLinks"
          :key="social.name"
          :link="social"
          :tone-index="i"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import FlatDesignSectionHead from './FlatDesignSectionHead.vue'
import FlatDesignSocialCard from './FlatDesignSocialCard.vue'

const { level = 2, id = '' } = defineProps<{ level?: 1 | 2, id?: string }>()

const { t } = useI18n()
const { socialLinks } = useAppInfo()
</script>

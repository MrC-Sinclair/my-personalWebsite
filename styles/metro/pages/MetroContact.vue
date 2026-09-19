<!--
  MetroContact - Metro 风格「联系」子页
  ------------------------------------------------------------
  首页联系区块的内容（整行紫色引导 Tile + 社交链接 Tiles）已抽成
  MetroContactBlock，这里直接复用，子页与首页一致。
-->
<template>
  <MetroSubPage>
    <section class="block" aria-labelledby="contact-h1">
      <div class="wrap">
        <h1 id="contact-h1" class="page-h1">{{ t('contact.title') }}</h1>

        <MetroContactBlock />
      </div>
    </section>
  </MetroSubPage>
</template>

<script setup lang="ts">
import MetroContactBlock from '../components/MetroContactBlock.vue'
import MetroSubPage from '../components/MetroSubPage.vue'

const { t } = useI18n()
</script>

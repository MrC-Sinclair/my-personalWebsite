<!--
  TerminalAbout - terminal 风格的「关于」子页（/style/terminal/about）
  ------------------------------------------------------------
  子页模式：壳（导航 / 状态条 / 页脚 / 标题）由 TerminalSubPage 提供，
  本文件只负责主体区块。区块复用首页同款组件，不另写一套。

  与首页的关系：首页是「一台终端 + sr-only 降级区」的单页式展示，
  子页则是把同一个区块放到独立路由上——内容同源、结构同源，
  只是呈现容器不同。这是子页化后各风格统一遵循的模式。
-->
<template>
  <TerminalSubPage :title="t('nav.about')">
    <TerminalBlockAbout />
  </TerminalSubPage>
</template>

<script setup lang="ts">
import TerminalSubPage from '../components/TerminalSubPage.vue'
import TerminalBlockAbout from '../components/TerminalBlockAbout.vue'

const { t } = useI18n()
</script>

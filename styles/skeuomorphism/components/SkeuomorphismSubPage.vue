<!-- cspell:ignore Skeuomorphism skeuomorphism
  SkeuomorphismSubPage - 拟物风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「胡桃木桌面 + 木杆菜单条 + 内容区 +
  铁质铭牌页脚」，只有主体区块不同。抽成外壳后子页只写主体。

  与首页的差别：去掉 SkeuomorphismHeroPlate（皮革烫金名牌）。那是
  「桌上第一件实物」；子页已经用区块题签（黄铜徽章 + 雕刻大标题）
  标出自己是哪一摞东西，再摆一块名牌会把实物推出首屏、也抢走
  标题的层级。
  木桌材质、暖光、暗角、拼板缝全部保留——这些是「桌面」本身，
  不是首页专属装饰。

  用法：
    <SkeuomorphismSubPage>
      <section class="section" aria-labelledby="about-title">
        <SkeuomorphismSectionHead id="about-title" :level="1" … />
        …
      </section>
    </SkeuomorphismSubPage>

  这是 skeuomorphism 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div id="top" class="page">
    <SkeuomorphismSubNav />

    <main class="page-main">
      <div class="page-inner">
        <slot />
      </div>
    </main>

    <SkeuomorphismMetalFooter />
  </div>
</template>

<script setup lang="ts">
import SkeuomorphismSubNav from './SkeuomorphismSubNav.vue'
import SkeuomorphismMetalFooter from './SkeuomorphismMetalFooter.vue'

// 滚动进入动画（共享层 composable，observer 在其内部成对清理）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架：深色胡桃木桌面（与首页同源） —— */
.page {
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  /* 深色材质上的正文默认使用「象牙墨水」（即米白纸面颜料） */
  color: var(--c-surface);
  /* 木桌：左上暖光光源 + 右下暗角 + 横向拼板缝 + 竖向木纹 */
  background:
    radial-gradient(120% 90% at 8% 0%, rgb(255 214 150 / 0.1), transparent 52%),
    radial-gradient(140% 120% at 50% 110%, rgb(0 0 0 / 0.42), transparent 60%),
    repeating-linear-gradient(0deg, rgb(0 0 0 / 0.22) 0 2px, transparent 2px 168px),
    repeating-linear-gradient(
      90deg,
      rgb(0 0 0 / 0.11) 0 2px,
      transparent 2px 9px,
      rgb(0 0 0 / 0.05) 9px 13px,
      transparent 13px 24px
    ),
    repeating-linear-gradient(
      91deg,
      #33200f 0 34px,
      #3b2513 34px 47px,
      #301d0d 47px 74px,
      #3d2814 74px 88px
    ),
    linear-gradient(180deg, #33200f, #2b1a0f);
}

.page-main {
  display: flex;
  flex-direction: column;
  gap: clamp(56px, 9vh, 96px);
  padding-bottom: calc(var(--space) * 2);
}

.page-inner {
  display: grid;
  gap: clamp(56px, 9vh, 96px);
  width: min(100% - 2 * var(--space), var(--page-w));
  margin-inline: auto;
}
</style>

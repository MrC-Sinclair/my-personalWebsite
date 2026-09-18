<!--
  Soft3DSubPage - soft-3d 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「深空背景 + 漂浮胶囊导航 + 区块标题
  + 页脚」，只有主体区块不同。抽成外壳后子页只写主体，避免这层壳写 4 遍。

  标题由外壳统一渲染（Soft3DSectionHead），因此子页只需传文案与配色
  档位：每页一个主题，标题档位就是这一页的「物体配色」。

  用法：
    <Soft3DSubPage :eyebrow="t('nav.about')" :title="t('about.title')" variant="cyan">
      <Soft3DAboutBlock />
    </Soft3DSubPage>

  这是 soft-3d 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="p3d">
    <!-- 深空氛围背景（固定层，不参与交互） -->
    <Soft3DBackground/>
    <Soft3DSubNav/>

    <main class="p3d-main">
      <section class="sec scroll-reveal scroll-reveal-up">
        <Soft3DSectionHead
          :eyebrow="eyebrow"
          :title="title"
          :description="description"
          :variant="variant"
        />

        <slot/>
      </section>
    </main>

    <Soft3DSiteFooter/>
  </div>
</template>

<script setup lang="ts">
import Soft3DBackground from './Soft3DBackground.vue'
import Soft3DSubNav from './Soft3DSubNav.vue'
import Soft3DSectionHead from './Soft3DSectionHead.vue'
import Soft3DSiteFooter from './Soft3DSiteFooter.vue'

withDefaults(
  defineProps<{
    /** 眉题（栏目归属小字） */
    eyebrow: string
    /** 子页标题 */
    title: string
    /** 标题下的描述文案 */
    description?: string
    /** 标题小球配色（每页一个档位） */
    variant?: 'violet' | 'cyan' | 'pink' | 'mint' | 'sun'
  }>(),
  {
    description: '',
    variant: 'violet',
  },
)

// 滚动进入动画：共享层行为（观察 .scroll-reveal 元素）
useScrollReveal()
</script>

<style scoped>
/* —— 页面骨架（与首页同源） —— */
.p3d {
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.p3d-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: calc(var(--space) * 2);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: 0 var(--gap) calc(var(--space) * 1.2);
}

.sec {
  padding-top: calc(var(--space) * 0.6);
  scroll-margin-top: 6.5rem;
}

/* 键盘可见焦点（风格内统一焦点环） */
.p3d :focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 3px;
  border-radius: 6px;
}

@media (max-width: 640px) {
  .p3d-main {
    padding: 0 14px calc(var(--space));
  }

  .sec {
    scroll-margin-top: 7rem;
  }
}
</style>

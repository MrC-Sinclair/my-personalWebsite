<!--
  EditorialSubPage - editorial 风格子页的统一外壳
  ------------------------------------------------------------
  子页化后每风格 4 个子页，共享「刊头导航 + 对开页幅面 + 版权栏」，
  只有主体区块不同。抽成外壳后子页只写主体，避免这层壳写 4 遍。

  与首页的差别：首页第一屏是 EditorialCover（巨大衬线刊名 + 本期
  目录条）——那是「创刊号」的封面；子页已经知道自己是哪一栏，
  再放封面等于重复报头，因此去掉，直接从幅面正文开始。

  用法：
    <EditorialSubPage>
      <EditorialProfile />
    </EditorialSubPage>

  这是 editorial 风格**内部**的复用，不违反「UI 不跨风格复用」红线。
-->
<template>
  <div class="sheet">
    <EditorialSubNav/>

    <main class="sheet-body">
      <div class="flow">
        <slot/>
      </div>
    </main>

    <EditorialColophon/>
  </div>
</template>

<script setup lang="ts">
import EditorialSubNav from './EditorialSubNav.vue'
import EditorialColophon from './EditorialColophon.vue'
</script>

<style scoped>
/* —— 纸面：整页米白纸底 + 油墨正文（与首页同源） —— */
.sheet {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  color: var(--c-text);
  background: var(--c-bg);
}

.sheet-body {
  flex: 1 0 auto;
}

/* —— 对开页幅面：区块间的版式节奏（与首页同宽同呼吸） —— */
.flow {
  display: grid;
  gap: clamp(56px, 9vw, 108px);
  max-width: var(--page-w);
  margin: 0 auto;
  padding: clamp(40px, 7vw, 84px) var(--space) calc(var(--space) * 2);
}
</style>

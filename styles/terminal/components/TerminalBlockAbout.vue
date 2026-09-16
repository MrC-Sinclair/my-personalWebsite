<!--
  TerminalBlockAbout - terminal 风格「关于我」区块
  ------------------------------------------------------------
  纯文本流的自我介绍：姓名（磷光辉光）+ 职业一句话 + 简介 +
  经历时间线（│ 竖线 + ├─ 树形前缀，纯 CSS 伪元素绘制，读屏
  不朗读装饰符）。数据来自共享层 useAppInfo（timeline 为 i18n
  响应式 computed，切换语言自动更新）。
  同一组件同时服务于命令输出区与页尾隐藏降级区。
-->
<template>
  <div class="blk">
    <p class="name">{{ t('home.greeting') }} {{ t('home.name') }}</p>
    <p class="tag">{{ t('home.tagline') }}</p>
    <p class="dim">{{ t('about.description') }}</p>

    <p class="head">{{ t('about.experience') }}</p>
    <ol class="tl">
      <li v-for="item in timeline" :key="`${item.period}-${item.title}`" class="tl-item">
        <p class="tl-line">
          <span class="tl-period">{{ item.period }}</span>
          <span class="tl-title">{{ item.title }}</span>
          <span class="tl-org">@ {{ item.organization }}</span>
        </p>
        <p class="tl-desc">{{ item.description }}</p>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
// —— 共享层数据（同步 computed，随 i18n 自动更新） ——
const { timeline } = useAppInfo()
</script>

<style scoped>
.blk {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
}

/* 姓名：磷光绿 + 辉光（风格签名装饰） */
.name {
  margin: 0;
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--c-accent);
  text-shadow: 0 0 10px color-mix(in srgb, var(--c-accent) 45%, transparent);
  overflow-wrap: anywhere;
}

.tag {
  margin: 0;
  color: var(--c-accent-2);
  overflow-wrap: anywhere;
}

.dim {
  margin: 0;
  max-width: 68ch;
  color: var(--c-muted);
  overflow-wrap: anywhere;
}

/* 区块内二级标题：琥珀色 + 左侧竖条 */
.head {
  margin: 10px 0 0;
  color: var(--c-accent-2);
  overflow-wrap: anywhere;
}

.head::before {
  content: '├─ ';
  color: var(--c-border);
}

/* 时间线：│ + ├─ 树形文本流 */
.tl {
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: var(--border-w) solid var(--c-border);
}

.tl-item {
  position: relative;
  padding: 6px 0 6px var(--space);
}

/* 每条的 ├─ 分叉符（伪元素装饰，读屏不朗读） */
.tl-item::before {
  content: '├─';
  position: absolute;
  left: 0;
  top: 6px;
  color: var(--c-border);
}

.tl-item:hover::before {
  color: var(--c-text);
}

.tl-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin: 0;
}

.tl-period {
  color: var(--c-accent-2);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.tl-title {
  color: var(--c-text);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.tl-org {
  color: var(--c-muted);
  overflow-wrap: anywhere;
}

.tl-desc {
  margin: 2px 0 0;
  font-size: var(--fs-small);
  color: var(--c-muted);
  overflow-wrap: anywhere;
}
</style>

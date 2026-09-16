<!--
  TerminalBlockTheme - terminal 风格「风格画廊」区块（theme 命令输出）
  ------------------------------------------------------------
  theme 命令输出：说明行 + 从共享注册表 styles/registry.ts 只读
  读取的全部风格清单（中文名/英文名随 locale 展示，tier 文案走
  已有的 styles.gallery.tier1/2/3 key）+ 进入画廊的站内链接。
  注册表是共享元信息模块，此处只读不改。
  同一组件同时服务于命令输出区与页尾隐藏降级区。
-->
<template>
  <div class="blk">
    <p class="hint">{{ copy.themeHint }}</p>

    <ul class="list">
      <li v-for="meta in styleRegistry" :key="meta.id" class="row">
        <span class="name">{{ displayName(meta) }}</span>
        <span class="tier">{{ t(`styles.gallery.tier${meta.tier}`) }}</span>
        <span class="status">{{ statusText(meta.status) }}</span>
      </li>
    </ul>

    <p class="go">
      <NuxtLink class="go-link" :to="localePath('/styles')">
        <span class="go-glyph" aria-hidden="true">-&gt;&nbsp;</span>
        {{ t('styles.gallery.title') }}
        <span aria-hidden="true">&nbsp;↗</span>
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { styleRegistry, type StyleMeta } from '~/styles/registry'
import { pickTerminalCopy } from '../copy'

const { t, locale } = useI18n()
const localePath = useLocalePath()
/** 终端风味文案（随语言响应式切换；字典本身为纯 TS 模块） */
const copy = computed(() => pickTerminalCopy(locale.value))

/** 风格名按当前语言展示（注册表元信息为静态数据） */
function displayName(meta: StyleMeta): string {
  return locale.value.startsWith('zh') ? meta.name : meta.en
}

/** 完成度文案：statusReady/statusPartial/statusPlanned 均为已有 key */
function statusText(status: StyleMeta['status']): string {
  if (status === 'ready') return t('styles.gallery.statusReady')
  if (status === 'partial') return t('styles.gallery.statusPartial')
  return t('styles.gallery.statusPlanned')
}
</script>

<style scoped>
.blk {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.hint {
  margin: 0;
  max-width: 68ch;
  color: var(--c-muted);
  overflow-wrap: anywhere;
}

.list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 清单行：风格名 + 档位 + 完成度，hover 提亮 */
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 14px;
  min-height: 36px;
  padding: 4px 0;
}

.row::before {
  content: '│';
  color: var(--c-border);
}

.row:hover .name {
  color: var(--c-accent);
  text-shadow: 0 0 8px color-mix(in srgb, var(--c-accent) 45%, transparent);
}

.name {
  min-width: 9em;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

.tier {
  font-size: var(--fs-small);
  color: var(--c-accent-2);
}

.status {
  font-size: var(--fs-small);
  color: var(--c-muted);
}

/* 进入画廊：站内链接，hover 琥珀反色 */
.go {
  margin: 4px 0 0;
}

.go-link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 4px 8px;
  color: var(--c-accent);
  text-decoration: none;
  border: var(--border-w) solid transparent;
  overflow-wrap: anywhere;
}

.go-glyph {
  color: var(--c-muted);
}

.go-link:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.go-link:hover .go-glyph {
  color: var(--c-on-accent);
}

.go-link:active {
  transform: var(--press-transform);
}

.go-link:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
</style>

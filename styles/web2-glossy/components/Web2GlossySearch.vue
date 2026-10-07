<!--
  Web2GlossySearch - web2-glossy 风格的关键词搜索框
  ------------------------------------------------------------
  形态与 Web2GlossyTagFilter 同一套语言：胶囊——全圆角 + 上半高光的
  蓝白渐变 + 柔和投影，hover 上浮 2px；清除键是被点亮的糖果蓝按钮
  （蓝色渐变 + 白字 + 顶部内高光）。

  数据流向：页面持有共享层 useBlogSearch → 本组件只收 props 发事件，
  不自己取数、不碰 URL。匹配行为全在 utils/search.ts。
-->
<template>
  <div class="search">
    <div class="field">
      <input
        :value="query"
        type="search"
        class="input"
        :placeholder="t('blog.search')"
        :aria-label="t('blog.search')"
        autocomplete="off"
        @input="emit('update', ($event.target as HTMLInputElement).value)"
      >
      <button v-if="query" type="button" class="clear" @click="emit('clear')">
        {{ t('blog.clearSearch') }}
      </button>
    </div>

    <p v-if="query" class="count" role="status">
      {{ resultCount }} / {{ total }} {{ t('blog.postsUnit') }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 输入框当前值（受控：来自共享层 useBlogSearch） */
  query: string
  /** 命中数量 */
  resultCount: number
  /** 未搜索时的文章总数 */
  total: number
}>()

const emit = defineEmits<{
  /** 输入关键词 */
  update: [value: string]
  /** 清除搜索 */
  clear: []
}>()

const { t } = useI18n()
</script>

<style scoped>
.search {
  margin-bottom: var(--gap);
}

.field {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* —— 胶囊输入框：全圆角 + 上半高光渐变 + 柔和投影 —— */
.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 44px;
  padding: 11px 20px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--c-text);
  background: linear-gradient(180deg, #ffffff 0%, #f2f7fd 48%, #dce9f8 100%);
  border: var(--border-w) solid rgb(30 111 217 / 0.35);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition),
    color var(--transition),
    border-color var(--transition);
}

.input::placeholder {
  font-weight: 400;
  color: var(--c-muted);
}

.input:hover {
  color: var(--c-accent);
  border-color: var(--c-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgb(23 74 128 / 0.2), 0 18px 34px rgb(23 74 128 / 0.18);
}

.input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 清除：点亮的糖果蓝按钮 —— */
.clear {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 11px 18px;
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(180deg, #5aa3f0 0%, var(--c-accent) 52%, #14508f 100%);
  border: var(--border-w) solid var(--c-accent);
  border-radius: var(--radius-sm);
  box-shadow:
    var(--shadow),
    inset 0 1px 0 rgb(255 255 255 / 0.6);
  cursor: pointer;
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.clear:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgb(23 74 128 / 0.2), 0 18px 34px rgb(23 74 128 / 0.18);
}

.clear:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.clear:active {
  transform: var(--press-transform);
}

/* —— 计数：等宽小字 —— */
.count {
  margin: 8px 0 0;
  font-family: var(--font-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--c-muted);
}

@media (prefers-reduced-motion: reduce) {
  .input,
  .clear {
    transition: none;
  }

  .input:hover,
  .clear:hover,
  .clear:active {
    transform: none;
  }
}
</style>

<!--
  MetroClockTile - 实时时钟 Tile
  ------------------------------------------------------------
  「UI 是一张可以实时变化的信息版面」的签名件：每秒刷新的本地时钟。
  SSR/SSG 首帧渲染占位符（--:--），挂载后才开始走表——服务端与客户端
  首帧一致，无水合风险；定时器在 onUnmounted 中成对清理。
  日期文案复用共享层 formatDate（按本地时区拼装年月日）。
-->
<template>
  <MetroTile variant="teal">
    <span class="clock__date">{{ dateText }}</span>
    <p class="clock__time">
      {{ timeText }}<span class="clock__sec">{{ secondsText }}</span>
    </p>
  </MetroTile>
</template>

<script setup lang="ts">
import MetroTile from './MetroTile.vue'

const { locale } = useI18n()

/** 当前时间；null 表示尚未挂载（渲染占位符） */
const now = ref<Date | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

/** 两位数补零 */
function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** 本地日期文本（复用共享层 formatDate） */
const dateText = computed(() => {
  const d = now.value
  if (!d) return ''
  return formatDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, locale.value)
})

/** 时:分（未挂载时渲染占位符） */
const timeText = computed(() => {
  const d = now.value
  return d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : '--:--'
})

/** 秒（未挂载时不渲染） */
const secondsText = computed(() => {
  const d = now.value
  return d ? pad(d.getSeconds()) : ''
})

onMounted(() => {
  now.value = new Date()
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.clock__date {
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
}

.clock__time {
  display: flex;
  align-items: baseline;
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(34px, 4vw, 46px);
  font-weight: 300;
  line-height: 1;
  /* 等宽数字：走表时数字不抖动 */
  font-variant-numeric: tabular-nums;
}

.clock__sec {
  margin-left: 4px;
  font-size: var(--fs-base);
}
</style>

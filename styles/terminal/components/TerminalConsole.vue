<!--
  TerminalConsole - terminal 风格终端主体（命令行交互核心）
  ------------------------------------------------------------
  整页终端的交互核心：输出区（role="log" + aria-live="polite"，
  打字进行中的行以 aria-hidden 排除出读屏，避免逐字播报）+
  命令输入行（Enter 执行 / ↑↓ 翻命令历史）。

  · 命令解析与输出是本风格的表现层交互（tier 3 允许），
    但所有内容数据仍来自共享层：works/blog 经 props 透传
    useProjects / useBlog 的取数结果，其余走 t() / useAppInfo。
  · 打字机输出：定时器全部经 later() 登记，onUnmounted 一次性
    清空；键盘监听在 onMounted 挂接、onUnmounted 成对移除
    （架构红线：资源成对清理）。
  · prefers-reduced-motion：打字机降级为直接整行输出。
  · 无障碍降级：即使不用命令输入，页面顶部的跳转链接 + 页尾
    隐藏降级区（sr-only 区块锚点）也能访问全部内容。
-->
<template>
  <div class="console" @click="focusInput">
    <!-- 输出区：命令回显 / 文本行 / 可点击命令 / 内容区块 -->
    <div ref="bodyEl" class="body" role="log" aria-live="polite" :aria-label="copy.outputLabel">
      <template v-for="entry in entries" :key="entry.id">
        <p v-if="entry.kind === 'banner'" class="banner" aria-hidden="true">{{ entry.text }}</p>

        <p v-else-if="entry.kind === 'echo'" class="line line--echo">
          <span class="prompt" aria-hidden="true">{{ promptText }}</span>
          <span class="echo-text">{{ entry.text }}</span>
        </p>

        <button
          v-else-if="entry.kind === 'run'"
          type="button"
          class="run"
          @click.stop="entry.cmd && exec(entry.cmd)"
        >
          <span class="run-cmd">{{ entry.cmd }}</span>
          <span class="run-desc">{{ entry.text }}</span>
        </button>

        <p
          v-else-if="entry.kind === 'line'"
          class="line"
          :class="toneClass(entry.tone)"
        >{{ entry.text }}</p>

        <component
          :is="BLOCKS[entry.block]"
          v-else-if="entry.kind === 'block'"
          class="blk-host"
          :posts="entry.block === 'blog' ? blockPosts : undefined"
          :projects="entry.block === 'works' ? blockProjects : undefined"
        />
      </template>

      <!-- 打字进行中的行：aria-hidden 避免逐字播报，完成后整行进入上方日志 -->
      <p v-if="typing" class="line" :class="toneClass(typing.entry.tone)" aria-hidden="true">
        {{ typing.entry.text.slice(0, typing.shown) }}<span class="cursor" aria-hidden="true">█</span>
      </p>
      <p v-else class="line line--idle" aria-hidden="true"><span class="cursor">█</span></p>
    </div>

    <!-- 命令输入行 -->
    <div class="input-row">
      <label class="sr-only" for="terminal-input">{{ copy.inputLabel }}</label>
      <span class="prompt prompt-static" aria-hidden="true">{{ promptText }}</span>
      <input
        id="terminal-input"
        ref="inputEl"
        v-model="inputValue"
        class="input"
        type="text"
        :aria-label="copy.inputLabel"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        :placeholder="copy.inputPlaceholder"
        @click.stop
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'
import TerminalBlockAbout from './TerminalBlockAbout.vue'
import TerminalBlockBlog from './TerminalBlockBlog.vue'
import TerminalBlockContact from './TerminalBlockContact.vue'
import TerminalBlockSkills from './TerminalBlockSkills.vue'
import TerminalBlockTheme from './TerminalBlockTheme.vue'
import TerminalBlockWorks from './TerminalBlockWorks.vue'
import { pickTerminalCopy } from '../copy'

const props = defineProps<{
  /** 最新文章（来自共享层 useBlog，页面经 useAsyncData 传入） */
  posts: BlogPost[]
  /** 精选项目（来自共享层 useProjects，页面经 useAsyncData 传入） */
  projects: Project[]
}>()

const { t, locale } = useI18n()
/** 终端风味文案（随语言响应式切换；字典本身为纯 TS 模块） */
const copy = computed(() => pickTerminalCopy(locale.value))

/* ============ 输出条目模型 ============ */

/** 文本行色调 */
type Tone = 'out' | 'dim' | 'head' | 'err'

/** 内容区块名 → 组件映射（styles 下组件一律显式 import，不走自动导入） */
const BLOCKS = {
  about: TerminalBlockAbout,
  skills: TerminalBlockSkills,
  works: TerminalBlockWorks,
  blog: TerminalBlockBlog,
  contact: TerminalBlockContact,
  theme: TerminalBlockTheme,
} as const

type BlockName = keyof typeof BLOCKS

interface BaseEntry {
  id: number
}

/** 命令回显（带 Prompt，瞬时输出） */
interface EchoEntry extends BaseEntry {
  kind: 'echo'
  text: string
}

/** ASCII 开机横幅（多行预格式文本，瞬时输出） */
interface BannerEntry extends BaseEntry {
  kind: 'banner'
  text: string
}

/** 普通文本行（参与打字机） */
interface LineEntry extends BaseEntry {
  kind: 'line'
  tone: Tone
  text: string
}

/** help 里的可点击命令项 */
interface RunEntry extends BaseEntry {
  kind: 'run'
  cmd: string
  text: string
}

/** 内容区块（组件渲染，瞬时输出） */
interface BlockEntry extends BaseEntry {
  kind: 'block'
  block: BlockName
}

type Entry = EchoEntry | BannerEntry | LineEntry | RunEntry | BlockEntry

const entries = ref<Entry[]>([])
const queue: Entry[] = []
const typing = ref<{ entry: LineEntry; shown: number } | null>(null)

let idSeed = 0
function nextId(): number {
  idSeed += 1
  return idSeed
}

/* ============ 定时器登记表（onUnmounted 一次性清空，红线） ============ */

const timers = new Set<ReturnType<typeof setTimeout>>()

function later(fn: () => void, ms: number): void {
  const id = setTimeout(() => {
    timers.delete(id)
    fn()
  }, ms)
  timers.add(id)
}

/* ============ 打字机驱动 ============ */

/** 打字速度：每 16ms 出 2 字符，行间停顿 60ms */
const TYPE_MS = 16
const CHARS_PER_TICK = 2
const LINE_GAP_MS = 60
const STAGGER_MS = 24

/** prefers-reduced-motion：跳过打字机，直接整行输出（onMounted 内检测） */
const reduced = ref(false)

const bodyEl = ref<HTMLElement | null>(null)

/** 输出区滚动到底部（仅客户端） */
function scrollToBottom(): void {
  if (!import.meta.client) return
  const el = bodyEl.value
  if (el) el.scrollTop = el.scrollHeight
}

/** 条目落地渲染 */
function commit(entry: Entry): void {
  entries.value.push(entry)
  scrollToBottom()
}

/** 取下一条：文本行走打字机，其余先落地再续排 */
function pump(): void {
  if (typing.value) return
  const next = queue.shift()
  if (!next) return
  if (next.kind === 'line' && !reduced.value) {
    typing.value = { entry: next, shown: 0 }
    later(tick, TYPE_MS)
  } else {
    commit(next)
    later(pump, STAGGER_MS)
  }
}

/** 打字机步进：追加字符，满行后落地并续排下一条 */
function tick(): void {
  const cur = typing.value
  if (!cur) return
  cur.shown = Math.min(cur.entry.text.length, cur.shown + CHARS_PER_TICK)
  scrollToBottom()
  if (cur.shown >= cur.entry.text.length) {
    commit(cur.entry)
    typing.value = null
    later(pump, LINE_GAP_MS)
  } else {
    later(tick, TYPE_MS)
  }
}

/** 入队 + 启动驱动 */
function enqueue(...items: Entry[]): void {
  queue.push(...items)
}

function line(tone: Tone, text: string): LineEntry {
  return { id: nextId(), kind: 'line', tone, text }
}

function block(name: BlockName): BlockEntry {
  return { id: nextId(), kind: 'block', block: name }
}

/* ============ 命令表：内容全部来自 t() / 共享层 props ============ */

/** help 里展示并可直接点击的命令清单 */
const COMMAND_LIST = [
  'help',
  'about',
  'skills',
  'works',
  'blog',
  'contact',
  'whoami',
  'theme',
  'clear',
] as const

const COMMANDS: Record<string, (arg: string) => void> = {
  help: () => {
    enqueue(line('head', copy.value.helpTitle))
    COMMAND_LIST.forEach((name) => {
      enqueue({ id: nextId(), kind: 'run', cmd: name, text: copy.value.cmdDesc[name] ?? '' })
    })
    enqueue(line('dim', copy.value.helpFooter))
  },
  about: () => {
    enqueue(line('head', t('about.title')), block('about'))
  },
  skills: () => {
    enqueue(line('head', t('about.skills')), block('skills'))
  },
  works: () => {
    enqueue(line('head', t('home.featuredProjects')), block('works'))
    enqueue(line('dim', copy.value.worksHint))
  },
  blog: () => {
    enqueue(line('head', t('home.latestPosts')), block('blog'))
    enqueue(line('dim', copy.value.blogHint))
  },
  contact: () => {
    enqueue(line('head', t('contact.title')), block('contact'))
  },
  whoami: () => {
    enqueue(
      line('head', `${t('home.greeting')} ${t('home.name')}`),
      line('out', t('home.tagline')),
      line('dim', t('home.description')),
    )
  },
  theme: () => {
    enqueue(line('head', t('styles.gallery.title')), block('theme'))
  },
  clear: () => {
    entries.value = []
    queue.length = 0
    typing.value = null
  },
}

/** 执行一条命令：回显 → 记历史 → 解析分发 → 驱动输出 */
function exec(raw: string): void {
  const text = raw.trim().replace(/\s+/g, ' ')
  commit({ id: nextId(), kind: 'echo', text })
  if (!text) return

  cmdHistory.push(text)
  histIdx = cmdHistory.length

  const sp = text.indexOf(' ')
  const name = (sp < 0 ? text : text.slice(0, sp)).toLowerCase()
  const arg = sp < 0 ? '' : text.slice(sp + 1).trim()

  const handler = COMMANDS[name]
  if (handler) {
    handler(arg)
  } else {
    enqueue(line('err', `${name}${copy.value.cmdNotFound}`))
  }
  pump()
}

/* ============ 命令历史（↑↓） ============ */

/** 命令历史（↑↓ 翻阅；避免与 window.history 同名遮蔽） */
const cmdHistory: string[] = []
let histIdx = 0

const inputEl = ref<HTMLInputElement | null>(null)
const inputValue = ref('')

/** 键盘处理函数引用（onUnmounted 成对移除，红线） */
let keydownHandler: ((event: KeyboardEvent) => void) | null = null

/* ============ 展示推导 ============ */

/** Prompt：访客@主机名:~$（主机名由站点名派生，随语言/内容更新） */
const promptText = computed(() => `guest@${t('home.name')}:~$`.toLowerCase())

/** tone → 行样式类 */
function toneClass(tone: Tone): string {
  return `line--${tone}`
}

/** 区块组件的异步数据（works/blog 分别取用，避免向其余区块透传多余属性） */
const blockPosts = computed(() => (Array.isArray(props.posts) ? props.posts : []))
const blockProjects = computed(() => (Array.isArray(props.projects) ? props.projects : []))

/** 开机横幅：程序化拼装的等宽框线（ASCII 限定，保证对齐且确定性） */
const bannerText = computed(() => {
  const title = ` TERMINAL-OS · ${t('home.name')} `.toLowerCase()
  const width = Math.max(title.length + 2, 30)
  const bar = '═'.repeat(width)
  return `╔${bar}╗\n║${title.padEnd(width)}║\n╚${bar}╝`
})

/* ============ 交互辅助 ============ */

/** 点击终端任意空白处聚焦输入框（终端惯例） */
function focusInput(): void {
  if (!import.meta.client) return
  inputEl.value?.focus({ preventScroll: true })
}

/* ============ 生命周期：开机与成对清理 ============ */

onMounted(() => {
  // 动效偏好检测（仅客户端）
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 键盘监听：Enter 执行 / ↑↓ 翻历史（挂接在输入框上）
  const input = inputEl.value
  if (input) {
    keydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const value = inputValue.value
        inputValue.value = ''
        exec(value)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (histIdx > 0) {
          histIdx -= 1
          inputValue.value = cmdHistory[histIdx] ?? ''
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (histIdx < cmdHistory.length - 1) {
          histIdx += 1
          inputValue.value = cmdHistory[histIdx] ?? ''
        } else {
          histIdx = cmdHistory.length
          inputValue.value = ''
        }
      }
    }
    input.addEventListener('keydown', keydownHandler)
  }

  // 开机：横幅瞬时输出，问候语走打字机（reduced-motion 下直接整行）
  commit({ id: nextId(), kind: 'banner', text: bannerText.value })
  enqueue(
    line('out', t('home.tagline')),
    line('dim', copy.value.welcomeGuide),
    line('dim', copy.value.welcomeFallback),
  )
  pump()
})

onUnmounted(() => {
  // 红线：定时器与键盘监听必须全部清理，防止路由切换后继续写 DOM
  timers.forEach((id) => clearTimeout(id))
  timers.clear()
  if (inputEl.value && keydownHandler) {
    inputEl.value.removeEventListener('keydown', keydownHandler)
  }
  keydownHandler = null
})
</script>

<style scoped>
.console {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  cursor: text;
}

/* —— 输出区：滚动日志流 —— */
.body {
  flex: 1 1 auto;
  min-height: 300px;
  overflow-y: auto;
  padding: var(--space);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--c-border) transparent;
}

.body::-webkit-scrollbar {
  width: 8px;
}

.body::-webkit-scrollbar-thumb {
  background: var(--c-border);
}

/* —— 开机横幅：预格式框线，磷光辉光 —— */
.banner {
  margin: 0 0 var(--gap);
  font-size: var(--fs-small);
  line-height: 1.45;
  white-space: pre;
  color: var(--c-accent);
  text-shadow: 0 0 10px color-mix(in srgb, var(--c-accent) 40%, transparent);
  overflow-x: auto;
}

/* —— 文本行 —— */
.line {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 1.7em;
}

.line--out {
  color: var(--c-text);
}

.line--dim {
  color: var(--c-muted);
}

.line--head {
  margin-top: 8px;
  font-weight: 700;
  color: var(--c-accent-2);
}

.line--head::before {
  content: '── ';
  color: var(--c-border);
}

.line--err {
  color: #ff6b6b;
  text-shadow: 0 0 8px color-mix(in srgb, #ff6b6b 40%, transparent);
}

/* 命令回显：琥珀 Prompt + 薄荷命令文本 */
.line--echo {
  margin-top: 6px;
}

.line--echo .prompt {
  margin-right: 8px;
  color: var(--c-accent-2);
}

.echo-text {
  color: var(--c-accent);
}

/* —— help 里的可点击命令项 —— */
.run {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 14px;
  width: 100%;
  min-height: 40px;
  padding: 2px 6px;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  text-align: left;
  background: transparent;
  border: var(--border-w) solid transparent;
  cursor: pointer;
}

.run-cmd {
  min-width: 8em;
  color: var(--c-accent);
}

.run-cmd::before {
  content: '$ ';
  color: var(--c-border);
}

.run-desc {
  color: var(--c-muted);
}

.run:hover {
  color: var(--c-on-accent);
  background: var(--c-accent);
  border-color: var(--c-accent);
}

.run:hover .run-cmd,
.run:hover .run-cmd::before,
.run:hover .run-desc {
  color: var(--c-on-accent);
}

.run:active {
  transform: var(--press-transform);
}

.run:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* —— 块级内容的宿主间距 —— */
.blk-host {
  display: block;
}

/* —— 闪烁块状光标（风格签名；reduced-motion 下静止常亮） —— */
.cursor {
  margin-left: 1px;
  color: var(--c-text);
  animation: term-blink 1.1s steps(1) infinite;
}

.line--idle {
  color: var(--c-text);
}

@keyframes term-blink {
  50% {
    opacity: 0;
  }
}

/* —— 输入行 —— */
.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px var(--space);
  background: var(--c-surface);
  border-top: var(--border-w) solid var(--c-border);
  transition: background var(--transition);
}

/* 聚焦反馈：输入行底色轻微提亮 */
.input-row:focus-within {
  background: color-mix(in srgb, var(--c-text) 7%, var(--c-surface));
}

.prompt-static {
  flex: none;
  font-size: var(--fs-small);
  color: var(--c-accent-2);
  white-space: nowrap;
}

.input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 40px;
  font-family: var(--font-body);
  font-size: var(--fs-base);
  color: var(--c-text);
  background: transparent;
  border: none;
  outline: none;
  caret-color: var(--c-text);
}

.input::placeholder {
  color: var(--c-muted);
  opacity: 0.7;
}

/* 窄屏：输入字号提到 16px 避免 iOS 聚焦自动放大；Prompt 缩短 */
@media (max-width: 479px) {
  .input {
    font-size: 16px;
  }

  .prompt-static {
    font-size: var(--fs-base);
    max-width: 9em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* —— 屏幕阅读器专用 —— */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* —— 动效降级：光标静止常亮（不靠 opacity:0 隐藏） —— */
@media (prefers-reduced-motion: reduce) {
  .cursor {
    animation: none;
  }

  .input-row {
    transition: none;
  }
}
</style>

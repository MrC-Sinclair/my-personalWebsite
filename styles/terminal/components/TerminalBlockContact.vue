<!--
  TerminalBlockContact - terminal 风格「联系方式」区块
  ------------------------------------------------------------
  联系方式是「通讯录」式键值清单：平台名（琥珀键）+ 值。GitHub 为
  外链；微信号提供 [复制] 按钮（复制动作与「已复制」反馈收敛到
  共享层 useClipboardCopy，客户端守卫、失败静默兜底与反馈定时器
  的成对清理均在其内部完成）；仅有
  二维码的平台不贴图（终端是纯文本流），改为指向过渡层联系页的
  链接（localePath 包裹）。不复用过渡层 ContactForm 组件。
  数据来自共享层 useAppInfo（socialLinks 随 i18n 自动更新）。
  同一组件同时服务于命令输出区与页尾隐藏降级区。
-->
<template>
  <div class="blk">
    <p class="dim">{{ t('contact.description') }}</p>

    <dl class="list">
      <div v-for="item in safeSocials" :key="item.name" class="row">
        <dt class="key">{{ item.name }}</dt>
        <dd class="val">
          <!-- 有外链的平台：直接给出地址 -->
          <a
            v-if="item.url"
            class="link"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ urlText(item.url) }}<span aria-hidden="true">&nbsp;↗</span>
          </a>

          <!-- 微信号：号码 + 复制按钮 -->
          <template v-else-if="item.value">
            <span class="mono">{{ item.value }}</span>
            <button type="button" class="copy" @click="copyValue(item)">
              <span class="copy-bracket" aria-hidden="true">[&nbsp;</span>
              {{ copied === item.value ? t('contact.copied') : t('contact.copyWechatId') }}
              <span class="copy-bracket" aria-hidden="true">&nbsp;]</span>
            </button>
          </template>

          <!-- 仅有二维码的平台：链到过渡层联系页查看 -->
          <NuxtLink v-else-if="item.qrCode" class="link" :to="localePath('/style/terminal/contact')">
            {{ t('contact.qrTip') }}<span aria-hidden="true">&nbsp;↗</span>
          </NuxtLink>
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import type { SocialLinkItem } from '~/types/site'

const { t } = useI18n()
const localePath = useLocalePath()

// —— 共享层数据（同步 computed，随 i18n 自动更新） ——
const { socialLinks } = useAppInfo()

/** 防御：数组字段用 Array.isArray 检查 */
const safeSocials = computed<SocialLinkItem[]>(() => {
  const list = socialLinks.value
  return Array.isArray(list) ? list : []
})

// —— 复制动作收敛到共享层 useClipboardCopy ——
// copied 为最近一次成功复制的文本（2 秒自动清空），模板用
// copied === item.value 判断哪个条目处于「已复制」反馈态；
// 定时器清理已在 composable 内部完成，无需本地 onUnmounted。
const { copied, copy } = useClipboardCopy()

/** 复制号码到剪贴板（客户端守卫与失败静默降级由共享层处理） */
function copyValue(item: SocialLinkItem): void {
  if (item.value) void copy(item.value)
}

/** 外链展示文本：去掉协议头（纯展示转换） */
function urlText(url: string): string {
  return url.replace(/^https?:\/\//, '')
}
</script>

<style scoped>
.blk {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.dim {
  margin: 0;
  max-width: 68ch;
  color: var(--c-muted);
  overflow-wrap: break-word;
}

.list {
  display: flex;
  flex-direction: column;
  margin: 0;
}

/* 键值行：平台名 + 值，hover 整行提亮 */
.row {
  display: grid;
  grid-template-columns: minmax(72px, auto) 1fr;
  align-items: center;
  gap: 4px 12px;
  min-height: 40px;
  padding: 4px 0;
}

.row:hover .key {
  color: var(--c-accent);
}

.key {
  margin: 0;
  color: var(--c-accent-2);
  overflow-wrap: break-word;
}

.key::before {
  content: '>';
  margin-right: 6px;
  color: var(--c-border);
}

.val {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  margin: 0;
  min-width: 0;
  color: var(--c-text);
  overflow-wrap: anywhere;
}

/* 外链：薄荷绿 + hover 辉光下划线；≥40px 触控目标 */
.link {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  color: var(--c-accent);
  text-decoration: none;
  overflow-wrap: anywhere;
}

.link:hover {
  text-decoration: underline;
  text-shadow: 0 0 8px color-mix(in srgb, var(--c-accent) 45%, transparent);
}

.link:active {
  transform: var(--press-transform);
}

.link:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.mono {
  font-variant-numeric: tabular-nums;
}

/* 复制按钮：≥40px 触控目标，hover 琥珀反色（瞬时） */
.copy {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 6px 10px;
  font-family: var(--font-body);
  font-size: var(--fs-small);
  color: var(--c-text);
  background: transparent;
  border: var(--border-w) solid var(--c-border);
  cursor: pointer;
}

.copy-bracket {
  color: var(--c-muted);
}

.copy:hover {
  color: var(--c-on-accent);
  background: var(--c-accent-2);
  border-color: var(--c-accent-2);
}

.copy:hover .copy-bracket {
  color: var(--c-on-accent);
}

.copy:active {
  transform: var(--press-transform);
}

.copy:focus-visible {
  outline: 2px solid var(--c-accent-2);
  outline-offset: 2px;
}
</style>

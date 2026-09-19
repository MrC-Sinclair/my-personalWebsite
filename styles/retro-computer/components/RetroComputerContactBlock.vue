<!--
  RetroComputerContactBlock - 复古电脑风格「联系」窗口的内容
  ------------------------------------------------------------
  原先这段（说明 + 社交信息行）写在 RetroComputerIndex 的模板里，
  子页化后首页与 /contact 需要同一份内容，抽出来单一来源。

  桌面隐喻：这是「通讯录」窗口里的记录行——有外链的整行可点
  （悬停深蓝反白），没有外链的（微信号）退化成纯展示行。
  不复用过渡层 ContactForm：本风格不提交表单，只陈列信息。
-->
<template>
  <div class="rc-contact">
    <p class="rc-contact__intro">{{ t('contact.description') }}</p>

    <h3 class="rc-sub">{{ t('contact.socialLinks') }}</h3>
    <ul class="rc-contact__list">
      <li v-for="link in safeSocialLinks" :key="link.name">
        <a
          v-if="link.url"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="rc-contact__row rc-contact__row--link"
        >
          <RetroComputerPixelIcon variant="floppy" />
          <span class="rc-contact__name">{{ link.name }}</span>
          <span class="rc-contact__value">{{ hostOf(link.url) }}</span>
        </a>
        <div v-else class="rc-contact__row">
          <RetroComputerPixelIcon variant="mail" />
          <span class="rc-contact__name">{{ link.name }}</span>
          <span v-if="link.value" class="rc-contact__value">
            <span class="rc-contact__value-label">{{ t('contact.wechatId') }}</span>
            {{ link.value }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import RetroComputerPixelIcon from './RetroComputerPixelIcon.vue'

const { t } = useI18n()
const { socialLinks } = useAppInfo()

const safeSocialLinks = computed(() => (Array.isArray(socialLinks.value) ? socialLinks.value : []))

/** 外链域名展示（纯字符串解析，SSR 安全）；解析失败回退空串 */
function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}
</script>

<style scoped>
.rc-contact__intro {
  margin: 0 0 14px;
}

/* 小节标题：深蓝下划线（像菜单分组线） */
.rc-sub {
  margin: 18px 0 10px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--c-accent);
  font-family: var(--font-head);
  font-size: var(--fs-title);
}

.rc-contact__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.rc-contact__list li + li {
  margin-top: 6px;
}

.rc-contact__row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 8px 12px;
  border: var(--border-w) solid transparent;
  color: var(--c-text);
}

/* 外链行：悬停深蓝反白（瞬时切换） */
.rc-contact__row--link {
  cursor: pointer;
  text-decoration: none;
}

.rc-contact__row--link:hover {
  background: var(--c-accent);
  border-color: #dfdfdf #0a0a0a #0a0a0a #dfdfdf;
  color: var(--c-on-accent);
}

.rc-contact__row--link:focus-visible {
  outline: 2px dotted var(--c-text);
  outline-offset: -3px;
}

.rc-contact__name {
  flex: none;
  font-weight: 700;
}

.rc-contact__value {
  margin-left: auto;
  /* 邮箱 / 域名 / 微信号是长串容器：anywhere 保留（见 overflow-wrap triage） */
  overflow-wrap: anywhere;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  text-align: right;
}

.rc-contact__value-label {
  margin-right: 6px;
  color: var(--c-muted);
}

.rc-contact__row--link:hover .rc-contact__value-label {
  color: var(--c-on-accent);
}
</style>

<!--
  EditorialContact - editorial 风格的「04 联系」区块
  ------------------------------------------------------------
  杂志末页「读者联络」版面（不复用过渡层 ContactForm）：
  左栏为衬线大字邀请语 + 外部链接（GitHub 等，下划线划入
  + 箭头微动）；右栏为「图版」墙——钉钉/飞书/微信二维码
  以裱贴相版呈现（hairline 边框 + 图注编号 + 墨绿注记），
  微信号附「复制」按钮（复制动作复用共享层 useClipboardCopy：
  客户端守卫、失败静默兜底与反馈定时器清理均在 composable 内）。
-->
<template>
  <section id="contact" class="section" data-section="contact">
    <EditorialSectionHead :no="'04'" :title="t('contact.title')" />

    <div class="body">
      <!-- 左栏：邀请语 + 外部链接 -->
      <div class="col col-invite">
        <p class="standfirst">{{ t('contact.description') }}</p>
        <a
          v-for="social in linkSocials"
          :key="social.name"
          class="out-link"
          :href="social.url ?? '#'"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="out-name">{{ social.name }}</span>
          <span class="out-arrow" aria-hidden="true">↗</span>
        </a>
      </div>

      <!-- 右栏：二维码图版墙 -->
      <div class="col col-plates">
        <figure v-for="(social, i) in qrSocials" :key="social.name" class="plate">
          <img
            v-if="social.qrCode"
            class="plate-img"
            :src="social.qrCode"
            :alt="social.name"
            loading="lazy"
            width="150"
            height="150"
          >
          <figcaption class="plate-cap">
            <span class="cap-no" aria-hidden="true">{{ padNo(i + 1) }}</span>
            <span class="cap-name">{{ social.name }}</span>
            <span v-if="social.value" class="cap-value">{{ social.value }}</span>
          </figcaption>
          <button
            v-if="social.value"
            type="button"
            class="copy"
            @click="copy(social.value)"
          >
            {{ copied === social.value ? t('contact.copied') : t('contact.copyWechatId') }}
          </button>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useClipboardCopy } from '~/composables/useClipboardCopy'
import EditorialSectionHead from './EditorialSectionHead.vue'

const { t } = useI18n()

// —— 共享层数据（组件不直接调用 content API） ——
const { socialLinks } = useAppInfo()

/** 外链平台（有 url 的，如 GitHub） */
const linkSocials = computed(() =>
  socialLinks.value.filter((item) => !!item.url),
)

/** 二维码图版（有 qrCode 的，如钉钉/飞书/微信） */
const qrSocials = computed(() =>
  socialLinks.value.filter((item) => !!item.qrCode),
)

// —— 复制动作收敛到共享层 useClipboardCopy ——
// copied 为最近一次成功复制的文本（2 秒自动清空），模板用
// copied === social.value 判断哪个图版处于「已复制」反馈态；
// 客户端守卫、失败静默兜底与定时器清理均在 composable 内完成。
const { copied, copy } = useClipboardCopy()

/** 两位编号（01、02…） */
function padNo(n: number): string {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
.body {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: clamp(24px, 4vw, 48px);
  margin-top: calc(var(--space) * 1.1);
}

/* 左栏：衬线大字邀请语 */
.standfirst {
  margin: 0 0 calc(var(--space) * 0.9);
  max-width: 24ch;
  font-family: var(--font-head);
  font-size: clamp(21px, 2.6vw, 30px);
  line-height: 1.6;
  color: var(--c-text);
}

/* 外部链接：大号衬线 + 划线动画 + 箭头微动 */
.out-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  margin-right: 28px;
  font-family: var(--font-head);
  font-size: var(--fs-title);
  font-weight: 700;
  color: var(--c-text);
  text-decoration: none;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  transition:
    color var(--transition),
    background-size var(--transition);
}

.out-link:hover {
  color: var(--c-accent);
  background-size: 100% 2px;
}

.out-link:active {
  transform: var(--press-transform);
}

.out-arrow {
  font-family: var(--font-mono);
  font-size: 0.8em;
  transition: transform var(--transition);
}

.out-link:hover .out-arrow {
  transform: translate(3px, -3px);
}

/* 右栏：裱贴相版墙 */
.col-plates {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--gap);
  align-content: start;
}

.plate {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 10px;
  background: var(--c-surface);
  border: var(--border-w) solid var(--c-border);
  transition:
    border-color var(--transition),
    background var(--transition);
}

/* 相版悬停：边框转刊头红 + 底色淡染 */
.plate:hover {
  border-color: var(--c-accent);
  background: var(--deco);
}

.plate-img {
  display: block;
  width: 100%;
  height: auto;
  background: var(--c-bg);
}

.plate-cap {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 10px;
}

.cap-no {
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-accent);
}

.cap-name {
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 700;
  color: var(--c-text);
}

.cap-value {
  flex-basis: 100%;
  font-family: var(--font-mono);
  font-size: var(--fs-small);
  letter-spacing: 0.04em;
  color: var(--c-accent-2);
  overflow-wrap: anywhere;
}

/* 复制按钮：印刷下划线样式（≥40px 触控目标） */
.copy {
  align-self: flex-start;
  min-height: 40px;
  padding: 6px 0;
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--c-text);
  cursor: pointer;
  background: transparent;
  background-image: linear-gradient(var(--c-accent), var(--c-accent));
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 1px;
  border: none;
  transition:
    color var(--transition),
    background-size var(--transition);
}

.copy:hover {
  color: var(--c-accent);
}

.copy:active {
  transform: var(--press-transform);
}

/* 窄屏：双栏回退单栏，右栏加顶部细线 */
@media (max-width: 880px) {
  .body {
    grid-template-columns: 1fr;
  }

  .col-plates {
    padding-top: 22px;
    border-top: var(--border-w) solid var(--c-border);
  }
}

@media (prefers-reduced-motion: reduce) {
  .out-link,
  .out-arrow,
  .plate,
  .copy {
    transition: none;
  }

  .out-link:active,
  .out-link:hover .out-arrow,
  .copy:active {
    transform: none;
  }
}
</style>

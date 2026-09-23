<!--
  站点门脸 —— UI 风格画廊（根路径 /）

  阶段 3 定稿：`/` 不再是过渡层的个人站首页，而是「一站多风格」的门脸，
  把 20 种 UI 大风格并列展示出来，由访客挑一种进入。

  自包含原则（关键）：
  本页**不依赖任何过渡层资产**——不用 Tailwind 工具类、不用过渡层 @theme
  token、不套 layouts/default.vue（过渡层已整体移除）。配色与排版全部写在
  下方 scoped <style> 里，暗色用 prefers-color-scheme 跟随系统，因此不需要
  color-mode 之类的运行时依赖。

  数据源仅 styles/registry.ts：新增风格注册后自动出现，无需改本页。
-->
<script setup lang="ts">
import { styleRegistry, type StyleMeta } from '~/styles/registry'

// 门脸自带页头页脚，不套任何布局
definePageMeta({ layout: false })

const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()

// 中文名/英文名按当前语言展示
function displayName(item: StyleMeta) {
  return locale.value.startsWith('zh') ? item.name : item.en
}

// 完成度徽章：状态 → i18n key（阶段 4 后 20 个风格均为 ready）
const statusKey: Record<StyleMeta['status'], string> = {
  ready: 'styles.gallery.statusReady',
  partial: 'styles.gallery.statusPartial',
  planned: 'styles.gallery.statusPlanned',
}

// 语言切换：按钮显示「目标语言」的名字（中文界面显示 English，反之亦然）
const targetLocale = computed(() =>
  (locales.value as Array<{ code: string; name: string }>).find((l) => l.code !== locale.value),
)
function switchLocale() {
  // locales 的 code 只有 'zh' | 'en'（见 nuxt.config.ts i18n.locales），收窄类型
  if (targetLocale.value) {
    navigateTo(switchLocalePath(targetLocale.value.code as 'zh' | 'en'))
  }
}

// SEO：页面级 canonical / og:url / og:locale（全局 head 只放静态标签，
// 路由相关的必须每页自己设置，否则分享出去全是同一个 URL）
const siteUrl = String(useRuntimeConfig().public.siteUrl || '')
const baseURL = String(useRuntimeConfig().app.baseURL || '/')
const pageUrl = computed(() => `${siteUrl}${baseURL}${route.path.slice(1)}`)

useHead({
  title: () => `${t('styles.gallery.title')} · ${t('home.name')}`,
  link: [{ rel: 'canonical', href: pageUrl.value }],
  meta: () => {
    const isZh = locale.value.startsWith('zh')
    return [
      { name: 'description', content: t('styles.gallery.description') },
      { property: 'og:title', content: `${t('styles.gallery.title')} · ${t('home.name')}` },
      { property: 'og:description', content: t('styles.gallery.description') },
      { property: 'og:url', content: pageUrl.value },
      { property: 'og:locale', content: isZh ? 'zh_CN' : 'en_US' },
      { property: 'og:locale:alternate', content: isZh ? 'en_US' : 'zh_CN' },
    ]
  },
})
</script>

<template>
  <div class="gallery">
    <!-- 页头：站名 + 语言切换 -->
    <header class="gallery__bar">
      <NuxtLink class="gallery__brand" :to="localePath('/')">
        <span class="gallery__brand-dot" aria-hidden="true" />
        {{ t('home.name') }}
      </NuxtLink>
      <button
        type="button"
        class="gallery__lang"
        :aria-label="t('common.language')"
        @click="switchLocale"
      >
        {{ targetLocale?.name }}
      </button>
    </header>

    <main class="gallery__main">
      <!-- 页头 -->
      <header class="gallery__head">
        <h1 class="gallery__title">{{ t('styles.gallery.title') }}</h1>
        <p class="gallery__desc">{{ t('styles.gallery.description') }}</p>
      </header>

      <!-- 风格卡片网格 -->
      <ul class="gallery__grid">
        <li v-for="item in styleRegistry" :key="item.id">
          <NuxtLink
            :to="localePath(`/style/${item.id}`)"
            :style="{ '--accent': item.accent }"
            :data-style="item.id"
            class="card"
          >
            <span class="card__band" aria-hidden="true" />
            <span class="card__top">
              <span class="card__names">
                <span class="card__name">
                  <span class="card__dot" aria-hidden="true" />
                  {{ displayName(item) }}
                </span>
                <span class="card__en">{{ item.en }}</span>
              </span>
              <span class="card__status" :data-status="item.status">
                {{ t(statusKey[item.status]) }}
              </span>
            </span>

            <span class="card__note">{{ item.note }}</span>

            <span class="card__foot">
              <span>{{ t('styles.gallery.tier') }} {{ item.tier }} · {{ item.tierLabel }}</span>
              <span class="card__enter">{{ t('styles.gallery.enter') }} →</span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </main>

    <!-- 页脚 -->
    <footer class="gallery__foot">
      <span>© {{ t('footer.copyright') }} {{ t('footer.author') }}</span>
      <span>{{ t('footer.builtWith') }}</span>
    </footer>
  </div>
</template>

<style scoped>
/*
  门脸的自包含配色
  ------------------------------------------------------------
  用页面级 CSS 变量承载配色，暗色走 prefers-color-scheme，
  不引入任何运行时主题依赖（color-mode / 过渡层 token 均已移除）。
  中性底色的选择理由：门脸要展示 20 种风格，自身越中性，
  各风格卡片上的主色签名（--accent）越跳。
*/
.gallery {
  --bg: #ffffff;
  --surface: #ffffff;
  --text: #1e293b;
  --muted: #64748b;
  --border: #e2e8f0;
  --shadow: 0 1px 2px rgb(15 23 42 / 0.06);

  display: flex;
  flex-direction: column;
  min-height: 100vh;
  color: var(--text);
  background: var(--bg);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}

@media (prefers-color-scheme: dark) {
  .gallery {
    --bg: #0b1120;
    --surface: #0f172a;
    --text: #f1f5f9;
    --muted: #94a3b8;
    --border: #1e293b;
    --shadow: 0 1px 2px rgb(0 0 0 / 0.4);
  }
}

/* —— 页头 —— */
.gallery__bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px clamp(16px, 4vw, 40px);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
}

.gallery__brand {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.gallery__brand-dot {
  width: 9px;
  height: 9px;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  border-radius: 9999px;
}

.gallery__lang {
  min-width: 44px;
  min-height: 44px;
  padding: 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: 9999px;
  transition:
    color 150ms ease,
    border-color 150ms ease;
}

.gallery__lang:hover {
  color: var(--text);
  border-color: var(--muted);
}

/* —— 主体 —— */
.gallery__main {
  flex: 1;
  width: 100%;
  max-width: 1120px;
  padding: clamp(40px, 7vw, 72px) clamp(16px, 4vw, 40px);
  margin: 0 auto;
}

.gallery__head {
  margin-bottom: clamp(32px, 5vw, 56px);
  text-align: center;
}

.gallery__title {
  margin-bottom: 14px;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.gallery__desc {
  max-width: 620px;
  margin: 0 auto;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--muted);
}

/* —— 卡片网格 —— */
.gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 20px 20px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow);
  transition:
    transform 200ms ease,
    box-shadow 200ms ease,
    border-color 200ms ease;
}

.card:hover {
  border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
  box-shadow: 0 12px 28px -10px color-mix(in srgb, var(--accent) 40%, transparent);
  transform: translateY(-4px);
}

/* 顶部主色带：伪元素不占布局，hover 加厚不顶动内容。
   默认为风格 accent 纯色；下方「签名条」按 data-style 逐风格覆写为
   该风格的材质意象（评审 Top10 #5：卖风格的页面自己不能最朴素） */
.card__band {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  background: var(--accent);
  transition: height 200ms ease;
}

.card:hover .card__band {
  height: 8px;
}

/* ============================================================
   20 风格签名条（横条即微缩的风格名片，全部 CSS 绘制）
   ============================================================ */

/* 极简：纯白条 + 左端一枚蓝点 */
.card[data-style='minimalism'] .card__band {
  background: radial-gradient(circle 2px at 12px 50%, #2b6ef2 0 2px, transparent 3px) #fff;
}

/* 液态玻璃：半透白板 + 上缘亮边 */
.card[data-style='liquid-glass'] .card__band {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.95) 0%, rgb(168 178 226 / 0.4) 100%);
}

/* Metro：微软四色瓦片 */
.card[data-style='metro'] .card__band {
  background: linear-gradient(90deg, #f25022 0 25%, #7fba00 25% 50%, #00a4ef 50% 75%, #ffb900 75%);
}

/* 瑞士国际主义：红黑白三色纪律 */
.card[data-style='swiss'] .card__band {
  background: linear-gradient(
    90deg,
    #e30613 0 30%,
    #111 30% 32%,
    #f5f5f5 32% 68%,
    #111 68% 70%,
    #e30613 70% 72%
  );
}

/* 杂志编辑排版：米纸 + 右端红句点 */
.card[data-style='editorial'] .card__band {
  background: radial-gradient(circle 2px at calc(100% - 12px) 50%, #c8321e 0 2px, transparent 3px)
    #f6f1e7;
}

/* 扁平化：四色编码 + 直角平涂 */
.card[data-style='flat-design'] .card__band {
  background: linear-gradient(90deg, #2f80ed 0 40%, #27ae60 40% 65%, #9b51e0 65% 85%, #eb5757 85%);
}

/* 数据仪表盘：深藏青 + 蓝/琥珀数据条 */
.card[data-style='dashboard'] .card__band {
  background-color: #0f172a;
  background-image:
    repeating-linear-gradient(90deg, rgb(59 130 246 / 0.9) 0 6px, transparent 6px 11px),
    linear-gradient(90deg, #f59e0b 0 14%, transparent 14%);
}

/* 终端机：纯黑屏 + 绿色块光标 */
.card[data-style='terminal'] .card__band {
  background: repeating-linear-gradient(90deg, #22c55e 0 8px, #04140a 8px 13px);
}

/* 赛博朋克：青粉霓虹斜纹 */
.card[data-style='cyberpunk'] .card__band {
  background: repeating-linear-gradient(
    45deg,
    #00e5ff 0 4px,
    #0a0a14 4px 10px,
    #ff2bd6 10px 14px,
    #0a0a14 14px 20px
  );
}

/* Y2K：铬银 × 霓虹 */
.card[data-style='y2k'] .card__band {
  background: linear-gradient(
    90deg,
    #f8faff 0%,
    #8e9ad0 38%,
    #ff5ce1 58%,
    #8b7bff 78%,
    #f8faff 100%
  );
}

/* Web 2.0 光泽：Aqua 果冻条 */
.card[data-style='web2-glossy'] .card__band {
  background: linear-gradient(180deg, #7cc4ff 0%, #1d6fd1 55%, #0b4c9c 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7);
}

/* 像素风：双色棋盘点阵 */
.card[data-style='pixel'] .card__band {
  background: repeating-conic-gradient(#33ff66 0% 25%, #0f0f23 0% 50%) 0 0 / 6px 6px;
}

/* 复古电脑：Win95 桌面青 + 凸起银条 */
.card[data-style='retro-computer'] .card__band {
  background: linear-gradient(180deg, #fdfdfd 0 38%, #9a9a9a 38% 52%, #efefef 52% 62%, #0a8080 62%);
}

/* 科幻 HUD：军用刻度尺 */
.card[data-style='sci-fi-hud'] .card__band {
  background:
    repeating-linear-gradient(90deg, #7ef2b6 0 2px, transparent 2px 9px) 0 0 / auto 100% repeat-x,
    linear-gradient(90deg, #f59e0b 0 12%, transparent 12%),
    #061a20;
}

/* 柔和 3D：柔光渐变球 */
.card[data-style='soft-3d'] .card__band {
  background: linear-gradient(90deg, #a78bfa 0%, #f0abfc 35%, #fda4af 65%, #7dd3fc 100%);
}

/* 玻璃拟态：磨砂白玻璃 */
.card[data-style='glassmorphism'] .card__band {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.92) 0%, rgb(255 255 255 / 0.4) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.8);
}

/* 黏土拟态：粉紫黄黏土条 */
.card[data-style='claymorphism'] .card__band {
  background: linear-gradient(90deg, #c4b5fd 0%, #f9a8d4 50%, #fde68a 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.75);
}

/* 新拟态：浅灰蓝凸起双光 */
.card[data-style='neumorphism'] .card__band {
  background: linear-gradient(180deg, #ffffff 0%, #dfe6f3 45%, #c9d3e8 58%, #eef2fa 100%);
}

/* 拟物主义：皮革棕 + 米色缝线 */
.card[data-style='skeuomorphism'] .card__band {
  background:
    repeating-linear-gradient(90deg, #e8d5b5 0 5px, transparent 5px 11px) 0 0 / auto 100% repeat-x,
    #6b3f1d;
}

/* 新粗野主义：黑黄斜纹警戒条 */
.card[data-style='neo-brutalism'] .card__band {
  background: repeating-linear-gradient(45deg, #ffd60a 0 8px, #111 8px 16px);
}

.card__top {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card__names {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card__name {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 1.05rem;
  font-weight: 700;
}

.card__dot {
  flex: none;
  width: 9px;
  height: 9px;
  background: var(--accent);
  border-radius: 9999px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
  transition: transform 200ms ease;
}

.card:hover .card__dot {
  transform: scale(1.35);
}

.card__en {
  font-size: 0.82rem;
  color: var(--muted);
}

.card__status {
  flex: none;
  padding: 3px 9px;
  font-size: 0.72rem;
  white-space: nowrap;
  border-radius: 9999px;
}

.card__status[data-status='ready'] {
  color: #047857;
  background: rgb(16 185 129 / 0.12);
}

.card__status[data-status='partial'] {
  color: #b45309;
  background: rgb(245 158 11 / 0.14);
}

.card__status[data-status='planned'] {
  color: var(--muted);
  background: color-mix(in srgb, var(--muted) 14%, transparent);
}

.card__note {
  flex: 1;
  margin-bottom: 16px;
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--muted);
}

.card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.76rem;
  color: var(--muted);
}

.card__enter {
  font-weight: 600;
  color: var(--accent);
}

/* —— 页脚 —— */
.gallery__foot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  justify-content: space-between;
  padding: 22px clamp(16px, 4vw, 40px);
  font-size: 0.82rem;
  color: var(--muted);
  border-top: 1px solid var(--border);
}

/* 尊重 prefers-reduced-motion：只关动效，主色签名保留 */
@media (prefers-reduced-motion: reduce) {
  .card,
  .card__band,
  .card__dot,
  .gallery__lang {
    transition: none;
  }

  .card:hover {
    transform: none;
  }

  .card:hover .card__band {
    height: 4px;
  }

  .card:hover .card__dot {
    transform: none;
  }
}
</style>

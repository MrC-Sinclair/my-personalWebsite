<!--
  NeumorphismHero - neumorphism 风格首屏英雄区
  ------------------------------------------------------------
  居中对称的首屏：凸起圆形头像刻着姓名首字母 + 问候语 + 大号
  浮雕姓名 + 标语/简介 + 两枚凸起按钮（原生锚点跳到项目/文章
  区块，按下时凹进材料）。首屏撑满一屏，入场为轻微的
  「浮现」动画（prefers-reduced-motion 下关闭）。
-->
<template>
  <section class="hero">
    <div class="hero-avatar" aria-hidden="true">{{ initials }}</div>
    <p class="hero-greeting">{{ t('home.greeting') }}</p>
    <h1 class="hero-name">{{ t('home.name') }}</h1>
    <p class="hero-tagline">{{ t('home.tagline') }}</p>
    <p class="hero-desc">{{ t('home.description') }}</p>

    <div class="hero-actions">
      <a class="hero-btn" href="#projects">{{ t('home.viewProjects') }}</a>
      <a class="hero-btn" href="#posts">{{ t('home.viewBlog') }}</a>
    </div>

    <!--
      材质仪表组：新拟态的招牌构件（纯装饰，aria-hidden）
      两枚凸起表盘（外圈凸 / 内圈凹 / 指针）+ 一条内凹滑轨与凸起推子。
      作用有二：填充首屏空档，并在同一块材料上拉开明度层次——
      凸起 = 左上亮右下暗，内凹 = 同组阴影取 inset，指针提供强调色。
      指针角度与推子位置为固定值，SSR/客户端一致。
    -->
    <div class="hero-cluster" aria-hidden="true">
      <span class="dial">
        <span class="dial-face">
          <span class="dial-needle dial-needle--a" />
        </span>
      </span>
      <span class="dial">
        <span class="dial-face">
          <span class="dial-needle dial-needle--b" />
        </span>
      </span>
      <span class="slider">
        <span class="slider-knob" />
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

/** 从站点名提取首字母缩写（纯字符串推导，SSR/客户端一致） */
const initials = computed(() => {
  const parts = t('home.name')
    .split(/[^A-Za-z0-9\u4e00-\u9fa5]+/)
    .filter(Boolean)
  const letters = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return letters || 'N'
})
</script>

<style scoped>
/* —— 首屏：居中单列（新拟态的对称轴） ——
   高度从「撑满一屏」收紧为「内容高度 + 适度留白」，避免首屏出现
   大片无内容的死灰材料面（阴影需要呼吸空间，但不需要空屏） */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-height: clamp(520px, 62vh, 680px);
  padding: 32px 0 24px;
  text-align: center;
}

/* 凸起圆形头像：材料上压出一枚圆台 */
.hero-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--c-accent);
  background: var(--c-bg);
  border-radius: 50%;
  box-shadow: 7px 7px 15px #a3b1c6, -7px -7px 15px #ffffff;
}

.hero-greeting {
  margin: 6px 0 0;
  font-size: var(--fs-base);
  letter-spacing: 0.12em;
  color: var(--c-muted);
}

/* 大号浮雕姓名：文字本身也带凸起的光影 */
.hero-name {
  margin: 0;
  font-size: clamp(var(--fs-head), 8vw, 64px);
  font-weight: 800;
  line-height: 1.15;
  color: var(--c-text);
  letter-spacing: 0.01em;
  overflow-wrap: break-word;
  text-shadow: 1px 1px 1px rgb(255 255 255 / 0.92), -1px -1px 1px rgb(163 177 198 / 0.45);
}

.hero-tagline {
  max-width: 40ch;
  margin: 0;
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
}

.hero-desc {
  max-width: 46ch;
  margin: 0;
  color: var(--c-muted);
}

/* —— 凸起按钮：hover 光影加深，active 凹进材料 —— */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
  margin-top: 12px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 12px 28px;
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-accent);
  text-decoration: none;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff;
  transition:
    box-shadow var(--transition),
    color var(--transition);
}

.hero-btn:hover {
  color: var(--c-text);
  box-shadow: 8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff;
}

.hero-btn:active {
  color: var(--c-accent);
  box-shadow: var(--shadow-press);
}

.hero-btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

/* —— 材质仪表组：两枚表盘 + 一条推子 ——
   同一块材料上拉开明度层次：外圈凸起 → 内圈内凹 → 指针强调色，
   让首屏不再是单一的死灰面 */
.hero-cluster {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 26px;
  margin-top: 18px;
}

/* 表盘：外圈凸起圆台 + 内圈内凹盘面 + 强调色指针 */
.dial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  background: var(--c-bg);
  border-radius: 50%;
  box-shadow: var(--shadow);
}

.dial-face {
  position: relative;
  display: block;
  width: 58px;
  height: 58px;
  background: var(--c-bg);
  border-radius: 50%;
  box-shadow: var(--shadow-press);
}

/* 指针：以盘心为原点旋转，末端为强调色（--deco 渐变） */
.dial-needle {
  position: absolute;
  left: 50%;
  bottom: 50%;
  width: 3px;
  height: 21px;
  margin-left: -1.5px;
  transform-origin: 50% 100%;
  background: var(--deco);
  border-radius: 2px;
}

.dial-needle--a {
  transform: rotate(38deg);
}

.dial-needle--b {
  transform: rotate(-62deg);
}

/* 推子：内凹轨道 + 凸起滑块（轨道内部比材料暗，形成凹槽） */
.slider {
  position: relative;
  display: block;
  width: 168px;
  height: 20px;
  background: var(--c-bg);
  border-radius: 999px;
  box-shadow: var(--shadow-press);
}

.slider-knob {
  position: absolute;
  top: 50%;
  left: 58%;
  width: 34px;
  height: 34px;
  margin-top: -17px;
  background: var(--c-bg);
  border-radius: 50%;
  box-shadow: var(--shadow);
}

/* 入场浮现动画（纯 CSS，交错延迟） */
.hero > * {
  animation: hero-rise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero > :nth-child(2) {
  animation-delay: 60ms;
}

.hero > :nth-child(3) {
  animation-delay: 120ms;
}

.hero > :nth-child(4) {
  animation-delay: 180ms;
}

.hero > :nth-child(5) {
  animation-delay: 240ms;
}

.hero > :nth-child(6) {
  animation-delay: 300ms;
}

.hero > :nth-child(7) {
  animation-delay: 360ms;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero > * {
    animation: none;
  }

  .hero-btn {
    transition: none;
  }
}
</style>

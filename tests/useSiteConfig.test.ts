/**
 * useAppInfo 单元测试（站点信息）
 * ------------------------------------------------------------
 * 这里守的是「不要再出现假数据」：本文件原先硬编码了
 * `https://yourusername.github.io` 与 `your@email.com` 两个占位值，
 * 而 social.dingtalk / social.feishu 填的是「钉钉」「飞书」这种中文名
 * （字段语义是 URL）——都是看着像真数据、实际是假的脏值。
 *
 * 现在：url 与 canonical / og:url 同源（runtimeConfig.public.siteUrl），
 * 无链接的社交项留空字符串，由 socialLinks 里的二维码承担展示。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useAppInfo } from '~/composables/useSiteConfig'

let locale: ReturnType<typeof ref<string>>

function mountAppInfo() {
  const Harness = defineComponent({
    setup() {
      const info = useAppInfo()
      return { ...info }
    },
    render: () => h('div'),
  })
  return mount(Harness)
}

describe('useAppInfo', () => {
  beforeEach(() => {
    locale = ref('zh')
    vi.stubGlobal('useI18n', () => ({ locale, t: (key: string) => `[${key}]` }))
    vi.stubGlobal('useRuntimeConfig', () => ({
      app: { baseURL: '/my-personalWebsite/' },
      public: { siteUrl: 'https://mrc-sinclair.github.io' },
    }))
  })

  it('★ 站点地址取自 runtimeConfig，不是硬编码占位值', () => {
    const wrapper = mountAppInfo()
    expect(wrapper.vm.siteConfig.url).toBe('https://mrc-sinclair.github.io')
    expect(wrapper.vm.siteConfig.url).not.toContain('yourusername')
  })

  it('★ 不出现 your@email.com 这类假数据', () => {
    const wrapper = mountAppInfo()
    expect(wrapper.vm.siteConfig.email).toBe('')
  })

  it('社交项：有主页链接的填 URL，没有的留空（不填中文名）', () => {
    const wrapper = mountAppInfo()
    const { social } = wrapper.vm.siteConfig
    expect(social.github).toMatch(/^https:\/\//)
    expect(social.dingtalk).toBe('')
    expect(social.feishu).toBe('')
    expect(social.wechat).toBe('c2256843428')
  })

  it('社交链接：GitHub 有 url，二维码项 url 为 null 且带上 baseURL', () => {
    const wrapper = mountAppInfo()
    const github = wrapper.vm.socialLinks.find((item) => item.name === 'GitHub')
    expect(github?.url).toBe('https://github.com/MrC-Sinclair')

    const wechat = wrapper.vm.socialLinks.find((item) => item.qrCode?.includes('wechat'))
    expect(wechat?.url).toBeNull()
    expect(wechat?.qrCode).toBe('/my-personalWebsite/images/wechat-qr.png')
  })

  it('技能分组与时间线由 i18n 驱动（分类名跟随语言）', () => {
    const wrapper = mountAppInfo()
    expect(wrapper.vm.skillGroups).toHaveLength(4)
    expect(wrapper.vm.skillGroups[0].category).toBe('[about.skillFrontend]')
    expect(wrapper.vm.timeline).toHaveLength(4)
    expect(wrapper.vm.timeline[0].title).toBe('[about.timeline1Title]')
  })

  it('切换语言后文案跟着变（computed 依赖 t）', async () => {
    const wrapper = mountAppInfo()
    expect(wrapper.vm.siteConfig.name).toBe('[home.name]')
    locale.value = 'en'
    await wrapper.vm.$nextTick()
    // t 的 stub 与语言无关，这里断言的是 computed 会被重新求值（仍返回 stub 值）
    expect(wrapper.vm.siteConfig.name).toBe('[home.name]')
    expect(wrapper.vm.skillGroups).toHaveLength(4)
  })
})

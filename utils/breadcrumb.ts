/**
 * @file 详情页面包屑（纯函数）
 * @description 详情阅读页的层级导航「风格首页 > 列表页 > 当前标题」。
 *
 * 为什么要有它：AGENTS.md 的 UX 规则要求详情页必须包含面包屑，
 * 但本站 20 个风格此前都只有一条「← 返回列表」，用户在深层页面里
 * 无法直接跳回风格首页。层级与路径是**业务契约**（所有风格一致），
 * 所以放共享层；各风格只负责把它画成自己的样子。
 *
 * 纯函数的好处：不依赖 Nuxt 自动导入，可直接单测（composable 负责注入
 * i18n 文案与本地化路径）。
 */
import type { DetailView } from '~/types/detail'

export interface BreadcrumbItem {
  /** 显示文案（末级是文档标题） */
  label: string
  /** 导航目标；**末级不带 to**——它是当前页，不该是链接 */
  to?: string
}

export interface DetailBreadcrumbInput {
  /** 内容类型：决定第二级指向 blog 还是 projects */
  kind: DetailView['kind']
  /** 当前文档标题（末级文案） */
  title: string
  /** 风格首页路径，已带语言前缀，如 /en/style/minimalism */
  homePath: string
  /** 「首页」文案（已过 i18n） */
  homeLabel: string
  /** 列表页文案（已过 i18n，如「博客」/「项目」） */
  listLabel: string
}

/**
 * 构造详情页面包屑三级结构。
 * 末级不带 to：既是当前页不该自链，也避免爬虫把详情页当成导航节点。
 */
export function buildDetailBreadcrumb(input: DetailBreadcrumbInput): BreadcrumbItem[] {
  const listPath = `${input.homePath}/${input.kind === 'post' ? 'blog' : 'projects'}`
  return [
    { label: input.homeLabel, to: input.homePath },
    { label: input.listLabel, to: listPath },
    { label: input.title },
  ]
}

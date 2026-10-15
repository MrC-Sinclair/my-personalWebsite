/**
 * useDashboardStats - dashboard 风格的图表统计推导
 * ------------------------------------------------------------
 * 首页总览屏与 /about、/blog 子页都要把「同一份文章列表」推导成
 * 分类分布、标签 Top N、技能分布、12 个月发文趋势。这段推导原先
 * 整段写在 DashboardIndex 里，子页化后会被抄三遍；抽成本 composable
 * 后三处共用一份口径（首页与子页的 KPI 数字不会互相打架）。

 * 放在 styles/dashboard/ 下而非共享 composables/：这些统计只为
 * dashboard 的图表服务（Top N 截断、12 个月窗口都是该风格的视觉取舍），
 * 别的风格没有这些图表，进共享层会变成无人使用的通用件。
 *
 * 入参是**已获取**的列表（Ref/Computed），不负责取数：
 * 取数仍由各页面的 useAsyncData 承担（SSG 预渲染 payload 需要它）。
 *
 * 两个入参都可选：项目子页只画项目相关的图（不取文章），管理页相反。
 * 缺哪一路就返回空的统计，图表各自判空渲染空状态，不用传假数据填空。
 *
 * ★ 图表数据源刻意保持四路不同（posts.category / projects.tags /
 * skillGroups / posts.date）：把同一份文章切四刀（分类/标签/技能/趋势）
 * 信息增量低，首页会沦为「图表组件陈列」而不是控制台。
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { BlogPost } from '~/types/blog'
import type { Project } from '~/types/project'

/** 标签 Top N 常量（图表只放得下 N 条） */
const TAG_TOP_N = 6
/** 趋势图统计的月份数 */
const TREND_MONTHS = 12

/** 条形图 / 环形图的一项 */
export interface StatItem {
  label: string
  value: number
}

export interface DashboardStats {
  /** 分类分布：按 category 计数，倒序 */
  categoryStats: ComputedRef<StatItem[]>
  /** 全量标签计数（KPI 用） */
  fullTagStats: ComputedRef<StatItem[]>
  /** 标签 Top N（图表用） */
  tagStats: ComputedRef<StatItem[]>
  /** 项目技术栈全量计数（KPI 用；与文章标签不同数据源） */
  fullProjectTagStats: ComputedRef<StatItem[]>
  /** 项目技术栈 Top N（图表用） */
  projectTagStats: ComputedRef<StatItem[]>
  /** 技能分布：各分组的技能数量（来自 useAppInfo 真实数据） */
  skillStats: ComputedRef<StatItem[]>
  /** 发文趋势：以内容中最新文章的月份为基准向前推 12 个月 */
  trend: ComputedRef<{ values: number[]; labels: string[] }>
  /** 趋势期内发文总数（面板 meta） */
  trendTotal: ComputedRef<number>
  /** KPI：分类数 */
  kpiCategories: ComputedRef<number>
  /** KPI：标签数（全量，不受 Top N 截断影响） */
  kpiTags: ComputedRef<number>
  /** KPI：技能总数 */
  kpiSkills: ComputedRef<number>
  /** KPI：技术栈种类数（全量，不受 Top N 截断影响） */
  kpiProjectTags: ComputedRef<number>
}

/**
 * 按出现次数倒序、同次数按码位字典序稳定的计数表 → 图表项。
 * 不用 localeCompare：后者依赖 ICU，SSR（Node）与浏览器可能给出
 * 不同顺序，会造成 hydration 不一致（与 utils/tags.ts 同一口径）。
 */
function toSortedItems(counts: Map<string, number>): StatItem[] {
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || (a.label < b.label ? -1 : a.label > b.label ? 1 : 0))
}

export function useDashboardStats(
  posts?: Ref<BlogPost[]> | ComputedRef<BlogPost[]>,
  projects?: Ref<Project[]> | ComputedRef<Project[]>,
): DashboardStats {
  const { skillGroups } = useAppInfo()

  /** 文章列表防御（入参可选：不画文章图表的页面不传） */
  const postList = computed<BlogPost[]>(() => {
    const list = posts?.value
    return Array.isArray(list) ? list : []
  })

  /** 项目列表防御（入参可选：不画技术栈图的页面不传） */
  const projectList = computed<Project[]>(() => {
    const list = projects?.value
    return Array.isArray(list) ? list : []
  })

  /** 分类分布 */
  const categoryStats = computed<StatItem[]>(() => {
    const counts = new Map<string, number>()
    for (const post of postList.value) {
      const key = typeof post.category === 'string' ? post.category.trim() : ''
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return toSortedItems(counts)
  })

  /** 全量标签计数（KPI 用） */
  const fullTagStats = computed<StatItem[]>(() => {
    const counts = new Map<string, number>()
    for (const post of postList.value) {
      const tags = Array.isArray(post.tags) ? post.tags : []
      for (const tag of tags) {
        const key = String(tag).trim()
        if (!key) continue
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return toSortedItems(counts)
  })

  const tagStats = computed<StatItem[]>(() => fullTagStats.value.slice(0, TAG_TOP_N))

  /** 项目技术栈全量计数（与文章标签同构，但数据源是 projects.tags） */
  const fullProjectTagStats = computed<StatItem[]>(() => {
    const counts = new Map<string, number>()
    for (const project of projectList.value) {
      const tags = Array.isArray(project.tags) ? project.tags : []
      for (const tag of tags) {
        const key = String(tag).trim()
        if (!key) continue
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
    return toSortedItems(counts)
  })

  const projectTagStats = computed<StatItem[]>(() => fullProjectTagStats.value.slice(0, TAG_TOP_N))

  /** 技能分布 */
  const skillStats = computed<StatItem[]>(() =>
    skillGroups.value
      .map((group) => ({
        label: group.category,
        value: Array.isArray(group.skills) ? group.skills.length : 0,
      }))
      .filter((item) => item.value > 0),
  )

  /**
   * 发文趋势：以内容中最新文章的月份为基准向前推 12 个月。
   * 基准取内容本身而非 Date.now()，否则 SSG 构建产物会随构建时间漂移，
   * 且服务端与客户端可能算出不同窗口导致水合不一致。
   */
  const trend = computed<{ values: number[]; labels: string[] }>(() => {
    let anchorYear = 0
    let anchorMonth = 0
    for (const post of postList.value) {
      const year = Number(String(post.date).slice(0, 4))
      const month = Number(String(post.date).slice(5, 7))
      if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) continue
      if (year > anchorYear || (year === anchorYear && month > anchorMonth)) {
        anchorYear = year
        anchorMonth = month
      }
    }
    if (!anchorYear) return { values: [], labels: [] }

    // 纯算术生成 12 个年月键（不构造 Date，避免任何不确定性）
    const keys: string[] = []
    const counts = new Map<string, number>()
    let year = anchorYear
    let month = anchorMonth
    for (let i = 0; i < TREND_MONTHS; i++) {
      const key = `${year}-${String(month).padStart(2, '0')}`
      keys.unshift(key)
      counts.set(key, 0)
      month -= 1
      if (month === 0) {
        month = 12
        year -= 1
      }
    }
    for (const post of postList.value) {
      const key = String(post.date).slice(0, 7)
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return {
      values: keys.map((key) => counts.get(key) ?? 0),
      // 横轴标签用两位数字月份（语言无关）
      labels: keys.map((key) => key.slice(5, 7)),
    }
  })

  const trendTotal = computed<number>(() => trend.value.values.reduce((sum, v) => sum + v, 0))
  const kpiCategories = computed<number>(() => categoryStats.value.length)
  const kpiTags = computed<number>(() => fullTagStats.value.length)
  const kpiProjectTags = computed<number>(() => fullProjectTagStats.value.length)
  const kpiSkills = computed<number>(() =>
    skillStats.value.reduce((sum, item) => sum + item.value, 0),
  )

  return {
    categoryStats,
    fullTagStats,
    tagStats,
    fullProjectTagStats,
    projectTagStats,
    skillStats,
    trend,
    trendTotal,
    kpiCategories,
    kpiTags,
    kpiProjectTags,
    kpiSkills,
  }
}

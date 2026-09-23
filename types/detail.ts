/**
 * 详情阅读页的视图数据（业务层共享类型）
 * ------------------------------------------------------------
 * 风格内详情页（/style/<id>/blog/<slug>、/style/<id>/projects/<slug>）的
 * 取数由路由壳完成（业务层只写一份），再把结果以 prop 传给各风格自己的
 * 详情组件。这样 20 个风格只各写一套「长什么样」，不各写一遍取数逻辑。
 *
 * 注意：共享的是**数据结构**，不是 UI——风格组件仍然各自实现排版。
 */
import type { BlogPost } from './blog'
import type { Project } from './project'

/** 上下篇 / 上下一个项目的导航链接（to 已带上当前风格前缀） */
export interface DetailLink {
  title: string
  to: string
}

export interface DetailView {
  /** 内容类型：post = 博客文章；project = 项目 */
  kind: 'post' | 'project'
  /** 文档元信息（标题/日期/标签等） */
  doc: BlogPost | Project
  /** Markdown 正文（交给 <ContentRenderer> 渲染） */
  content: Record<string, unknown> | null
  /** 上一篇（更新的）；没有则为 null */
  prev: DetailLink | null
  /** 下一篇（更早的）；没有则为 null */
  next: DetailLink | null
}

/** 类型守卫：项目文档比文章多两个外链字段，用它区分显示 */
export function isProjectDoc(doc: BlogPost | Project): doc is Project {
  return 'demoUrl' in doc || 'githubUrl' in doc
}

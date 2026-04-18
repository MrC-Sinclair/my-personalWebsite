export interface BlogPost {
  title: string
  description?: string
  date: string
  updated?: string
  image?: string
  tags: string[]
  category?: string
  draft: boolean
  path: string
  body?: string
}

export interface BlogListParams {
  page?: number
  pageSize?: number
  tag?: string
  category?: string
}

export interface BlogListResult {
  posts: BlogPost[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * contentSlug 单元测试 —— 内容路径 → 裸 slug 的全站唯一实现
 */
import { describe, it, expect } from 'vitest'
import { contentSlug } from '~/utils/content'

describe('contentSlug', () => {
  it('提取博客内容路径的 slug（带语言目录与扩展名）', () => {
    expect(contentSlug('/blog/zh/my-post.md')).toBe('my-post')
  })

  it('提取项目内容路径的 slug', () => {
    expect(contentSlug('/projects/en/app.md')).toBe('app')
  })

  it('支持 yaml 扩展名', () => {
    expect(contentSlug('/projects/en/app.yaml')).toBe('app')
  })

  it('无扩展名时原样返回末段', () => {
    expect(contentSlug('/blog/zh/my-post')).toBe('my-post')
  })

  it('纯文件名输入', () => {
    expect(contentSlug('my-post.md')).toBe('my-post')
  })

  it('空路径返回空字符串', () => {
    expect(contentSlug('')).toBe('')
  })

  it('大小写扩展名也能去除', () => {
    expect(contentSlug('/blog/zh/My-Post.MD')).toBe('My-Post')
  })
})

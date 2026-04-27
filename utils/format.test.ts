import { describe, it, expect } from 'vitest'
import { formatDate, estimateReadingTime, slugify } from '~/utils/format'

describe('formatDate', () => {
  it('格式化中文日期', () => {
    expect(formatDate('2026-01-15', 'zh-CN')).toBe('2026年1月15日')
  })

  it('格式化英文日期', () => {
    expect(formatDate('2026-01-15', 'en-US')).toBe('January 15, 2026')
  })

  it('默认使用中文格式', () => {
    expect(formatDate('2026-01-15')).toBe('2026年1月15日')
  })

  it('处理不同日期格式', () => {
    const result = formatDate('2026-12-01', 'zh-CN')
    expect(result).toBe('2026年12月1日')
  })
})

describe('estimateReadingTime', () => {
  it('中文内容估算阅读时长', () => {
    const content = '这'.repeat(400)
    expect(estimateReadingTime(content)).toBe(2)
  })

  it('英文内容估算阅读时长', () => {
    const content = Array(201).fill('hello').join(' ')
    expect(estimateReadingTime(content)).toBe(2)
  })

  it('空内容返回最小值 1', () => {
    expect(estimateReadingTime('')).toBe(1)
  })

  it('短内容返回最小值 1', () => {
    expect(estimateReadingTime('短文本')).toBe(1)
  })

  it('自定义阅读速度', () => {
    const content = Array(101).fill('hello').join(' ')
    expect(estimateReadingTime(content, 100)).toBe(2)
  })
})

describe('slugify', () => {
  it('英文转小写连字符', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('保留中文字符', () => {
    expect(slugify('Nuxt 3 入门教程')).toBe('nuxt-3-入门教程')
  })

  it('去除首尾连字符', () => {
    expect(slugify('  --test--  ')).toBe('test')
  })

  it('特殊字符替换为连字符', () => {
    expect(slugify('Vue.js & React')).toBe('vue-js-react')
  })

  it('空字符串处理', () => {
    expect(slugify('')).toBe('')
  })
})

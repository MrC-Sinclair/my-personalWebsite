/**
 * @file flat-design 风格签名色板
 * @description 扁平化经典亮色的「加深变体」集合：所有承载白色文字 /
 *              白色图形的色块均校验过对比度（文字 ≥ 4.5:1，图形 ≥ 3:1）。
 *              仅作为风格签名装饰色在组件间共享，不进入 token 契约。
 */

/** 一个可安全承载白色文字/图形的扁平色 + 对应 hover 加深色 */
export interface FlatTone {
  /** 主色（默认状态） */
  main: string
  /** 加深色（hover / active 的颜色反馈） */
  deep: string
}

/**
 * 文字安全色板（白字对比 ≥ 4.5:1）：
 * 晴空蓝 / 孔雀绿 / 紫晶 / 西红柿（扁平经典四色的加深变体）
 */
export const FLAT_TONES: FlatTone[] = [
  { main: '#2471a3', deep: '#1b5a86' },
  { main: '#117a65', deep: '#0d5f4f' },
  { main: '#7d3c98', deep: '#5e2d73' },
  { main: '#b03a2e', deep: '#8c2e24' },
]

/** 按索引循环取色（纯算术，保证 SSR / 客户端渲染一致） */
export function flatTone(index: number): FlatTone {
  const n = FLAT_TONES.length
  return FLAT_TONES[((index % n) + n) % n]
}

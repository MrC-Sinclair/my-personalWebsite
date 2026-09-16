<!-- cspell:ignore bbbyyy kbbbbbbbk kbwwkwwbk kbwwwwbbk kbwwwwwbk kffffffk kffffk kwkkkwk kwkkwwk kwkwwwwkwk kwwkwwkwwk kwwwkkwwwk kwwwwwk kwwwwwwwwk kyyykkkkk kyyyyyyyyk rrrggg -->
<!--
  RetroComputerPixelIcon - 复古电脑风格的纯 CSS 像素图标
  ------------------------------------------------------------
  用 box-shadow 逐像素绘制 16×16 时代的点阵图标（每像素 2px），
  不依赖任何图片/字体文件。纯装饰元素，aria-hidden，不承载语义。

  变体：
  - flag   ：四色视窗旗帜（站点标识 / 开始按钮）
  - user   ：人像（关于窗口）
  - folder ：黄色文件夹（项目窗口）
  - doc    ：白色文档（文章窗口 / 文章条目）
  - mail   ：信封（联系窗口）
  - floppy ：软盘（欢迎窗口 / 外链条目）
-->
<template>
  <span class="rc-pxi" :style="{ width: `${spec.cols * UNIT}px`, height: `${spec.rows * UNIT}px` }">
    <i
      class="rc-pxi__px"
      :style="{ width: `${UNIT}px`, height: `${UNIT}px`, boxShadow: shadow }"
    />
  </span>
</template>

<script setup lang="ts">
/**
 * @file 复古电脑风格的像素图标组件
 * @description 像素画用字符串地图 + 调色板声明，渲染为 box-shadow 序列；
 *              计算过程纯确定性，SSR 安全。
 */
export type RetroPixelIconVariant = 'flag' | 'user' | 'folder' | 'doc' | 'mail' | 'floppy'

/** 每个像素的边长（px） */
const UNIT = 2

/** 像素画规格：字符串地图（'.' 为透明）+ 调色板 */
interface PixelSpec {
  cols: number
  rows: number
  map: string[]
  palette: Record<string, string>
}

const ICONS: Record<RetroPixelIconVariant, PixelSpec> = {
  // 四色旗帜：左上红 / 右上绿 / 左下蓝 / 右下黄
  flag: {
    cols: 6,
    rows: 6,
    map: ['rrrggg', 'rrrggg', 'rrrggg', 'bbbyyy', 'bbbyyy', 'bbbyyy'],
    palette: { r: '#c8342b', g: '#2c8c3c', b: '#2050c0', y: '#e0a81e' },
  },
  // 人像：头部 + 肩部
  user: {
    cols: 8,
    rows: 8,
    map: [
      '..kkkk..',
      '.kffffk.',
      '.kffffk.',
      '..kkkk..',
      '.kkkkkk.',
      'kffffffk',
      'kffffffk',
      'kkkkkkkk',
    ],
    palette: { k: '#0a0a0a', f: '#e9c39b' },
  },
  // 文件夹：带标签页的黄色文件夹，底部一行深黄阴影
  folder: {
    cols: 10,
    rows: 7,
    map: [
      '.kkkk.....',
      '.kyyykkkkk',
      'kyyyyyyyyk',
      'kyyyyyyyyk',
      'kyyyyyyyyk',
      'kYYYYYYYYk',
      'kkkkkkkkkk',
    ],
    palette: { k: '#0a0a0a', y: '#f5c24b', Y: '#c8963c' },
  },
  // 文档：白色页面 + 深色文字行（最后一行较短）
  doc: {
    cols: 8,
    rows: 10,
    map: [
      'kkkkkkk.',
      'kwwwwwk.',
      'kwkkkwk.',
      'kwwwwwk.',
      'kwkkkwk.',
      'kwwwwwk.',
      'kwkkkwk.',
      'kwwwwwk.',
      'kwkkwwk.',
      'kkkkkkk.',
    ],
    palette: { k: '#0a0a0a', w: '#ffffff' },
  },
  // 信封：盖口呈 V 形收拢
  mail: {
    cols: 10,
    rows: 7,
    map: [
      'kkkkkkkkkk',
      'kwwwwwwwwk',
      'kwkwwwwkwk',
      'kwwkwwkwwk',
      'kwwwkkwwwk',
      'kwwwwwwwwk',
      'kkkkkkkkkk',
    ],
    palette: { k: '#0a0a0a', w: '#ffffff' },
  },
  // 软盘：蓝色盘体 + 金属快门 + 白色标签
  floppy: {
    cols: 9,
    rows: 8,
    map: [
      'kkkkkkkkk',
      'kbwwwwwbk',
      'kbwwkwwbk',
      'kbwwwwwbk',
      'kbbbbbbbk',
      'kbwwwwbbk',
      'kbwwwwbbk',
      'kkkkkkkkk',
    ],
    palette: { k: '#0a0a0a', b: '#233a9f', w: '#e8e8e8' },
  },
}

const props = withDefaults(defineProps<{ variant?: RetroPixelIconVariant }>(), {
  variant: 'flag',
})

/** 当前变体的像素画规格 */
const spec = computed<PixelSpec>(() => ICONS[props.variant])

/** 把像素地图展开成 box-shadow 序列（每个非透明像素一段投影） */
const shadow = computed<string>(() => {
  const parts: string[] = []
  spec.value.map.forEach((row, y) => {
    row.split('').forEach((ch, x) => {
      const color = spec.value.palette[ch]
      if (color) parts.push(`${x * UNIT}px ${y * UNIT}px 0 0 ${color}`)
    })
  })
  return parts.join(', ')
})
</script>

<style scoped>
/* 图标外框：尺寸 = 列数 × 行数 × 像素边长 */
.rc-pxi {
  position: relative;
  display: inline-block;
  flex: none;
}

/* 画布原点像素：自身透明，全部像素由 box-shadow 绘出 */
.rc-pxi__px {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  background: transparent;
}
</style>

/**
 * 生成站点品牌资源（favicon / PWA 图标 / OG 分享图）
 *
 * 背景：public/ 下原本只有三张二维码，nuxt.config.ts 与 PWA manifest 指向的
 * /favicon.ico 实际不存在（@vite-pwa 的 pwaAssets 未启用，不会自动生成），
 * OG 分享图也从未产出过。本脚本一次性补齐，产物直接落到 public/。
 *
 * 用法（用托管 Node 22，sharp 0.32 在该版本下可加载）：
 *   node scripts/gen-brand-assets.mjs
 *
 * 依赖：sharp（随 @nuxt/image 装在 .pnpm 里，见下方 SHARP 解析）
 */
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')

// sharp 不是直接依赖，pnpm 严格结构下不在顶层 node_modules
const sharp = require(join(root, 'node_modules/.pnpm/sharp@0.32.6/node_modules/sharp'))

const BRAND = {
  bg: '#0b1120',
  accentFrom: '#6366f1',
  accentTo: '#22d3ee',
  name: 'Sinclair-CXP',
  tagline: '20 UI Styles · One Site',
}

/** 站点标记（favicon / 图标用）：深色圆角底 + 渐变圆点与外环 */
function markSvg(size = 64) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND.accentFrom}"/>
      <stop offset="1" stop-color="${BRAND.accentTo}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="${BRAND.bg}"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="url(#g)" stroke-width="2" stroke-opacity="0.38"/>
  <circle cx="32" cy="32" r="12" fill="url(#g)"/>
</svg>`
}

/** OG 分享图 1200×630：深底 + 渐变标题 + 副标 + 右下角标记 */
function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND.accentFrom}"/>
      <stop offset="1" stop-color="${BRAND.accentTo}"/>
    </linearGradient>
    <linearGradient id="halo" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${BRAND.accentFrom}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${BRAND.accentTo}" stop-opacity="0.25"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="${BRAND.bg}"/>
  <!-- 背景光晕：让纯色底不至于太平 -->
  <circle cx="1010" cy="120" r="260" fill="url(#halo)"/>
  <circle cx="140" cy="560" r="200" fill="url(#halo)" opacity="0.5"/>

  <!-- 顶部主色条 -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#g)"/>

  <g font-family="Segoe UI, Helvetica, Arial, sans-serif">
    <text x="96" y="150" font-size="26" font-weight="600" letter-spacing="6" fill="url(#g)">PERSONAL SITE</text>
    <text x="96" y="300" font-size="88" font-weight="800" letter-spacing="-2" fill="#f8fafc">${BRAND.name}</text>
    <text x="96" y="372" font-size="38" font-weight="500" fill="#94a3b8">${BRAND.tagline}</text>
    <text x="96" y="470" font-size="30" fill="#cbd5e1">技术博客 · 项目作品集 · 20 种 UI 风格</text>
  </g>

  <!-- 右下角站点标记 -->
  <g transform="translate(1040 470)">
    <rect width="96" height="96" rx="22" fill="#111c33"/>
    <circle cx="48" cy="48" r="30" fill="none" stroke="url(#g)" stroke-width="3" stroke-opacity="0.4"/>
    <circle cx="48" cy="48" r="18" fill="url(#g)"/>
  </g>
</svg>`
}

/** 把 PNG buffer 封装成 .ico（ICO 容器允许直接内嵌 PNG 数据） */
function pngToIco(pngBuffer, size) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(1, 4) // image count

  const entry = Buffer.alloc(16)
  entry.writeUInt8(size >= 256 ? 0 : size, 0) // width
  entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
  entry.writeUInt8(0, 2) // palette
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // color planes
  entry.writeUInt16LE(32, 6) // bpp
  entry.writeUInt32LE(pngBuffer.length, 8) // data size
  entry.writeUInt32LE(22, 12) // data offset

  return Buffer.concat([header, entry, pngBuffer])
}

async function render(svg, width, height) {
  return sharp(Buffer.from(svg), { density: 384 })
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function main() {
  await mkdir(publicDir, { recursive: true })

  // 矢量源：浏览器可直接用，也是其余尺寸的母版
  await writeFile(join(publicDir, 'favicon.svg'), markSvg(), 'utf8')

  const outputs = [
    ['favicon-32.png', 32, 32],
    ['favicon-192.png', 192, 192],
    ['favicon-512.png', 512, 512],
    ['apple-touch-icon.png', 180, 180],
  ]
  for (const [name, w, h] of outputs) {
    const buf = await render(markSvg(Math.max(w, h)), w, h)
    await writeFile(join(publicDir, name), buf)
    console.log(`✓ ${name} (${w}×${h}, ${buf.length} B)`)
  }

  // favicon.ico：32×32 PNG 内嵌进 ICO 容器
  const icoPng = await render(markSvg(64), 32, 32)
  await writeFile(join(publicDir, 'favicon.ico'), pngToIco(icoPng, 32))
  console.log(`✓ favicon.ico (32×32, ${icoPng.length + 22} B)`)

  const og = await sharp(Buffer.from(ogSvg()), { density: 144 })
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toBuffer()
  await writeFile(join(publicDir, 'og-image.png'), og)
  console.log(`✓ og-image.png (1200×630, ${og.length} B)`)
}

main().catch((error) => {
  console.error('生成失败：', error)
  process.exit(1)
})

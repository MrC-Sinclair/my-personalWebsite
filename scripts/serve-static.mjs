/**
 * 静态产物服务器（只在本地与 CI 的验证链路里用）
 * ------------------------------------------------------------
 * 为什么需要它：审计必须量**真正发布出去的那份字节**。此前 CI 的 audit job 起的是
 * `pnpm dev`，而 dev server 的 HMR 会在 DOM 里留下幽灵节点（空的重复 `<a>`、
 * 0×0 / 420×0 的链接），拿它量触控目标会出假阳性；SSG 产物里根本没有服务端，
 * nuxt 的 routeRules 也不生效。所以这里用一个纯文件服务器复刻 Caddy 的行为。
 *
 * 与生产（deploy/Caddyfile）对齐的三条语义，缺一条量到的就不是同一件事：
 *   1. 目录请求没有尾斜杠 → 308 到 `<路径>/`（Caddy 的 file_server 就是这么规范化的）
 *   2. 目录 → 该目录下的 index.html
 *   3. 未命中 → 404 且**不回落**到 index.html。写 SPA 兜底会让所有乱输的路径
 *      返回 200 + 首页，而 SEO 要求不存在的内容必须是 404 状态码。
 *
 * 用法：node scripts/serve-static.mjs <产物目录> [端口] [base 前缀]
 *   例：node scripts/serve-static.mjs .output/public 4173 /
 *   产物是挂在子路径下构建的（NUXT_APP_BASE_URL=/my-personalWebsite/）时，
 *   第三个参数必须给同样的前缀，否则页面里的资源链接全部落空。
 */
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(process.argv[2] || '.output/public')
const PORT = Number(process.argv[3] || 4173)
// 构建期的 baseURL 前缀（去掉尾斜杠统一比较）
const BASE = (process.argv[4] || '/').replace(/\/+$/, '')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
}

/**
 * 起一个复刻 Caddy 行为的静态服务器。导出给测试用（进程内监听 port 0，
 * 比 spawn 子进程去抢端口确定得多），命令行入口只在直接执行时跑。
 */
export function createStaticServer(root = ROOT, base = BASE) {
  const PREFIX = base.replace(/\/+$/, '')

  async function locate(rawPath) {
    let decoded
    try {
      decoded = decodeURIComponent(rawPath.split('?')[0].split('#')[0])
    } catch {
      // 畸形百分号编码（%zz）会让 decodeURIComponent 抛异常，按未命中处理而不是炸掉整个请求
      return { miss: true }
    }
    const query = rawPath.includes('?') ? rawPath.slice(rawPath.indexOf('?')).split('#')[0] : ''
    let rel = decoded
    if (PREFIX) {
      // 严格挂载：给了 base 前缀就必须带，否则 / 会直接命中产物根目录的 index.html，
      // 量出来的可达性与真实子路径部署不是一回事
      if (!rel.startsWith(PREFIX)) return { miss: true }
      rel = rel.slice(PREFIX.length) || '/'
    }
    // 按段解析，不碰 normalize：Windows 下 normalize('/style/x') 会把斜杠变成反斜杠，
    // 于是「剥掉前导分隔符」那步失配，残下的 '\\style\\x' 又被 resolve 当成
    // 「当前盘符的根」→ 解析到产物目录外面 → 全站 404（本机实测踩过）。
    // 自己走一遍段表，`..` 只弹栈，结构上就跳不出根目录。
    const segs = []
    for (const part of rel.split('/')) {
      if (part === '' || part === '.') continue
      if (part === '..') segs.pop()
      else segs.push(part)
    }
    const abs = resolve(root, ...segs)
    if (abs !== root && !abs.startsWith(root + sep)) return null
    let info = null
    try {
      info = await stat(abs)
    } catch {
      return { miss: true }
    }
    if (info.isDirectory()) {
      // 目录必须带尾斜杠：页面里的相对路径资源要以它为基准解析。
      // Location 用**原始**解码路径拼，不能用剥掉 base 之后的 rel——
      // 挂在子路径下部署时那样跳会把 baseURL 前缀丢干净。
      if (!decoded.endsWith('/')) return { redirect: `${decoded}/${query}` }
      const index = join(abs, 'index.html')
      return existsSync(index) ? { file: index } : { miss: true }
    }
    return { file: abs }
  }

  return createServer(async (req, res) => {
    const found = await locate(req.url || '/')
    // 无尾斜杠的目录：308 保留方法，与 Caddy 的规范化行为一致
    if (found?.redirect) {
      res.writeHead(308, { Location: found.redirect, 'Cache-Control': 'no-store' })
      res.end()
      return
    }
    if (!found?.file) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end('404 Not Found')
      return
    }
    try {
      const body = await readFile(found.file)
      res.writeHead(200, {
        'Content-Type': MIME[extname(found.file).toLowerCase()] || 'application/octet-stream',
        // 验证链路里最怕量到旧缓存
        'Cache-Control': 'no-store',
      })
      res.end(body)
    } catch {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('500 Internal Server Error')
    }
  })
}

// 只有被当成命令直接执行时才监听（被 import 时不能顺手起服务）
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createStaticServer().listen(PORT, () => {
    console.log(`静态服务：http://127.0.0.1:${PORT}${BASE}/ → ${ROOT}`)
  })
}

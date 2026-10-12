/**
 * scripts/serve-static.mjs 的契约测试
 * ------------------------------------------------------------
 * CI 的审计 job 靠这个服务器把 generate 产物起来量，它对可达性的判定直接决定
 * 「404 判据」有没有意义。所以守住四条与生产 Caddy 对齐的行为：目录 308 规范化、
 * 目录命中 index.html、未命中必须 404（不许 SPA 回落）、base 前缀严格挂载，
 * 外加越界路径不放行。
 *
 * 进程内起服务（导出工厂 + listen port 0），不 spawn 子进程：跨进程还要躲 MSYS 对
 * `/` 参数的路径转换，排查成本高。
 * 请求用 node:http 而不是 fetch——本机系统代理会劫持对 127.0.0.1 的 fetch。
 */
import { request } from 'node:http'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStaticServer } from '../scripts/serve-static.mjs'

type Res = { status: number; location?: string; body: string }

function httpGet(port: number, path: string): Promise<Res> {
  return new Promise((res, rej) => {
    const req = request({ host: '127.0.0.1', port, path, agent: false }, (r) => {
      let body = ''
      r.setEncoding('utf8')
      r.on('data', (c) => (body += c))
      r.on('end', () =>
        res({
          status: r.statusCode ?? 0,
          location: r.headers.location as string | undefined,
          body,
        }),
      )
    })
    req.setTimeout(5000, () => req.destroy(new Error('请求超时')))
    req.on('error', rej)
    // http.request() 不会自动收尾（只有 http.get 会），漏掉这一行就是
    // 「连接建立成功、请求从未发出」——服务端一个包都收不到，客户端只能等到超时
    req.end()
  })
}

async function listen(root: string, base = '/') {
  const server = createStaticServer(root, base)
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
  const port = (server.address() as { port: number }).port
  return { port, stop: () => new Promise<void>((r) => server.close(() => r())) }
}

describe('serve-static：与生产 Caddy 对齐的可达性语义', () => {
  let root: string
  // 放在产物根目录的**同级**：请求里带 `..` 时，解析只要松一点就会读到它
  let sentinel: string

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'serve-static-'))
    sentinel = join(tmpdir(), 'serve-static-outside.html')
    writeFileSync(sentinel, 'LEAKED')
    mkdirSync(join(root, 'style/swiss/blog'), { recursive: true })
    mkdirSync(join(root, 'empty-dir'), { recursive: true })
    writeFileSync(join(root, 'index.html'), '<h1>gallery</h1>')
    writeFileSync(join(root, 'style/swiss/index.html'), '<h1>home</h1>')
    writeFileSync(join(root, 'style/swiss/blog/index.html'), '<h1>blog</h1>')
  })

  afterAll(() => {
    rmSync(root, { recursive: true, force: true })
    rmSync(sentinel, { force: true })
  })

  it('目录请求无尾斜杠时 308 到规范路径，补上斜杠才给内容', async () => {
    const s = await listen(root)
    try {
      const r = await httpGet(s.port, '/style/swiss/blog')
      expect(r.status).toBe(308)
      expect(r.location).toBe('/style/swiss/blog/')
      const fixed = await httpGet(s.port, r.location as string)
      expect(fixed.status).toBe(200)
      expect(fixed.body).toContain('<h1>blog</h1>')
      // 根目录同理
      expect((await httpGet(s.port, '/')).status).toBe(200)
    } finally {
      await s.stop()
    }
  })

  it('未命中的路径必须 404，不许回落成首页', async () => {
    // SPA 兜底会让乱输的路径返回 200 + 首页：审计的 404 判据会整体失效，
    // 而 SEO 要求不存在的内容给出 404 状态码
    const s = await listen(root)
    try {
      const r = await httpGet(s.port, '/style/swiss/not-a-page')
      expect(r.status).toBe(404)
      expect(r.body).not.toContain('<h1>gallery</h1>')
      // 目录存在但没有索引页同样 404，不许列目录
      expect((await httpGet(s.port, '/empty-dir/')).status).toBe(404)
    } finally {
      await s.stop()
    }
  })

  it('给了 base 前缀就严格挂载，且 308 的 Location 保留前缀', async () => {
    const s = await listen(root, '/my-personalWebsite')
    try {
      const hit = await httpGet(s.port, '/my-personalWebsite/style/swiss/blog/')
      expect(hit.status).toBe(200)
      expect(hit.body).toContain('<h1>blog</h1>')
      // 不带前缀不能命中产物根目录，否则量到的可达性与子路径部署不是一回事
      expect((await httpGet(s.port, '/')).status).toBe(404)
      const redirect = await httpGet(s.port, '/my-personalWebsite/style/swiss/blog')
      expect(redirect.location).toBe('/my-personalWebsite/style/swiss/blog/')
    } finally {
      await s.stop()
    }
  })

  it('越界路径一律 404，读不到产物根目录之外的哨兵文件', async () => {
    const s = await listen(root)
    try {
      // 百分号编码里的 %2f 会被拼写检查切成 "fserve" 这种碎片，这里只对本行放行
      // cspell:ignore fserve
      for (const path of [
        '/../serve-static-outside.html',
        '/%2e%2e/serve-static-outside.html',
        '/%2e%2e%2fserve-static-outside.html',
        '/style/swiss/blog/../../../../serve-static-outside.html',
      ]) {
        const r = await httpGet(s.port, path)
        expect(r.status).toBe(404)
        expect(r.body).not.toContain('LEAKED')
      }
    } finally {
      await s.stop()
    }
  })
})

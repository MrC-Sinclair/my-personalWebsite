/**
 * deploy-site.sh 的部署契约（结构性测试）
 * ------------------------------------------------------------
 * 脚本只在轻量云实例上执行，本机没有对应环境，因此这里守的是「关键不变量」，
 * 防止再次出现 2026-11-07 那种「覆盖错目录 / 只验 HTML / 资产名写错」的回归。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const script = readFileSync(resolve(process.cwd(), 'scripts/deploy-site.sh'), 'utf8')

describe('一键部署脚本契约', () => {
  it('写入 Caddy 的真实 web 根 /srv/site，且不再出现过时目录', () => {
    expect(script).toContain("WEB_ROOT='/srv/site'")
    expect(script).not.toContain('/usr/share/caddy')
  })

  it('从 cvm-latest release 取 site-cvm.tar.gz，并走可直连的 api.github.com', () => {
    expect(script).toContain("RELEASE_TAG='cvm-latest'")
    expect(script).toContain("RELEASE_ASSET='site-cvm.tar.gz'")
    expect(script).toContain('https://api.github.com/repos/')
    expect(script).toContain("'Accept: application/octet-stream'")
  })

  it('下载带断点续传与按字节数校验，压缩包也会预检', () => {
    expect(script).toContain('-C -')
    expect(script).toContain('$actual" = "$expected"')
    expect(script).toContain('tar -tzf')
  })

  it('覆盖前先做产物完整性门禁并备份', () => {
    expect(script).toContain('产物缺文件')
    expect(script).toContain('产物缺 _nuxt 静态目录')
    expect(script).toContain('备份失败，拒绝覆盖')
    expect(script).toContain('cp -r "$EXTRACT/." "$WEB_ROOT/"')
  })

  it('验证阶段探测新构建的 _nuxt 资源，而不是只测 HTML', () => {
    expect(script).toContain("grep -o '/_nuxt/")
    expect(script).toContain('probe "$new_js"')
    expect(script).toContain("probe '/sitemap.xml'")
  })

  it('支持 dry-run 与额外探测路径', () => {
    expect(script).toContain('--dry-run')
    expect(script).toContain('EXTRA_PATHS')
  })
})

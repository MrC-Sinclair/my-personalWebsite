/**
 * scripts/publish-cvm.mjs 的契约测试
 * ------------------------------------------------------------
 * 这个脚本要往生产机上写文件并重建容器，跑错了代价是「线上新产物不生效」，
 * 所以守住四件事：站点根目录识别、本地路径写法、解包不碰 inode、配置自举幂等。
 */
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  siteRootCandidates,
  resolveSiteRoot,
  normalizeInputPath,
  windowsToPosix,
  remoteActivateScript,
  remoteBootstrapScript,
} from '../scripts/publish-cvm.mjs'

describe('publish-cvm：站点根目录识别', () => {
  it('artifact 解压成站点根本身时直接命中', () => {
    const dir = mkdtempSync(join(tmpdir(), 'site-root-'))
    writeFileSync(join(dir, 'index.html'), '<html></html>')
    expect(resolveSiteRoot(siteRootCandidates(dir))).toBe(dir)
    rmSync(dir, { recursive: true, force: true })
  })

  it('zip 保留了 public 父目录时也能找到', () => {
    const dir = mkdtempSync(join(tmpdir(), 'site-public-'))
    mkdirPublicIndex(dir)
    expect(resolveSiteRoot(siteRootCandidates(dir))).toBe(join(dir, 'public'))
    rmSync(dir, { recursive: true, force: true })
  })

  it('哪层都没有 index.html 时报错并列出全部候选', () => {
    const dir = mkdtempSync(join(tmpdir(), 'site-empty-'))
    expect(() => resolveSiteRoot(siteRootCandidates(dir))).toThrow(/index\.html/)
    expect(() => resolveSiteRoot(siteRootCandidates(dir))).toThrow(dir)
    rmSync(dir, { recursive: true, force: true })
  })
})

describe('publish-cvm：本地路径写法', () => {
  it('盘符路径能转成 GNU tar 认的 /x 形态', () => {
    // Git Bash 的 GNU tar 把 `D:\x` 的 `D:` 当远程主机名，实测报 resolve failed
    expect(windowsToPosix('D:\\Temp\\site.tar.gz')).toBe('/d/Temp/site.tar.gz')
    expect(windowsToPosix(join('C:', 'Users', 'me', '.ssh', 'key'))).toBe('/c/Users/me/.ssh/key')
  })

  it('没有盘符的路径不受影响', () => {
    expect(windowsToPosix('/tmp/site.tar.gz')).toBe('/tmp/site.tar.gz')
  })

  it('相对产物目录按当前工作目录解析', () => {
    expect(normalizeInputPath('.output/public')).toBe(resolve('.output', 'public'))
  })

  it.runIf(process.platform === 'win32')(
    'Git Bash 传进来的 /d/... 形态还原成原生路径，而不是当成当前盘下的子目录',
    () => {
      expect(normalizeInputPath('/d/Temp/site-cvm')).toBe(join('D:', 'Temp', 'site-cvm'))
    },
  )
})

describe('publish-cvm：生效步骤', () => {
  const script = remoteActivateScript()

  it('必须原地解包：不允许 rm -rf 产物目录（bind mount 的 inode 会失效）', () => {
    expect(script).not.toMatch(/rm\s+-rf/)
    expect(script).toContain('tar -xzf')
  })

  it('解完必须 force-recreate，否则容器仍是旧配置与旧挂载', () => {
    expect(script).toMatch(/up -d --force-recreate caddy/)
  })

  it('解包目标与 compose 里的挂载点一致', () => {
    expect(script).toMatch(/-C \S*\/dist\/site$/m)
    expect(script).toContain('/root/personal-web/deploy')
  })
})

describe('publish-cvm：首次自举', () => {
  const script = remoteBootstrapScript('203.0.113.9')

  it('证书只在缺失时生成，重复执行不会覆盖已有证书', () => {
    expect(script).toContain('if [ ! -f')
    expect(script).toContain('certs/site.crt')
  })

  it('subjectAltName 用的是传入的 IP（裸 IP 访问要 SAN 命中才不发错证书）', () => {
    expect(script).toContain('subjectAltName=IP:203.0.113.9')
  })

  it('set -euo pipefail：任一步失败就退出，不能半配置状态继续', () => {
    expect(script).toMatch(/^set -euo pipefail/)
  })
})

/** 造一个 <dir>/public/index.html，模拟 zip 保留父目录的形态 */
function mkdirPublicIndex(dir: string) {
  const pub = join(dir, 'public')
  mkdirSync(pub, { recursive: true })
  writeFileSync(join(pub, 'index.html'), '<html></html>')
}

/**
 * scripts/publish-cvm.mjs 的契约测试
 * ------------------------------------------------------------
 * 这个脚本要往生产机上写文件并重建容器，跑错了代价是「线上新产物不生效」，
 * 所以守住四件事：站点根目录识别、本地路径写法、解包不碰 inode、配置自举幂等。
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  siteRootCandidates,
  resolveSiteRoot,
  normalizeInputPath,
  localPathFor,
  releaseApiUrl,
  releaseDownloadUrl,
  localPathFor,
  toShellPath,
  assertTarballOk,
  windowsToPosix,
  remoteActivateScript,
  remoteBootstrapScript,
} from '../scripts/publish-cvm.mjs'

describe('publish-cvm：产物来源', () => {
  it('元数据走 api.github.com，不走 github.com', () => {
    // 固定 tag 才能被 CI 反复覆盖；host 必须是 api —— 实测本机对 github.com
    // 的直连会 SYN 黑洞（21 秒超时），而 api.github.com 全程可达
    expect(releaseApiUrl('some-owner/some-repo')).toBe(
      'https://api.github.com/repos/some-owner/some-repo/releases/tags/cvm-latest',
    )
  })

  it('第一条路是不占 API 配额的 Release 直链', () => {
    // 匿名配额 60 次/小时会被用尽（实测 403 rate limit exceeded），
    // 所以先试直链，API 端点只作退路
    expect(releaseDownloadUrl('some-owner/some-repo')).toBe(
      'https://github.com/some-owner/some-repo/releases/download/cvm-latest/site-cvm.tar.gz',
    )
  })

  it('完整的 tar.gz 能过完整性门禁并数出条目', () => {
    const { dir, tgz } = makeTarball()
    expect(assertTarballOk(tgz)).toBeGreaterThanOrEqual(2)
    rmSync(dir, { recursive: true, force: true })
  })

  it('被截断的包必须挡住：宁可不上线，也不能把半套站点推上去', () => {
    const { dir, tgz } = makeTarball()
    // 截掉尾部：这就是实测发生过的形态（17.6 MB 只收到 8.4 MB）
    writeFileSync(tgz, readFileSync(tgz).subarray(0, Math.floor(statSync(tgz).size / 2)))
    expect(() => assertTarballOk(tgz)).toThrow(/拒绝上传/)
    rmSync(dir, { recursive: true, force: true })
  })
})

/** 造一个含两个文件的 tar.gz，供完整性门禁用例使用 */
function makeTarball() {
  const dir = mkdtempSync(join(tmpdir(), 'site-tar-'))
  const src = join(dir, 'src')
  mkdirSync(join(src, '_nuxt'), { recursive: true })
  writeFileSync(join(src, 'index.html'), '<html></html>')
  writeFileSync(join(src, '_nuxt', 'a.js'), 'x')
  const tgz = join(dir, 'site.tar.gz')
  // 走 windowsToPosix：这台机器上是 GNU tar，给它 D:\ 形态会当成远程主机名解析失败
  const r = spawnSync('tar', ['-czf', windowsToPosix(tgz), '-C', windowsToPosix(src), '.'], {
    encoding: 'utf8',
  })
  if (r.status !== 0) throw new Error(`构造测试用 tar 失败：${r.stderr}`)
  return { dir, tgz }
}

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
  it('curl 拿原生路径 —— node 的 spawn 不做 bash 那层 MSYS 路径翻译', () => {
    // 实测：给 mingw 版 curl 传 /d/Temp/x，它以退出码 23（write error）收场，
    // 而 -w 已经打出了 HTTP 200 —— 成功和失败两头都能骗人
    const native = join(tmpdir(), 'x.bin')
    expect(localPathFor('curl', native)).toBe(native)
  })

  it('tar 走 shell 形态（GNU tar 把 D:\\ 当远程主机名）', () => {
    const native = join(tmpdir(), 'x.tar.gz')
    expect(localPathFor('tar', native)).toBe(toShellPath(native))
  })

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

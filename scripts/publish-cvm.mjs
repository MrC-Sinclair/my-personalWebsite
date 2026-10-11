/**
 * 发布到腾讯云 CVM（上传产物 → 原地覆盖 → 重建 Caddy 容器）
 * ------------------------------------------------------------
 * 为什么需要这个脚本：本站产物只能由 GitHub Actions 生成 ——
 * 服务器是 2C2G，在上面跑 `nuxt generate` 会 OOM；本机 Windows 跑 generate
 * 又是「CPU 空转十几分钟零产物」。于是链路固定为：
 *   CI 构建 → 本脚本拉 Release 资产（--latest）→ 上传 → 原地覆盖 → 重建容器
 * 脚本本身不构建，只做「取产物 + 搬运 + 让配置生效 + 验证」，
 * 凭据全部走本机 SSH 私钥与免鉴权的公开 Release，仓库里不留任何密钥。
 *
 * 用法：
 *   node scripts/publish-cvm.mjs --latest        # 拉 CI 最新发布产物（免鉴权 Release 资产）
 *   node scripts/publish-cvm.mjs <产物目录>       # 用手头已解压的产物
 *   环境变量（都有默认值，一般不用传）：
 *     CVM_HOST=122.51.97.106  CVM_USER=root  CVM_PORT=22
 *     CVM_KEY=~/.ssh/cvm_deploy_rsa   SITE_REPO=MrC-Sinclair/my-personalWebsite
 *     DRY_RUN=1  只打印将要执行的命令，不连服务器
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HOST = process.env.CVM_HOST || '122.51.97.106'
const USER = process.env.CVM_USER || 'root'
const PORT = process.env.CVM_PORT || '22'
const KEY = (process.env.CVM_KEY || join(homedir(), '.ssh', 'cvm_deploy_rsa')).replace(
  /^~/,
  homedir(),
)
/** 服务器上的项目目录，与 mychat(/root/mychat)、jintian(/root/jintian) 平级 */
const REMOTE_BASE = '/root/personal-web'
const REMOTE_DEPLOY = `${REMOTE_BASE}/deploy`
/** 产物解包目标：compose 里以 :ro bind mount 到容器 /srv/site */
const REMOTE_SITE = `${REMOTE_DEPLOY}/dist/site`
const REMOTE_TARBALL = `${REMOTE_DEPLOY}/dist/site.tar.gz`
const LOCAL_TARBALL = join(tmpdir(), 'personal-web-site.tar.gz')
/** 状态码探测时丢弃响应体的落点（curl 需要真实可写路径，见 httpCode 注释） */
const PROBE_OUT = join(tmpdir(), 'personal-web-probe.out')
/**
 * 产物来源之一：CI 的 release job 把 tar.gz 固定发到 cvm-latest 这个 tag。
 * 之所以走 Release 而不是 Actions artifact —— artifact 下载接口即使仓库公开也要鉴权
 * （实测匿名 401），而 Release 资产免鉴权，`--latest` 才能做到不打开浏览器。
 */
const RELEASE_TAG = 'cvm-latest'
const RELEASE_ASSET = 'site-cvm.tar.gz'
const REPO = process.env.SITE_REPO || 'MrC-Sinclair/my-personalWebsite'
const RELEASE_DIR = join(tmpdir(), 'personal-web-site-latest')

/**
 * ★ 本地路径写法必须跟着工具链走，否则会静默失败：
 * Git Bash 的 GNU tar 把 `D:\x` 里的 `D:` 当成远程主机解析，实测报
 * `Cannot connect to D: resolve failed`；而 Windows 自带的 bsdtar 只认 Windows 路径。
 * 用哪套 tar 由 PATH 决定（tar/scp/ssh 来自同一个 shell），所以探一次版本，全程统一。
 */
const GNU_TAR = (() => {
  if (process.platform !== 'win32') return false
  // 探测不到版本时按原生 Windows 路径处理：这只是选写法，不该中断发布
  const out = spawnSync('tar', ['--version'], { encoding: 'utf8' }).stdout || ''
  return /GNU tar/.test(out)
})()

/** 纯转换：D:\\Temp\\x → /d/Temp/x（平台无关，便于单测） */
export function windowsToPosix(p) {
  return p.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_m, d) => `/${d.toLowerCase()}`)
}

/** Windows 路径转 Git Bash 形式；非 win32 或非 GNU tar 场景原样返回 */
export function toShellPath(p) {
  if (process.platform !== 'win32' || !GNU_TAR) return p
  return windowsToPosix(p)
}

/**
 * ★ 本地路径必须**按工具**给形态，不能一刀切：
 * 这台机器的 PATH 里 `D:\code\Git\usr\bin` 在前，但只有 tar/ssh/scp 在那儿，
 * `curl` 实际来自 `D:\code\Git\mingw64\bin`，是原生 Windows 版（--version 报
 * x86_64-w64-mingw32）。bash 交互执行时 MSYS 会自动把 `/d/x` 翻译成 `D:\x`
 * 再交给原生程序，**node 的 spawnSync 不做这层翻译** ——
 * 于是给 curl 传 POSIX 路径，curl 报退出码 23（write error）：
 * 实测 `-o /d/Temp/x` 写 0 字节但 `-w` 照样打出 HTTP 200，
 * 看起来像「下载失败」又像「站点 200」，两头都能骗人。
 */
const POSIX_PATH_BINS = new Set(['tar', 'ssh', 'scp'])

export function localPathFor(bin, p) {
  return POSIX_PATH_BINS.has(bin) ? toShellPath(p) : p
}

/**
 * 归一化命令行传入的产物目录：Git Bash 给的是 `/c/Users/...`，
 * 而 node 在 win32 上会把它解释成「当前盘根下的 c/Users/...」，必须显式还原。
 */
export function normalizeInputPath(raw) {
  const withHome = raw.startsWith('~/') ? join(homedir(), raw.slice(2)) : raw
  const drive = withHome.match(/^\/([a-zA-Z])\/(.*)$/)
  if (drive) return resolve(`${drive[1].toUpperCase()}:\\${drive[2].replace(/\//g, '\\')}`)
  return resolve(withHome)
}

/**
 * 在解压产物里定位真正的站点根目录。
 * upload-artifact@v4 打的 zip 会把公共父目录剥掉，所以解压出来通常就是站点根本身；
 * 但若构建时 path 写成 `.output/public/**` 之外带上父级，就会出现 `public/` 子目录。
 * 两种形态都接住，认不出再报错，别让脚本静默上传半套东西。
 */
export function resolveSiteRoot(candidates) {
  const hit = candidates.find((dir) => existsSync(join(dir, 'index.html')))
  if (!hit) {
    throw new Error(`没找到站点根目录（以下路径都没有 index.html）：\n  ${candidates.join('\n  ')}`)
  }
  return hit
}

/** 由命令行给的路径推出候选站点根目录列表 */
export function siteRootCandidates(source) {
  const root = resolve(source)
  return [root, join(root, 'public'), join(root, 'site'), join(root, '.output', 'public')]
}

/**
 * 首次上线需要自举的远端目录与配置文件。
 * 证书只在服务器生成、不进仓库，所以每次发布都判一次存在性。
 */
export function remoteBootstrapScript(ip) {
  return [
    'set -euo pipefail',
    `mkdir -p ${REMOTE_DEPLOY}/dist/site ${REMOTE_DEPLOY}/certs`,
    // 自签证书缺失时生成一张（ACME 不给裸 IP 签证书，只能自签）
    `if [ ! -f ${REMOTE_DEPLOY}/certs/site.crt ]; then`,
    '  openssl req -x509 -newkey rsa:2048 -sha256 -days 825 -nodes \\',
    `    -keyout ${REMOTE_DEPLOY}/certs/site.key -out ${REMOTE_DEPLOY}/certs/site.crt \\`,
    `    -subj "/CN=personal-web-cvm" -addext "subjectAltName=IP:${ip},DNS:localhost"`,
    'fi',
  ].join('\n')
}

/**
 * 生效步骤：解包 + 重建容器。
 * ⚠️ 这里刻意**不删** dist/site 再解包：它是容器的 :ro bind mount，
 * 删目录重建 inode 后容器仍指向旧 inode，新产物会完全不生效（jintian 实测踩过）。
 * tar 原地覆盖可以避开这个问题，所以脚本里不允许出现 rm -rf。
 */
export function remoteActivateScript() {
  return [
    'set -euo pipefail',
    `cd ${REMOTE_DEPLOY}`,
    `tar -xzf ${REMOTE_TARBALL} -C ${REMOTE_SITE}`,
    'docker compose -f docker-compose.deploy.yml up -d --force-recreate caddy',
    'docker ps --filter name=personal-web --format "{{.Names}} {{.Status}}"',
  ].join('\n')
}

function run(cmd, args, opts = {}) {
  if (process.env.DRY_RUN === '1') {
    console.log(`[dry-run] ${cmd} ${args.join(' ')}`)
    return { status: 0, stdout: '' }
  }
  const res = spawnSync(cmd, args, { encoding: 'utf8', stdio: 'inherit', ...opts })
  if (res.status !== 0) {
    throw new Error(`${cmd} 执行失败（退出码 ${res.status ?? 'signal'}）`)
  }
  return res
}

const SSH_ARGS = [
  '-i',
  toShellPath(KEY),
  '-p',
  PORT,
  '-o',
  'BatchMode=yes',
  '-o',
  'ConnectTimeout=15',
]

function sshRemote(script) {
  return run('ssh', [
    ...SSH_ARGS,
    '-o',
    'StrictHostKeyChecking=accept-new',
    `${USER}@${HOST}`,
    script,
  ])
}

/**
 * 线上验证：抓几个代表路径的状态码。
 * curl 加 --noproxy 是因为系统代理会干扰（实测 502），到自己的服务器应该直连。
 * 必须 200 的是路由与 sitemap；PWA 那两个只做通报 —— 自签证书下 Service Worker
 * 能不能注册取决于浏览器是否接受这张证书，不属于「发布失败」。
 *
 * ⚠️ 用 spawnSync 而不是 execFileSync：实测 curl 会**先把 -w 的状态码打出来、
 * 再以 28（超时）退出**，execFileSync 会在拿到答案之前就抛异常，
 * 把「线上其实 200」误报成发布失败。
 */
function httpCode(path) {
  const r = spawnSync(
    'curl',
    [
      '-k',
      '-s',
      // 不能用 /dev/null：原生 Windows curl 打不开它，会在拿到 200 之后
      // 以退出码 23（write error）收场，把成功报成失败
      '-o',
      localPathFor('curl', PROBE_OUT),
      '--noproxy',
      '*',
      '-m',
      '25',
      '-w',
      '%{http_code}',
      `https://${HOST}:8444${path}`,
    ],
    { encoding: 'utf8' },
  )
  const code = (r.stdout || '').trim()
  return /^\d{3}$/.test(code) ? code : '000'
}

function verify(required, optional) {
  if (process.env.DRY_RUN === '1') return
  console.log('\n线上状态码：')
  const bad = []
  for (const p of required) {
    const code = httpCode(p)
    console.log(`  ${code} ${p}`)
    if (code !== '200') bad.push(`${code} ${p}`)
  }
  for (const p of optional) console.log(`  ${httpCode(p)} ${p}（PWA，通报）`)
  if (bad.length) {
    throw new Error(
      `有路径不是 200：\n  ${bad.join('\n  ')}\n` +
        '先判据再动手：截图空白/状态异常时，用 .workbuddy/eval-url.mjs 读 DOM，' +
        '别急着重构产物。',
    )
  }
}

/**
 * --latest：拉最近一次构建的 Release 资产并解包，返回解出来的站点根目录。
 *
 * ★ 三条都是实测出来的约束：
 *   1. 连接会在中途断（17.6 MB 只收到 8.4 MB 就停）⇒ 必须 `-C -` 续传，
 *      且**验完包再上传**：截断的 tar 解出来是半套站点，比不发布更糟；
 *   2. 两个 host 各有独立的失败方式 —— `github.com` 在这台机器上会 SYN 黑洞
 *      （21 秒超时），`api.github.com` 稳定但匿名配额只有 60 次/小时
 *      （轮询 CI 状态时就把配额用光过，报 403 rate limit exceeded）
 *      ⇒ 先走 API 端点（稳定，且能拿到期望字节数，完成判定精确），
 *        配额被吃掉时退到不占配额的 Release 直链；
 *   3. 403 / 404 这类错误重试没有意义 ⇒ 立刻换路或收手，不要空转十轮。
 */
function fetchLatest() {
  const downloaded = join(tmpdir(), 'personal-web-download.tar.gz')
  // 顺序按「这台机器上哪条路真的通」排：api.github.com 稳定且能给出期望字节数
  // （完成判定精确），直链不占配额但经常 SYN 黑洞 —— 所以直链只作配额耗尽时的退路。
  const routes = []
  try {
    const meta = releaseMeta()
    routes.push({
      label: 'API 资产端点',
      url: meta.url,
      want: meta.size,
      headers: [`Accept: application/octet-stream`],
    })
  } catch (e) {
    console.warn(`⚠️ 读 Release 元数据失败，改走直链：${e.message}`)
  }
  routes.push({ label: 'Release 直链', url: releaseDownloadUrl(), want: 0, headers: [] })

  let last = ''
  for (const route of routes) {
    console.log(`拉取产物（${route.label}）：${route.url}`)
    rmSync(downloaded, { force: true })
    try {
      downloadAsset(route, downloaded)
      const entries = assertTarballOk(downloaded)
      console.log(`产物包完整：${entries} 个条目`)
      rmSync(RELEASE_DIR, { recursive: true, force: true })
      mkdirSync(RELEASE_DIR, { recursive: true })
      run('tar', ['-xzf', toShellPath(downloaded), '-C', toShellPath(RELEASE_DIR)])
      return RELEASE_DIR
    } catch (e) {
      last = e.message
      console.warn(`⚠️ ${route.label} 失败：${last}`)
    }
  }
  throw new Error(`两条下载路都失败，放弃发布：${last}`)
}

/** Release 直链：不占 API 配额，但这台机器上可能连不上 */
export function releaseDownloadUrl(repo = REPO, tag = RELEASE_TAG, asset = RELEASE_ASSET) {
  return `https://github.com/${repo}/releases/download/${tag}/${asset}`
}

/** Release 元数据端点（api 主机，稳定但要算配额） */
export function releaseApiUrl(repo = REPO, tag = RELEASE_TAG) {
  return `https://api.github.com/repos/${repo}/releases/tags/${tag}`
}

/** 读 Release 元数据。用 HTTP 状态码判定，而不是 curl 退出码 —— 403 时也要说清是配额 */
function releaseMeta() {
  const r = spawnSync(
    'curl',
    [
      '-s',
      '-L',
      '-m',
      '30',
      '-w',
      '\n%{http_code}',
      '-H',
      'Accept: application/vnd.github+json',
      releaseApiUrl(),
    ],
    { encoding: 'utf8' },
  )
  const out = r.stdout || ''
  const code = out.slice(out.lastIndexOf('\n') + 1).trim()
  if (code !== '200') {
    throw new Error(
      `HTTP ${code}（读 ${RELEASE_TAG} 元数据）。` +
        '403 多半是匿名配额 60 次/小时用尽，等复位再试；也可能是还没发布',
    )
  }
  const j = JSON.parse(out.slice(0, out.lastIndexOf('\n')))
  const asset = (j.assets || []).find((a) => a.name === RELEASE_ASSET)
  if (!asset) throw new Error(`Release ${RELEASE_TAG} 里没有 ${RELEASE_ASSET}`)
  return { url: asset.url, size: Number(asset.size) || 0 }
}

/** 重试没有意义的 HTTP 码：配额/权限、不存在、被封 */
const FATAL_HTTP = ['403', '404', '451']

/**
 * 断点续传下载。want>0 时按字节数判定完成；
 * want=0（直链不知道长度）时以「tar 索引能读通」为完成条件，读不通就再来一轮。
 */
function downloadAsset({ url, want = 0, headers = [] }, dest) {
  const H = headers.flatMap((h) => ['-H', h])
  for (let i = 1; i <= 10; i++) {
    const have = existsSync(dest) ? statSync(dest).size : 0
    if (want > 0 && have >= want) return
    if (want === 0 && readTarballEntries(dest) > 0) return
    const r = spawnSync(
      'curl',
      [
        '-s',
        '-L',
        // 连接阶段单独设短超时：github.com 被 SYN 黑洞时不设 --connect-timeout
        // 会由 -m 300 兜着，十轮就是 50 分钟空等
        '--connect-timeout',
        '20',
        '-m',
        '300',
        '-C',
        '-',
        '-o',
        localPathFor('curl', dest),
        '-w',
        '%{http_code}',
        ...H,
        url,
      ],
      { encoding: 'utf8' },
    )
    const code = (r.stdout || '').trim().slice(-3)
    const now = existsSync(dest) ? statSync(dest).size : 0
    console.log(`  第 ${i} 轮：${now}${want ? '/' + want : ''} 字节，HTTP ${code}`)
    if (FATAL_HTTP.includes(code)) throw new Error(`HTTP ${code}，重试无意义`)
  }
  const now = existsSync(dest) ? statSync(dest).size : 0
  throw new Error(`下载未完成：${now}${want ? '/' + want : ''} 字节`)
}

/** tar 索引条目数；读不通返回 0（截断的包就是这里露馅） */
function readTarballEntries(file) {
  if (!existsSync(file)) return 0
  const r = spawnSync('tar', ['-tzf', toShellPath(file)], { encoding: 'utf8' })
  if (r.status !== 0) return 0
  return (r.stdout || '').split('\n').filter(Boolean).length
}

/** 上传前的完整性门禁：tar 索引读不动就说明包被截断，绝不能把半套站点推上线 */
export function assertTarballOk(file) {
  const entries = readTarballEntries(file)
  if (entries === 0) {
    throw new Error(`产物包不完整，拒绝上传：${file}`)
  }
  return entries
}

function main() {
  const source = process.argv[2]
  if (!source) {
    console.error('用法：node scripts/publish-cvm.mjs --latest | <解压后的产物目录>')
    process.exit(1)
  }
  let resolved
  if (source === '--latest') {
    if (process.env.DRY_RUN === '1') {
      console.log(`[dry-run] 将拉取 ${releaseApiUrl()} 描述的产物并解包后发布`)
      return
    }
    resolved = fetchLatest()
  } else {
    resolved = normalizeInputPath(source)
  }
  const siteRoot = resolveSiteRoot(siteRootCandidates(resolved))
  console.log(`站点根目录：${siteRoot}`)

  // sw.js / manifest 缺失意味着 PWA 离线不会生效，属于「能上线但功能不全」，提醒不阻断
  for (const f of ['sw.js', 'manifest.webmanifest', 'sitemap.xml', '_nuxt']) {
    if (!existsSync(join(siteRoot, f))) console.warn(`⚠️ 产物里缺少 ${f}`)
  }

  if (process.env.DRY_RUN !== '1') {
    run('tar', ['-czf', toShellPath(LOCAL_TARBALL), '-C', toShellPath(siteRoot), '.'])
    console.log(`产物包：${LOCAL_TARBALL}`)
  }

  // 配置文件每次覆盖：改了 Caddyfile / compose 不必单独记一次上传步骤
  const localDeploy = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'deploy')
  sshRemote(`mkdir -p ${REMOTE_BASE}`)
  const scpArgs = ['-i', toShellPath(KEY), '-P', PORT, '-o', 'BatchMode=yes']
  for (const file of ['Caddyfile', 'docker-compose.deploy.yml']) {
    run('scp', [
      ...scpArgs,
      toShellPath(join(localDeploy, file)),
      `${USER}@${HOST}:${REMOTE_DEPLOY}/`,
    ])
  }
  run('scp', [...scpArgs, toShellPath(LOCAL_TARBALL), `${USER}@${HOST}:${REMOTE_TARBALL}`])

  sshRemote(remoteBootstrapScript(HOST))
  sshRemote(remoteActivateScript())

  verify(
    ['/', '/style/y2k/', '/style/y2k/blog/', '/en/', '/sitemap.xml'],
    ['/sw.js', '/manifest.webmanifest'],
  )
  console.log(`\n完成：https://${HOST}:8444/`)
}

// 只有直接执行时才跑 main()，被测试 import 时不产生副作用
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}

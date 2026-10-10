/**
 * 发布到腾讯云 CVM（上传产物 → 原地覆盖 → 重建 Caddy 容器）
 * ------------------------------------------------------------
 * 为什么需要这个脚本：本站产物只能由 GitHub Actions 生成 ——
 * 服务器是 2C2G，在上面跑 `nuxt generate` 会 OOM；本机 Windows 跑 generate
 * 又是「CPU 空转十几分钟零产物」。于是链路固定为：
 *   CI 构建 → 浏览器下载 artifact zip → 本脚本上传并生效
 * 脚本本身不构建，只做「搬运 + 让配置生效 + 验证」，凭据全部走本机 SSH 私钥，
 * 仓库里不留任何密钥。
 *
 * 用法：
 *   node scripts/publish-cvm.mjs <解压后的产物目录>
 *   环境变量（都有默认值，一般不用传）：
 *     CVM_HOST=122.51.97.106  CVM_USER=root  CVM_PORT=22
 *     CVM_KEY=~/.ssh/cvm_deploy_rsa
 *     DRY_RUN=1  只打印将要执行的命令，不连服务器
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
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
 * 线上验证：抓几个代表路径的状态码。curl 加 --noproxy 是因为系统代理会干扰（实测 502）。
 * 必须 200 的是路由与 sitemap；PWA 那两个只做通报 —— 自签证书下 Service Worker
 * 能不能注册取决于浏览器是否接受这张证书，不属于「发布失败」。
 */
function httpCode(path) {
  return execFileSync(
    'curl',
    [
      '-k',
      '-s',
      '-o',
      '/dev/null',
      '--noproxy',
      '*',
      '-m',
      '20',
      '-w',
      '%{http_code}',
      `https://${HOST}:8444${path}`,
    ],
    { encoding: 'utf8' },
  ).trim()
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

function main() {
  const source = process.argv[2]
  if (!source) {
    console.error('用法：node scripts/publish-cvm.mjs <解压后的产物目录>')
    process.exit(1)
  }
  const siteRoot = resolveSiteRoot(siteRootCandidates(normalizeInputPath(source)))
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

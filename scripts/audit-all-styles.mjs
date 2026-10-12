/**
 * 全量风格审计（CDP）
 * ------------------------------------------------------------
 * 只抽 5~6 个风格就下「其余不受影响」的结论是**推断不是实测**——
 * 2026-10-10 正是因为这样漏掉了 terminal 的 MOTD 数字错误。
 * 这个脚本把 20 个风格全跑一遍，查三件静态检查抓不到的事：
 *
 *   1. 渲染是否真的成功（innerText 有内容；空白页 = 有问题）
 *   2. 有没有把 i18n key 名当文案显示出来（t() 找不到 key 的静默失效）
 *   3. 统计数字是否与内容真实数量一致（收录项目后该跟着变）
 *
 * 用法：
 *   MSYS_NO_PATHCONV=1 NO_PROXY=127.0.0.1,localhost \
 *     node scripts/audit-all-styles.mjs [baseURL] [等待毫秒]
 *   LOCALE=en 审英文站（路径带 /en 前缀）
 *   PAGES=index,projects 指定页面（默认 index）
 *   CDP_PORT 默认 9222
 */
const BASE = process.argv[2] || 'https://mrc-sinclair.github.io/my-personalWebsite'
const WAIT = Number(process.argv[3] || 8000)
const CDP_PORT = process.env.CDP_PORT || '9222'
const LOCALE_PREFIX = process.env.LOCALE === 'en' ? '/en' : ''
const PAGES = (process.env.PAGES || 'index').split(',')

const STYLES = [
  'minimalism', 'liquid-glass', 'metro', 'swiss', 'flat-design',
  'glassmorphism', 'claymorphism', 'neumorphism', 'cyberpunk', 'editorial',
  'neo-brutalism', 'soft-3d', 'sci-fi-hud', 'skeuomorphism', 'web2-glossy',
  'retro-computer', 'dashboard', 'pixel', 'terminal', 'y2k',
]

const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json()
const target = list.find((t) => t.type === 'page')
const ws = new WebSocket(target.webSocketDebuggerUrl)
let seq = 0
const pending = new Map()

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
})
await new Promise((r) => ws.addEventListener('open', r))

function send(method, params = {}) {
  const id = ++seq
  ws.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP 超时: ${method}`)), 40000)
    pending.set(id, (m) => {
      clearTimeout(timer)
      m.error ? reject(new Error(method + ': ' + JSON.stringify(m.error))) : resolve(m.result)
    })
  })
}

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1280, height: 900, deviceScaleFactor: 1, mobile: false,
})

/** i18n 前缀：这些出现在可见文本里，基本就是 t() 找不到 key 把 key 名露出来了 */
const KEY_LEAK_SRC = '\\b(?:blog|common|about|projects|home|nav|contact|styles)\\.[a-zA-Z][a-zA-Z0-9]*'
/**
 * 统计数字：紧挨着「项目/作品/文章/篇/Works/Posts」的数字。
 * ⚠️ 必须排除两类假匹配（2026-10-11 实测踩到）：
 *   ① 实时时钟 —— retro-computer 的「01:49」后面恰好跟着「项目」，
 *      会被 `\d+\s*项目` 命中；前置断言排除 `:` 前的数字
 *   ② 年份 —— 「2026年」的「202」也会命中，故年份段的数字要排除
 */
const COUNT_SRC =
  '(?<![0-9:.])[1-9][0-9]{0,2}\\s*(?:个)?\\s*(?:项目|作品|文章|篇)|(?:项目|作品|文章|篇|Works|Posts|Projects|Blogs)\\s*[:：]?\\s*(?<![0-9:.])(?:[1-9][0-9]{0,2})(?![0-9年月])'

/**
 * 「渲染成功」的最小文本长度。
 * ⚠️ 不能一刀切 200：联系页按设计只有 4 个社交链接（无后端、表单已删），
 * innerText 只有 140~200 字符，用 200 判定会把 17 个正常页面误报成「空」。
 */
const MIN_LEN = { contact: 80, about: 200, blog: 200, projects: 200, index: 200 }

const results = []
for (const style of STYLES) {
  for (const page of PAGES) {
    const path = page === 'index' ? '' : `/${page}`
    const url = `${BASE}${LOCALE_PREFIX}/style/${style}${path}`
    let row = { style, page, url }
    try {
      await send('Page.navigate', { url })
      await new Promise((r) => setTimeout(r, WAIT))
      const r = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const text = document.body ? document.body.innerText : ''
          const leakRe = new RegExp(${JSON.stringify(KEY_LEAK_SRC)}, 'g')
          const countRe = new RegExp(${JSON.stringify(COUNT_SRC)}, 'gi')
          return {
            len: text.length,
            h1: document.querySelectorAll('h1').length,
            leak: [...new Set(text.match(leakRe) || [])].slice(0, 6),
            counts: [...new Set(text.match(countRe) || [])].slice(0, 8),
          }
        })()`,
      })
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text)
      row = { ...row, ...r.result.value }
    } catch (e) {
      row.error = String(e.message || e)
    }
    results.push(row)
    row.minLen = MIN_LEN[page] ?? 200
    const flag = row.error
      ? 'ERR'
      : row.len < row.minLen
        ? '空'
        : row.leak?.length
          ? '露KEY'
          : 'ok'
    console.log(
      `${style.padEnd(15)} ${page.padEnd(9)} len=${String(row.len ?? '-').padStart(5)}/${row.minLen} h1=${row.h1 ?? '-'} ${flag}` +
        (row.leak?.length ? ` ← ${row.leak.join(',')}` : '') +
        (row.counts?.length ? ` | ${row.counts.join(' / ')}` : ''),
    )
  }
}

// ⚠️ 阈值必须与上面显示 flag 时用的 row.minLen 一致。
// 曾因为这里写死 r.len < 200，显示每行都 ok、汇总却报「异常 17 个」
// （17 个 contact 页的 innerText 本来就只有 140~200 字符）。
const bad = results.filter(
  (r) => r.error || r.len < (r.minLen ?? 200) || (r.leak && r.leak.length),
)
console.log(`\n合计 ${results.length} 页，异常 ${bad.length} 个`)
if (bad.length) {
  for (const b of bad) {
    console.log(`  ✗ ${b.style}/${b.page}${b.error ? ' 错误:' + b.error : ''} len=${b.len}`)
  }
}
process.exitCode = bad.length ? 1 : 0
ws.close()

/**
 * 子页布局量化探针（CDP）
 * ------------------------------------------------------------
 * 「子页构图不如首页」这种判断不能靠翻截图猜。这个脚本在 1280×800 视口下
 * 逐风格量四件客观事实：
 *   1. firstArticle —— 首条正文的绝对位置，>800 就是首屏看不到内容
 *   2. 控件组之间的空隙 —— 标签组与搜索框被劈开多远（该成一组却成了两块）
 *   3. dupHeading —— 有没有元素文案与 h1 完全相同（重复标注）
 *   4. 标签组内按钮数 —— 截断是否生效
 *
 * 用法：
 *   MSYS_NO_PATHCONV=1 NO_PROXY=127.0.0.1,localhost CDP_PORT=9232 \
 *     node scripts/probe-subpage-layout.mjs [baseURL] [LOCALE=en]
 */
import { HIT_BOX_SRC } from './hit-box.mjs'

const BASE = process.argv[2] || 'https://122.51.97.106:8444'
const PREFIX = process.env.LOCALE === 'en' ? '/en' : ''
const PORT = process.env.CDP_PORT || '9232'
const WAIT = Number(process.env.PROBE_WAIT || 5000)
/** 视口：PROBE_VIEW=390,844 量手机；默认 1280×FOLD 量桌面 */
const VIEW = (process.env.PROBE_VIEW || '1280,800').split(',').map(Number)
// 折线默认跟着视口高度走：给了 PROBE_VIEW=390,844 却仍按 800 判，
// 会把「首屏刚好差几像素」的页误判成看不到内容
const FOLD = Number(process.env.PROBE_FOLD || VIEW[1])
/** 要量的子页（默认 blog；projects 也要看时用 PROBE_PAGES=blog,projects） */
const PAGES = (process.env.PROBE_PAGES || 'blog').split(',')

const STYLES = [
  'minimalism', 'swiss', 'editorial', 'terminal', 'pixel', 'metro', 'cyberpunk', 'y2k',
  'glassmorphism', 'liquid-glass', 'claymorphism', 'neumorphism', 'soft-3d', 'skeuomorphism',
  'neo-brutalism', 'flat-design', 'retro-computer', 'dashboard', 'sci-fi-hud', 'web2-glossy',
]

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
const target = list.find((t) => t.type === 'page')
const ws = new WebSocket(target.webSocketDebuggerUrl)
let seq = 0
const pending = new Map()
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
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

const exprFor = (page) => `(() => {
  // 风格 id 取 'style' 之后那一段：站点挂在 /my-personalWebsite/ 下时，
  // 按固定下标 [1] 取到的是 'style' 本身，会让下面的链接匹配全数落空
  const seg = location.pathname.split('/').filter(Boolean);
  const id = seg[seg.indexOf('style') + 1] || '';
  const h1 = document.querySelector('h1');
  const h1t = h1 ? h1.textContent.trim() : '';
  // 排除导航 / 侧栏 / 任务栏里的同名项：导航项显示当前页名是正确行为，不是重复标注。
  // 注意不能排除 <header>——区块级 header 里正是 eyebrow 会出现的地方，排掉就把真缺陷也遮了。
  const inChrome = (e) =>
    !!e.closest('nav, aside, [role="navigation"], [role="banner"], [role="menubar"]') ||
    /(nav|menu|sidebar|side-link|taskbar|breadcrumb)/i.test(
      e.parentElement ? String(e.parentElement.className) : '',
    ) ||
    /(nav|menu|sidebar|side-link|taskbar|cell-label)/i.test(String(e.className));
  const dup = [...document.querySelectorAll('h2,h3,p,span,div,small')]
    .filter((e) => e.children.length === 0 && e !== h1 && !inChrome(e) && e.textContent.trim() === h1t)
    .map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0])
    .slice(0, 3);
  const links = [...document.querySelectorAll('a[href]')].filter((a) => {
    const h = a.getAttribute('href') || '';
    // 从 /style/ 起截，避免再被部署子路径（/my-personalWebsite、/en）影响
    const tail = h.slice(h.indexOf('/style/'));
    return new RegExp('^/style/' + id + '/' + '${page}' + '/[^/]+').test(tail);
  });
  const groups = [...document.querySelectorAll('[role="group"]')].map((g) => {
    const r = g.getBoundingClientRect();
    return {
      label: g.getAttribute('aria-label'),
      top: Math.round(r.top + scrollY),
      bottom: Math.round(r.bottom + scrollY),
      buttons: g.querySelectorAll('button').length,
    };
  });
  const inp = document.querySelector('input');
  const ir = inp ? inp.getBoundingClientRect() : null;
  const ar = links[0] ? links[0].getBoundingClientRect() : null;
  // 窄屏最致命的是横向溢出（页面被撑宽，整站可左右拖）与触控目标过小
  const overflow = document.documentElement.scrollWidth - window.innerWidth;
  let small = 0;
  ${HIT_BOX_SRC}
  for (const el of document.querySelectorAll('a[href], button')) {
    const b = hitBox(el);
    if (b.width === 0 && b.height === 0) continue; // 未显示的不算
    if (Math.round(b.height) < 40 || Math.round(b.width) < 40) small++;
  }
  return JSON.stringify({
    h1: h1t,
    dup,
    groups,
    overflow,
    small,
    inputTop: ir ? Math.round(ir.top + scrollY) : null,
    firstArticleTop: ar ? Math.round(ar.top + scrollY) : null,
  });
})()`

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: VIEW[0],
  height: VIEW[1],
  deviceScaleFactor: 1,
  mobile: VIEW[0] < 768,
})

const rows = []
for (const s of STYLES) {
  for (const page of PAGES) {
    await send('Page.navigate', { url: `${BASE}${PREFIX}/style/${s}/${page}/` })
    await new Promise((r) => setTimeout(r, WAIT))
    const { result } = await send('Runtime.evaluate', {
      expression: exprFor(page),
      returnByValue: true,
    })
    const d = JSON.parse(result.value)
    const tagGroup = d.groups.find((g) => /标签|tag/i.test(g.label || '')) || d.groups[0]
    const nextGroup = d.groups[1]
    const ctrlGap =
      d.inputTop != null && tagGroup ? d.inputTop - tagGroup.bottom : nextGroup
        ? nextGroup.top - tagGroup.bottom
        : null
    rows.push({
      style: s,
      page,
      h1: d.h1,
      dup: d.dup.join(','),
      tagButtons: tagGroup ? tagGroup.buttons : 0,
      ctrlGap,
      overflow: d.overflow,
      small: d.small,
      firstArticle: d.firstArticleTop,
      inFold: d.firstArticleTop != null && d.firstArticleTop < FOLD,
    })
  }
}

console.log(
  `视口 ${VIEW[0]}×${VIEW[1]}｜判据：横向溢出>0、触控目标<40px 数量>3、首屏无正文、标签未截断、小标重复`,
)
console.log('风格            子页        h1        重复标题      标签  间隙  溢出  小目标  首条正文  判定')
for (const r of rows) {
  const flags = []
  if (!r.inFold) flags.push('首屏无正文')
  if (r.overflow > 0) flags.push(`横向溢出 ${r.overflow}px`)
  if (r.small > 3) flags.push(`小触控目标 ${r.small}`)
  if (r.dup) flags.push('重复小标')
  if (r.tagButtons > 14) flags.push('标签未截断')
  console.log(
    r.style.padEnd(15),
    r.page.padEnd(11),
    (r.h1 || '-').padEnd(9),
    (r.dup || '无').slice(0, 11).padEnd(13),
    String(r.tagButtons).padStart(4),
    String(r.ctrlGap ?? '-').padStart(5),
    String(r.overflow).padStart(5),
    String(r.small).padStart(7),
    String(r.firstArticle ?? '-').padStart(9),
    flags.length ? '  ✗ ' + flags.join('；') : '  ✓',
  )
}
const bad = rows.filter((r) => {
  return (
    !r.inFold || r.dup || r.tagButtons > 14 || r.overflow > 0 || r.small > 3
  )
})
console.log(`\n共 ${rows.length} 页；需要处理：${bad.length ? bad.map((b) => b.style + '/' + b.page).join(', ') : '无'}`)
ws.close()

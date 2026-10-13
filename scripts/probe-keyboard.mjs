/**
 * 键盘可达与焦点可见性探针（CDP）
 * ------------------------------------------------------------
 * 此前从没量过键盘这条路径。三个具体问题都是真实风险，尤其在新加了
 * 「窄屏标签墙 = 单行横向滚动条」之后：
 *   1. 正 tabindex 会打乱 Tab 顺序（DOM 序 ≠ 焦点序 = 键盘用户走的路径不对）
 *   2. 落在滚动容器里的可聚焦元素，Tab 过去时容器会不会自动滚到它——
 *      不滚的话，键盘用户按到的是一个自己看不见的控件
 *   3. 拿到焦点后有没有**可见**的指示（outline / box-shadow / border / 背景变化），
 *      以及这个指示会不会被祖先的 overflow:hidden 裁掉
 *
 * 口径：命中区那套模型不在这里用——焦点环按 computed style 的前后差异判，
 * 因为「看不见」是样式问题不是几何问题。
 *
 * 用法：
 *   MSYS_NO_PATHCONV=1 NO_PROXY=127.0.0.1,localhost CDP_PORT=9256 \
 *     node scripts/probe-keyboard.mjs [baseURL]
 *   LOCALE=en | KB_VIEW=390,844 | KB_PAGES=index,about,projects,blog,contact
 */
import { HIT_BOX_SRC } from './hit-box.mjs'

const BASE = process.argv[2] || 'https://122.51.97.106:8444'
const PREFIX = process.env.LOCALE === 'en' ? '/en' : ''
const PORT = process.env.CDP_PORT || '9256'
const WAIT = Number(process.env.KB_WAIT || 5000)
const VIEW = (process.env.KB_VIEW || '390,844').split(',').map(Number)
const PAGES = (process.env.KB_PAGES || 'index,blog,projects').split(',')

const ALL_STYLES = [
  'minimalism',
  'swiss',
  'editorial',
  'terminal',
  'pixel',
  'metro',
  'cyberpunk',
  'y2k',
  'glassmorphism',
  'liquid-glass',
  'claymorphism',
  'neumorphism',
  'soft-3d',
  'skeuomorphism',
  'neo-brutalism',
  'flat-design',
  'retro-computer',
  'dashboard',
  'sci-fi-hud',
  'web2-glossy',
]
// 冒烟时用 KB_STYLES=swiss,neumorphism 只跑几个，别一上来就 60 页
const STYLES = process.env.KB_STYLES ? process.env.KB_STYLES.split(',') : ALL_STYLES

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
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`CDP 超时: ${method}`))
    }, 60000)
    pending.set(id, (m) => {
      clearTimeout(timer)
      if (m.error) reject(new Error(method + ': ' + JSON.stringify(m.error)))
      else resolve(m.result)
    })
  })
}

/**
 * 页内求值分三步，因为「焦点可见性」必须用**真实键盘**触发：
 *   0) 先给所有可聚焦元素拍一张未聚焦时的样式快照（基线）
 *   1) 用 CDP 发真实 Tab 按键逐个走焦点序——程序化 el.focus() 不会命中
 *      :focus-visible（本站焦点样式普遍写在 :focus-visible 上），
 *      那样量出来是「每个元素都没有可见指示」的假全灭，判据本身是坏的
 *   2) 每步读当前 activeElement，与基线比差异、看它在不在视野内、
 *      有没有被祖先 overflow:hidden 裁掉
 */
const BASELINE = `(() => {
  ${HIT_BOX_SRC}
  const snapOf = (el) => {
    const cs = getComputedStyle(el);
    return [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow, cs.backgroundColor,
            cs.borderTopWidth, cs.borderTopColor, cs.color, cs.textDecorationLine, cs.transform,
            cs.fontWeight, cs.opacity].join('|');
  };
  // 焦点指示常常不画在元素自己身上：输入框的 :focus 由父行用 :focus-within 接管
  // （terminal 的 .input-row:focus-within 就是这样）。只量元素本身会把这种
  // 「合规的间接指示」全判成无指示，所以签名里带上直接父容器的外观。
  const snap = (el) => snapOf(el) + '#' + (el.parentElement ? snapOf(el.parentElement) : '');
  // 本站设了 html { scroll-behavior: smooth }，Tab 后浏览器是平滑滚动——
  // 紧接着读 rect 会读到「还在首屏以下」的中间态，整条判据全假阳性。
  // 探针期间临时关掉平滑，让焦点落位变成瞬时（只影响这个量测进程，不改产品代码）。
  document.documentElement.style.scrollBehavior = 'auto';
  const nodes = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
    .filter((el) => {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || el.disabled) return false;
      // 读屏专用容器（.sr-only 那类 1px + clip 的盒子）里的链接本来就不给眼睛看，
      // 把它们算进「键盘可见性」会全是假阳性
      for (let p = el.parentElement; p; p = p.parentElement) {
        const pb = p.getBoundingClientRect();
        if (pb.width < 2 || pb.height < 2) return false;
      }
      const b = hitBox(el);
      return (b.width || b.height) > 0;
    });
  window.__kb = { nodes, snap, order: [], i: -1, posTabindex: 0, out: { total: nodes.length } };
  for (const el of nodes) {
    const ti = el.getAttribute('tabindex');
    if (ti !== null && parseInt(ti, 10) > 0) window.__kb.posTabindex++;
  }
  // 记录 DOM 序，用来核对 Tab 序是否与 DOM 序一致（不一致=焦点跳跃，键盘用户迷路）
  window.__kb.domIndex = new Map(nodes.map((el, idx) => [el, idx]));
  nodes.forEach((el) => (el.dataset.kbBase = snap(el)));
  return JSON.stringify({ total: nodes.length, posTabindex: window.__kb.posTabindex });
})()`

const READ_STEP = `(() => {
  const k = window.__kb;
  if (!k) return JSON.stringify({ missing: true });
  const el = document.activeElement;
  if (!el || el === document.body) return JSON.stringify({ end: true });
  const idx = k.nodes.indexOf(el);
  if (idx < 0) return JSON.stringify({ skipped: (el.tagName || '').toLowerCase() });
  const cs = getComputedStyle(el);
  const now = k.snap(el);
  const base = el.dataset.kbBase || '';
  const b = el.getBoundingClientRect();
  // 先看它在不在自己滚动容器的可视区里——「屏外」只有相对滚动容器才有意义，
  // 拿视口上下沿判会把「首屏以下」全算成缺陷
  let scroller = null;
  for (let p = el.parentElement; p; p = p.parentElement) {
    const ox = getComputedStyle(p).overflowX;
    if (ox === 'auto' || ox === 'scroll') { scroller = p; break; }
  }
  const sr = scroller ? scroller.getBoundingClientRect() : null;
  const outOfScroller = sr ? b.right > sr.right + 1 || b.left < sr.left - 1 : false;
  // 焦点环宽度按元素自己算（早先误用了祖先的 outlineWidth）
  const ring = (parseFloat(cs.outlineWidth) || 3) + Math.abs(parseFloat(cs.outlineOffset) || 0) + 1;
  let clipper = null;
  for (let p = el.parentElement; p; p = p.parentElement) {
    const pc = getComputedStyle(p);
    if (pc.overflow === 'hidden' || pc.overflowX === 'hidden' || pc.overflowY === 'hidden') {
      const pb = p.getBoundingClientRect();
      if (b.top - ring < pb.top - 1 || b.bottom + ring > pb.bottom + 1 ||
          b.left - ring < pb.left - 1 || b.right + ring > pb.right + 1) {
        clipper = p.tagName.toLowerCase() + '.' + (String(p.className).split(/\\s+/)[0] || '(无类名)');
      }
      break;
    }
  }
  return JSON.stringify({
    idx,
    order: k.domIndex.get(el),
    fv: el.matches(':focus-visible'),
    sig: el.tagName.toLowerCase() + '.' + (String(el.className).split(/\\s+/)[0] || '(无类名)'),
    noRing: now === base,
    outline: cs.outlineStyle + ' ' + cs.outlineWidth,
    outOfScroller,
    clippedBy: clipper,
    hasScroller: !!scroller,
    rect: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)],
  });
})()`

const TAB_KEY = {
  type: 'keyDown',
  key: 'Tab',
  code: 'Tab',
  windowsVirtualKeyCode: 9,
  nativeVirtualKeyCode: 9,
}
const TAB_UP = {
  type: 'keyUp',
  key: 'Tab',
  code: 'Tab',
  windowsVirtualKeyCode: 9,
  nativeVirtualKeyCode: 9,
}

await send('Page.enable')
await send('Runtime.enable')
// Input 域没有 enable 方法（发 dispatchKeyEvent 直接可用），别照别的域的样子写
await send('Emulation.setDeviceMetricsOverride', {
  width: VIEW[0],
  height: VIEW[1],
  deviceScaleFactor: 1,
  mobile: true,
})

const agg = {
  pages: 0,
  total: 0,
  posTabindex: 0,
  noIndicator: new Map(),
  offscreen: new Map(),
  clipped: new Map(),
  orderJumps: 0,
  steps: 0,
  focusVisibleMiss: 0,
}
for (const s of STYLES) {
  for (const p of PAGES) {
    const path = p === 'index' ? '' : '/' + p
    await send('Page.navigate', { url: `${BASE}${PREFIX}/style/${s}${path}/` })
    await new Promise((r) => setTimeout(r, WAIT))
    const init = JSON.parse(
      (await send('Runtime.evaluate', { expression: BASELINE, returnByValue: true })).result.value,
    )
    const per = { noRing: 0, off: 0, clip: 0, jumps: 0 }
    let lastOrder = -1
    // 多走 3 步覆盖循环，遇到 body（焦点离开文档）就停
    for (let i = 0; i < Math.min(init.total + 3, 120); i++) {
      await send('Input.dispatchKeyEvent', TAB_KEY)
      await send('Input.dispatchKeyEvent', TAB_UP)
      const st = JSON.parse(
        (await send('Runtime.evaluate', { expression: READ_STEP, returnByValue: true })).result
          .value,
      )
      if (st.end || st.missing) break
      if (st.skipped) continue
      agg.steps++
      per.noRing += st.noRing ? 1 : 0
      if (st.noRing && !agg.noIndicator.has(st.sig)) agg.noIndicator.set(st.sig, 0)
      if (st.noRing) agg.noIndicator.set(st.sig, agg.noIndicator.get(st.sig) + 1)
      if (st.outOfScroller) {
        per.off++
        const key = st.sig + ' @' + st.rect.join(',')
        agg.offscreen.set(key, (agg.offscreen.get(key) || 0) + 1)
      }
      if (st.clippedBy) {
        per.clip++
        // 把「有没有别的可见变化」并进键里：既裁切又没有任何样式变化才是真缺陷，
        // 只是焦点环被裁但背景会变的那是外观瑕疵
        const key = `${st.sig} ← ${st.clippedBy}${st.noRing ? ' [且无其他可见变化=真缺陷]' : ''}`
        agg.clipped.set(key, (agg.clipped.get(key) || 0) + 1)
      }
      // 回环不算倒退：Tab 走到最后一个可聚焦元素后浏览器会绕回第一个，
      // 那是正常行为；真正的顺序问题是从第 n 个跳到第 m 个（m>0 且 m<n）
      if (st.order < lastOrder && st.order !== 0) per.jumps++
      lastOrder = st.order
    }
    agg.pages++
    agg.total += init.total
    agg.posTabindex += init.posTabindex
    agg.orderJumps += per.jumps
    const bad = per.noRing + per.off + per.clip + per.jumps
    console.log(
      `${s.padEnd(14)} ${p.padEnd(9)} 可聚焦=${String(init.total).padStart(3)} 无指示=${per.noRing} 屏外=${per.off} 裁切=${per.clip} 顺序倒退=${per.jumps}${bad ? ' ⚠' : ''}`,
    )
  }
}

console.log(`\n视口 ${VIEW[0]}×${VIEW[1]} | ${agg.pages} 页 | 真实 Tab 走位 ${agg.steps} 步`)
console.log(
  `正 tabindex（打乱 Tab 顺序）: ${agg.posTabindex} | Tab 序相对 DOM 序倒退: ${agg.orderJumps}`,
)
const dump = (label, m) => {
  const rows = [...m.entries()].sort((a, b) => b[1] - a[1])
  console.log(`\n${label}: ${m.size} 类${rows.length ? '' : '（无）'}`)
  rows.slice(0, 12).forEach(([k, v]) => console.log(`  ${String(v).padStart(4)} × ${k}`))
}
dump('按 Tab 后仍无任何可见变化', agg.noIndicator)
dump('Tab 到屏外且在滚动容器里没被滚进视野', agg.offscreen)
dump('焦点环被祖先 overflow:hidden 裁切', agg.clipped)
ws.close()

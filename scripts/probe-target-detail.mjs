/**
 * 触控目标逐条明细（CDP）
 * ------------------------------------------------------------
 * 聚合探针只给「某类有几个」，看不出单个目标到底是谁、为什么这么小。
 * 这里对指定风格逐条打印 tag+class、尺寸、文本、父级链，用来定位漏网的那个。
 *
 * 用法：
 *   MSYS_NO_PATHCONV=1 NO_PROXY=127.0.0.1,localhost CDP_PORT=9235 \
 *     node scripts/probe-target-detail.mjs <style[,style]> [baseURL]
 */
import { HIT_BOX_SRC } from './hit-box.mjs'

const STYLES = (process.argv[2] || 'terminal,liquid-glass').split(',')
const BASE = process.argv[3] || 'https://122.51.97.106:8444'
const PORT = process.env.CDP_PORT || '9235'
const WAIT = Number(process.env.PROBE_WAIT || 4000)
const VIEW = (process.env.PROBE_VIEW || '390,844').split(',').map(Number)
const PAGES = (process.env.PROBE_PAGES || 'blog,projects').split(',')

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

const EXPR = `(() => {
  const out = [];
  ${HIT_BOX_SRC}
  for (const el of document.querySelectorAll('a[href], button')) {
    const b = hitBox(el);
    if (!b.width && !b.height) continue;
    // 整像素比较，理由同 probe-touch-targets.mjs（3D 缩放会让投影 rect 小 0.5px）
    if (Math.round(b.height) >= 40 && Math.round(b.width) >= 40) continue;
    const chain = [];
    let p = el.parentElement;
    for (let d = 0; p && d < 4; d++, p = p.parentElement) {
      const c = String(p.className).split(/\\s+/)[0];
      chain.push(p.tagName.toLowerCase() + (c ? '.' + c : ''));
    }
    out.push({
      sig: el.tagName.toLowerCase() + '.' + (String(el.className).split(/\\s+/)[0] || '(无类名)'),
      w: +b.width.toFixed(1),
      h: +b.height.toFixed(1),
      text: (el.textContent || '').trim().slice(0, 26),
      parent: chain.join(' > '),
    });
  }
  return JSON.stringify(out);
})()`

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: VIEW[0],
  height: VIEW[1],
  deviceScaleFactor: 1,
  mobile: true,
})

for (const s of STYLES) {
  for (const page of PAGES) {
    await send('Page.navigate', { url: `${BASE}/style/${s}/${page}/` })
    await new Promise((r) => setTimeout(r, WAIT))
    const { result } = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true })
    const items = JSON.parse(result.value)
    console.log(`\n### ${s}/${page}  不合格 ${items.length} 个`)
    for (const it of items) {
      console.log(
        `  ${String(it.w).padStart(6)}x${String(it.h).padStart(5)}  ${it.sig.padEnd(24)} 「${it.text}」  ← ${it.parent}`,
      )
    }
  }
}
ws.close()

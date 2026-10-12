/**
 * 计算可安全删除的 i18n 死 key
 * ------------------------------------------------------------
 * 用法：node scripts/dead-keys.mjs [--delete]
 *
 * 判定「零引用」要满足三点才算安全：
 *   1. 括号配对提取的 t() 字面量里没有它（覆盖三元表达式，不能只匹配 t('...')）
 *   2. 它不在任何动态拼接前缀之下（如 t(`styles.gallery.tier${n}`) 会用到
 *      tier1/2/3，按字面量扫会误判成死 key）
 *   3. 代码里也没出现它的末段（防御省略前缀的写法）
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = process.cwd()
const SKIP = new Set([
  'node_modules', '.git', '.nuxt', '.output', '.workbuddy', 'dist', 'public', '.shots',
])

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith('.shots-')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(vue|ts)$/.test(name)) out.push(full)
  }
  return out
}

const files = [
  ...walk(resolve(root, 'styles')),
  ...walk(resolve(root, 'pages')),
  ...walk(resolve(root, 'layouts')),
  ...walk(resolve(root, 'composables')),
  ...walk(resolve(root, 'utils')),
  resolve(root, 'app.vue'),
  resolve(root, 'error.vue'),
]

function strip(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

function flatKeys(o, p = []) {
  let r = []
  for (const [k, v] of Object.entries(o)) {
    const q = [...p, k]
    if (v && typeof v === 'object' && !Array.isArray(v)) r = r.concat(flatKeys(v, q))
    else r.push(q.join('.'))
  }
  return r
}

const used = new Set()
const dynPrefix = []
let corpus = ''
for (const f of files) {
  const s = strip(readFileSync(f, 'utf8'))
  corpus += s + '\n'
  const re = /\$?\bt\(/g
  let m
  while ((m = re.exec(s))) {
    const open = m.index + m[0].length - 1
    let d = 0
    let c = open
    for (; c < s.length; c++) {
      if (s[c] === '(') d++
      else if (s[c] === ')') {
        d--
        if (d === 0) break
      }
    }
    const inner = s.slice(open + 1, c)
    for (const km of inner.matchAll(/'([a-zA-Z][\w.]*)'/g)) used.add(km[1])
  }
  const re2 = /\$?\bt\(\s*`([^`]*?)\$\{/g
  let m2
  while ((m2 = re2.exec(s))) dynPrefix.push(m2[1])
}

const zhPath = resolve(root, 'i18n/zh-CN.json')
const enPath = resolve(root, 'i18n/en-US.json')
const zhRaw = JSON.parse(readFileSync(zhPath, 'utf8'))
const enRaw = JSON.parse(readFileSync(enPath, 'utf8'))
const keys = flatKeys(zhRaw)

const dead = keys.filter((k) => {
  if (used.has(k)) return false
  if (dynPrefix.some((p) => k.startsWith(p))) return false
  if (corpus.includes(k)) return false
  const leaf = k.split('.').pop()
  if (corpus.includes(leaf)) return false
  return true
})

console.log('语言包 key 总数:', keys.length)
console.log('动态拼接前缀:', dynPrefix.join(', ') || '(无)')
console.log('受前缀保护而保留:',
  keys.filter((k) => dynPrefix.some((p) => k.startsWith(p)) && !used.has(k)).join(', ') || '(无)')
console.log('可删除死 key:', dead.length)
console.log('---')
console.log(dead.join('\n'))

if (process.argv.includes('--delete')) {
  function deletePaths(obj, paths) {
    for (const p of paths) {
      const parts = p.split('.')
      let cur = obj
      for (let i = 0; i < parts.length - 1; i++) {
        if (cur[parts[i]] === undefined) { cur = null; break }
        cur = cur[parts[i]]
      }
      if (cur && typeof cur === 'object') delete cur[parts[parts.length - 1]]
    }
  }
  deletePaths(zhRaw, dead)
  deletePaths(enRaw, dead)
  writeFileSync(zhPath, JSON.stringify(zhRaw, null, 2) + '\n')
  writeFileSync(enPath, JSON.stringify(enRaw, null, 2) + '\n')
  console.log('\n已删除', dead.length, '个 key（中英两份）')
}

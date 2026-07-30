// Subset fontu Tabler Icons tylko do ikon używanych w src/ → drastycznie mniejszy
// font (447 KB → ~20-30 KB). Uruchamiane jako `prebuild` i przez `npm run icons`.
// Generuje src/styles/tabler-icons.css + src/styles/tabler-icons.woff2 (import w main.ts).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import subsetFont from 'subset-font'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CSS_SRC = join(root, 'node_modules/@tabler/icons-webfont/dist/tabler-icons.min.css')
const TTF_SRC = join(root, 'node_modules/@tabler/icons-webfont/dist/fonts/tabler-icons.ttf')
const OUT_CSS = join(root, 'src/styles/tabler-icons.css')
const OUT_WOFF2 = join(root, 'src/styles/tabler-icons.woff2')

// 1) Zbierz używane klasy ikon (ti-*) ze źródeł.
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, acc)
    else if (/\.(vue|ts|js)$/.test(name)) acc.push(p)
  }
  return acc
}
const used = new Set()
for (const file of walk(join(root, 'src'))) {
  const txt = readFileSync(file, 'utf8')
  for (const m of txt.matchAll(/\bti-[a-z0-9-]+/g)) used.add(m[0])
}

// 2) Mapa klasa → reguła CSS + codepoint z oryginalnego fontu.
const css = readFileSync(CSS_SRC, 'utf8')
const ruleRe = /\.(ti-[a-z0-9-]+):before\{content:"(\\[0-9a-fA-F]+)"\}/g
const usedRules = []
const chars = []
let matched = 0
for (const m of css.matchAll(ruleRe)) {
  const [full, name, esc] = m
  if (!used.has(name)) continue
  matched++
  usedRules.push(full)
  chars.push(String.fromCodePoint(parseInt(esc.slice(1), 16)))
}

// Bazowa reguła .ti (font-family) — wyciągnięta z oryginału.
const baseRule = (css.match(/\.ti\{[^}]*font-family:"tabler-icons"[^}]*\}/) || [
  '.ti{font-family:"tabler-icons"!important;speak:none;font-style:normal;font-weight:normal;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}'
])[0]

// 3) Subset fontu do zebranych glifów → woff2.
const ttf = readFileSync(TTF_SRC)
const subset = await subsetFont(ttf, chars.join(''), { targetFormat: 'woff2' })
writeFileSync(OUT_WOFF2, subset)

// 4) Wygeneruj minimalny CSS (font lokalny + baza + tylko używane ikony).
const out = [
  '/* AUTO-GENEROWANE przez scripts/subset-icons.mjs — nie edytuj ręcznie. */',
  '@font-face{font-family:"tabler-icons";font-style:normal;font-weight:400;src:url("./tabler-icons.woff2") format("woff2")}',
  baseRule,
  usedRules.join('')
].join('\n')
writeFileSync(OUT_CSS, out)

const kb = (subset.length / 1024).toFixed(1)
console.log(`[subset-icons] ${matched}/${used.size} ikon → tabler-icons.woff2 ${kb} KB (było 447 KB)`)
if (matched < used.size) {
  const missing = [...used].filter(n => !usedRules.some(r => r.startsWith('.' + n + ':')))
  console.warn(`[subset-icons] UWAGA: ${missing.length} klas ti-* nie znaleziono w foncie (literówki?):`, missing.slice(0, 15).join(', '))
}

import manual from './manual.json'
import meta from './styleMeta.json'
import filmProfiles from './filmProfiles.json'

export const META = manual.meta
export const CHAPTERS = manual.chapters

// Film profiles ("Profili Film") — Lightroom *profiles*, distinct from the 24 looks
export const PROFILES_META = filmProfiles.meta
export const PROFILES = filmProfiles.profiles
export const profileBySlug = (slug) => PROFILES.find((p) => p.slug === slug)

export const STYLE_META = meta.styles
export const SCENE_GUIDE = meta.sceneGuide
export const FILTERS = meta.filters

// Split chapters by kind
export const THEORY = CHAPTERS.filter((c) => c.kind === 'theory')
export const APPENDICES = CHAPTERS.filter((c) => c.kind === 'appendix')
export const STYLES = CHAPTERS.filter((c) => c.kind === 'style').sort((a, b) => a.num - b.num)

// Merge curated metadata onto each style chapter
STYLES.forEach((s) => {
  s.m = STYLE_META[String(s.num)] || {}
})

export const styleByNum = (num) => STYLES.find((s) => s.num === Number(num))
export const styleBySlug = (slug) => STYLES.find((s) => s.slug === slug)
export const chapterBySlug = (slug) => CHAPTERS.find((c) => c.slug === slug)

// "Esempio visivo: foo" -> "foo"
export function exampleText(s) {
  const ex = s.blocks.find((b) => b.type === 'example')
  if (!ex) return ''
  return ex.text.replace(/^Esempio visivo:\s*/i, '')
}

// Plain text of a block (for search / previews)
export function blockText(b) {
  if (b.type === 'para') return b.runs.map((r) => r.t).join('')
  if (b.type === 'scheda') return b.rows.map((r) => `${r.label}: ${r.value}`).join(' · ')
  return b.text || ''
}

export function chapterText(c) {
  return c.blocks.map(blockText).join(' ')
}

// ---- Search index -------------------------------------------------
const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function search(query) {
  const q = norm(query.trim())
  if (q.length < 2) return []
  const terms = q.split(/\s+/)
  const results = []
  for (const c of CHAPTERS) {
    const hayTitle = norm(c.title + ' ' + (c.film || '') + ' ' + (c.director || ''))
    // search per-block to surface the best matching snippet
    let best = null
    for (const b of c.blocks) {
      const text = blockText(b)
      const hay = norm(text)
      let score = 0
      for (const t of terms) {
        if (hayTitle.includes(t)) score += 3
        if (hay.includes(t)) score += 1
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { score, snippet: snippetFor(text, terms) }
      }
    }
    // also allow title-only matches
    let titleScore = terms.reduce((a, t) => a + (hayTitle.includes(t) ? 3 : 0), 0)
    if (best || titleScore > 0) {
      results.push({
        chapter: c,
        score: (best ? best.score : 0) + titleScore,
        snippet: best ? best.snippet : chapterText(c).slice(0, 140),
      })
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 40)
}

function snippetFor(text, terms) {
  const lower = norm(text)
  let idx = -1
  for (const t of terms) {
    const i = lower.indexOf(t)
    if (i >= 0 && (idx < 0 || i < idx)) idx = i
  }
  if (idx < 0) return text.slice(0, 140)
  const start = Math.max(0, idx - 50)
  return (start > 0 ? '… ' : '') + text.slice(start, start + 160).trim() + ' …'
}

// route helper
export function chapterPath(c) {
  if (c.kind === 'style') return `/look/${c.slug}`
  return `/capitolo/${c.slug}`
}

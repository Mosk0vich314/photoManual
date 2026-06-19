import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { styleBySlug, STYLES, exampleText } from '../data/index.js'
import Blocks from '../components/Blocks.jsx'
import Poster from '../components/Poster.jsx'

export default function StyleDetail() {
  const { slug } = useParams()
  const s = styleBySlug(slug)
  if (!s) return <p className="empty">Look non trovato.</p>

  const m = s.m
  const sw = m.swatches || []
  const i = STYLES.indexOf(s)
  const prev = STYLES[(i - 1 + STYLES.length) % STYLES.length]
  const next = STYLES[(i + 1) % STYLES.length]

  // skip the leading "example" block (shown in the header) when rendering the body
  const body = s.blocks.filter((b) => b.type !== 'example')

  return (
    <article>
      <Poster colors={sw} angle={155} className="hero-poster">
        <div className="hero-poster-body">
          <div className="eyebrow on-poster">Stile {String(s.num).padStart(2, '0')} · {m.harmony}</div>
          <h1 className="page">{s.title.replace(/^Look\s+/, '')}</h1>
          <p className="film-credit ui">
            <b>{s.film || m.harmony}</b>{s.director ? ` — ${s.director}` : ''}
          </p>
        </div>
      </Poster>

      <p className="subtitle" style={{ marginBottom: 14 }}>{exampleText(s)}</p>

      <div className="metaline ui">
        {m.axes && <span className="chip">🎨 {m.axes}</span>}
        {(m.subjects || []).map((x) => (
          <span className="chip" key={x}>{x}</span>
        ))}
        {(m.moods || []).map((x) => (
          <span className="chip" key={x}>{x}</span>
        ))}
      </div>

      <Blocks blocks={body} />

      <div className="pill-nav ui">
        <Link className="prev" to={`/look/${prev.slug}`}>
          <div className="d">‹ Stile {prev.num}</div>
          {prev.title.replace(/^Look\s+/, '')}
        </Link>
        <Link className="next" to={`/look/${next.slug}`}>
          <div className="d">Stile {next.num} ›</div>
          {next.title.replace(/^Look\s+/, '')}
        </Link>
      </div>
    </article>
  )
}

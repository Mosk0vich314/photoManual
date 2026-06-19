import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { chapterBySlug, THEORY, APPENDICES } from '../data/index.js'
import Blocks from '../components/Blocks.jsx'
import HueWheel from '../components/HueWheel.jsx'

const READABLE = [...THEORY, ...APPENDICES]

export default function ChapterReader() {
  const { slug } = useParams()
  const c = chapterBySlug(slug)
  if (!c) return <p className="empty">Capitolo non trovato.</p>

  // inject interactive widgets into specific chapters
  const widgets = {}
  if (c.slug === 'teoria-del-colore') widgets['La ruota e i gradi'] = <HueWheel />

  const i = READABLE.findIndex((x) => x.slug === c.slug)
  const prev = i > 0 ? READABLE[i - 1] : null
  const next = i >= 0 && i < READABLE.length - 1 ? READABLE[i + 1] : null

  return (
    <article>
      <div className="eyebrow">{c.kind === 'appendix' ? 'Appendice' : 'Capitolo'}</div>
      <h1 className="page" style={{ fontFamily: "'Iowan Old Style', Georgia, serif" }}>{c.title}</h1>
      <hr className="divider" />

      {c.slug === 'quale-stile-per-questa-scena' && (
        <Link to="/scena" className="card ui" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 14, marginBottom: 18,
          background: 'linear-gradient(160deg, rgba(199,168,106,0.14), rgba(199,168,106,0.02))',
          borderColor: 'rgba(199,168,106,0.3)',
        }}>
          <span style={{ fontSize: 22 }}>◎</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Apri il selettore interattivo</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Scegli la scena, trova il look</div>
          </div>
          <span style={{ color: 'var(--text-3)' }}>›</span>
        </Link>
      )}

      <Blocks blocks={c.blocks} widgets={widgets} />

      <div className="pill-nav ui">
        {prev ? (
          <Link className="prev" to={`/capitolo/${prev.slug}`}>
            <div className="d">‹ Precedente</div>
            {prev.title}
          </Link>
        ) : <span style={{ flex: 1 }} />}
        {next ? (
          <Link className="next" to={`/capitolo/${next.slug}`}>
            <div className="d">Successivo ›</div>
            {next.title}
          </Link>
        ) : <span style={{ flex: 1 }} />}
      </div>
    </article>
  )
}

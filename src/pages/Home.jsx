import React from 'react'
import { Link } from 'react-router-dom'
import { STYLES, META, PROFILES } from '../data/index.js'
import Poster from '../components/Poster.jsx'

const TILES = [
  { to: '/look', ic: '▦', name: 'I 24 Look', sub: 'Galleria + filtri', cls: '' },
  { to: '/scena', ic: '◎', name: 'Quale look?', sub: 'Parti dalla scena', cls: '' },
  { to: '/manuale', ic: '☰', name: 'Il Manuale', sub: 'Teoria & metodo', cls: '' },
  { to: '/cerca', ic: '⌕', name: 'Cerca', sub: 'In tutto il testo', cls: '' },
]

export default function Home() {
  // a rotating "look of the day" based on the date
  const idx = new Date().getDate() % STYLES.length
  const featured = STYLES[idx]
  const sw = featured.m.swatches || []

  return (
    <div className="ui">
      <section className="hero">
        <div className="kicker">Fotografia · Color Grading</div>
        <h1 style={{ fontFamily: "'Iowan Old Style', Georgia, serif" }}>{META.title}</h1>
        <p>{META.subtitle}</p>
      </section>

      <div className="tiles">
        {TILES.map((t) => (
          <Link className={'tile ' + t.cls} to={t.to} key={t.to}>
            <div className="t-ic">{t.ic}</div>
            <div>
              <div className="t-name">{t.name}</div>
              <div className="t-sub">{t.sub}</div>
            </div>
          </Link>
        ))}

        <Link className="tile span2" to="/profili">
          <div className="profile-stack" aria-hidden="true">
            {PROFILES.slice(0, 4).map((p) => (
              <Poster key={p.id} colors={p.swatches} angle={150}
                style={{ width: 40, height: 52, borderRadius: 7, flex: '0 0 auto', border: '1px solid var(--line)' }} />
            ))}
          </div>
          <div>
            <div className="t-sub" style={{ letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Profili Film
            </div>
            <div className="t-name" style={{ fontSize: 18, marginTop: 2 }}>Emulazioni di pellicola</div>
            <div className="t-sub">{PROFILES.length} profili Lightroom · RNI Films 5</div>
          </div>
        </Link>

        <Link className="tile span2 gold" to={`/look/${featured.slug}`}>
          <Poster colors={sw} angle={150} style={{ width: 64, height: 64, borderRadius: 12, flex: '0 0 auto', border: '1px solid var(--line)' }} />
          <div>
            <div className="t-sub" style={{ color: 'var(--gold-soft)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Look del giorno · Stile {featured.num}
            </div>
            <div className="t-name" style={{ fontSize: 18, marginTop: 2 }}>
              {featured.title.replace(/^Look\s+/, '')}
            </div>
            <div className="t-sub">{featured.film}{featured.director ? ` · ${featured.director}` : ''}</div>
          </div>
        </Link>
      </div>
    </div>
  )
}

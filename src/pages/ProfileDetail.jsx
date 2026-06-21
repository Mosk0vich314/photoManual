import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { profileBySlug, PROFILES, PROFILES_META } from '../data/index.js'
import Poster from '../components/Poster.jsx'
import ToneCurve from '../components/ToneCurve.jsx'

// RNI curves are stored in 0..255 input/output; ToneCurve wants 0..4 units.
const toUnits = (pts) => pts.map(([x, y]) => [(x / 255) * 4, (y / 255) * 4])

export default function ProfileDetail() {
  const { slug } = useParams()
  const p = profileBySlug(slug)
  if (!p) return <p className="empty">Profilo non trovato.</p>

  const sw = p.swatches || []
  const i = PROFILES.indexOf(p)
  const prev = PROFILES[(i - 1 + PROFILES.length) % PROFILES.length]
  const next = PROFILES[(i + 1) % PROFILES.length]

  return (
    <article>
      <Poster colors={sw} angle={155} className="hero-poster">
        <div className="hero-poster-body">
          <div className="eyebrow on-poster">{p.category} · {PROFILES_META.maker}</div>
          <h1 className="page">{p.name}</h1>
          <p className="film-credit ui"><b>{p.tagline}</b></p>
        </div>
      </Poster>

      <p className="subtitle" style={{ marginBottom: 14 }}>{p.description}</p>

      <div className="metaline ui">
        {(p.character || []).map((x) => (
          <span className="chip" key={x}>{x}</span>
        ))}
      </div>

      <a
        className="dl-btn ui"
        href={`${import.meta.env.BASE_URL}profiles/${p.slug}.xmp`}
        download={`${p.name} profile.xmp`}
      >
        <span className="dl-ic" aria-hidden="true">↓</span>
        <span>
          <b>Scarica il profilo</b>
          <small>File .xmp · importa in Lightroom</small>
        </span>
      </a>

      <section>
        <h2 className="sec-h">Regolazioni di base</h2>
        {p.settings && p.settings.length > 0 ? (
          <div className="scheda">
            {p.settings.map((s) => (
              <div className="row" key={s.label}>
                <div className="k">{s.label}</div>
                <div className="v">{s.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="subtitle" style={{ fontStyle: 'normal' }}>
            Nessun ritocco ai cursori: l'intero look è inciso nel profilo.
          </p>
        )}
        <p className="profile-note ui">{PROFILES_META.note}</p>
      </section>

      {p.curve && (
        <section>
          <h2 className="sec-h">Curva tonale</h2>
          <ToneCurve points={toUnits(p.curve)} caption={`Curva inclusa nel profilo ${p.name}.`} />
        </section>
      )}

      <div className="pill-nav ui">
        <Link className="prev" to={`/profili/${prev.slug}`}>
          <div className="d">‹ {prev.category}</div>
          {prev.name}
        </Link>
        <Link className="next" to={`/profili/${next.slug}`}>
          <div className="d">{next.category} ›</div>
          {next.name}
        </Link>
      </div>
    </article>
  )
}

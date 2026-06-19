import React from 'react'
import { Link } from 'react-router-dom'
import { THEORY, APPENDICES, STYLES } from '../data/index.js'

function Row({ to, idx, title, sub, sw }) {
  return (
    <Link className="toc-row" to={to}>
      {sw && (
        <div className="sw">
          {sw.map((c, i) => <span key={i} style={{ background: c }} />)}
        </div>
      )}
      {idx != null && <div className="idx">{idx}</div>}
      <div className="tt">
        {title}
        {sub && <small>{sub}</small>}
      </div>
      <div className="arr">›</div>
    </Link>
  )
}

export default function Manuale() {
  return (
    <div className="ui">
      <h1 className="page" style={{ fontFamily: "'Iowan Old Style', Georgia, serif" }}>Il Manuale</h1>
      <p className="subtitle">Dal metodo alla teoria, fino alle 24 ricette.</p>

      <div className="toc-sec">
        <div className="h">Teoria & Metodo</div>
        {THEORY.map((c, i) => (
          <Row key={c.slug} to={`/capitolo/${c.slug}`} idx={String(i + 1).padStart(2, '0')} title={c.title} />
        ))}
      </div>

      <div className="toc-sec">
        <div className="h">I 24 Look</div>
        <Row to="/look" title="Galleria dei look" sub="Sfoglia e filtra tutti gli stili" />
        {STYLES.map((s) => (
          <Row
            key={s.slug}
            to={`/look/${s.slug}`}
            idx={String(s.num).padStart(2, '0')}
            title={s.title.replace(/^Look\s+/, '')}
            sub={`${s.film}${s.director ? ' · ' + s.director : ''}`}
            sw={s.m.swatches}
          />
        ))}
      </div>

      <div className="toc-sec">
        <div className="h">Appendici</div>
        {APPENDICES.map((c) => (
          <Row key={c.slug} to={`/capitolo/${c.slug}`} title={c.title} />
        ))}
      </div>
    </div>
  )
}

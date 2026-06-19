import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { search, chapterPath } from '../data/index.js'

const KIND_LABEL = { style: 'Look', theory: 'Capitolo', appendix: 'Appendice' }

function Highlight({ text, terms }) {
  if (!terms.length) return <>{text}</>
  const re = new RegExp('(' + terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi')
  const parts = text.split(re)
  return parts.map((p, i) =>
    terms.some((t) => p.toLowerCase() === t.toLowerCase()) ? <mark key={i}>{p}</mark> : <React.Fragment key={i}>{p}</React.Fragment>,
  )
}

const SUGGEST = ['curva', 'incarnato', 'teal', 'cielo', 'grana', 'maschera', 'calibrazione']

export default function Search() {
  const [q, setQ] = useState('')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  const results = useMemo(() => search(q), [q])
  const terms = q.trim().toLowerCase().split(/\s+/).filter((t) => t.length >= 2)

  return (
    <div className="ui">
      <div className="searchbox">
        <span style={{ color: 'var(--text-3)', fontSize: 18 }}>⌕</span>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca nel manuale…"
          autoComplete="off" autoCorrect="off" spellCheck="false"
        />
        {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 18 }}>×</button>}
      </div>

      {q.trim().length < 2 ? (
        <div>
          <p className="count">Prova con:</p>
          <div className="filt-row" style={{ flexWrap: 'wrap' }}>
            {SUGGEST.map((s) => (
              <button className="chip" key={s} onClick={() => setQ(s)}>{s}</button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <p className="empty">Nessun risultato per “{q}”.</p>
      ) : (
        <>
          <p className="count">{results.length} risultati</p>
          <div className="res">
            {results.map((r) => (
              <Link className="res-row" to={chapterPath(r.chapter)} key={r.chapter.slug} style={{ display: 'block' }}>
                <div className="rk">
                  {KIND_LABEL[r.chapter.kind]}
                  {r.chapter.num ? ` ${r.chapter.num}` : ''}
                </div>
                <p className="rt">
                  {r.chapter.title}
                  {r.chapter.film ? <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> · {r.chapter.film}</span> : null}
                </p>
                <p className="rs"><Highlight text={r.snippet} terms={terms} /></p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

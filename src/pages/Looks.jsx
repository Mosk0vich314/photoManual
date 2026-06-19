import React, { useState, useMemo } from 'react'
import { STYLES, FILTERS } from '../data/index.js'
import StyleCard from '../components/StyleCard.jsx'

// filter dimensions shown as horizontal chip rows
const ROWS = [
  { key: 'temp', label: 'Clima', opts: FILTERS.temp },
  { key: 'harmonyType', label: 'Armonia', opts: FILTERS.harmonyType },
  { key: 'subjects', label: 'Soggetto', opts: FILTERS.subjects, multi: true },
  { key: 'moods', label: 'Mood', opts: FILTERS.moods, multi: true },
]

export default function Looks() {
  const [active, setActive] = useState({}) // key -> Set of ids

  const toggle = (key, id) => {
    setActive((prev) => {
      const next = { ...prev }
      const set = new Set(next[key] || [])
      set.has(id) ? set.delete(id) : set.add(id)
      next[key] = set
      return next
    })
  }
  const clear = () => setActive({})

  const filtered = useMemo(() => {
    return STYLES.filter((s) => {
      for (const row of ROWS) {
        const sel = active[row.key]
        if (!sel || sel.size === 0) continue
        const m = s.m
        if (row.multi) {
          const vals = m[row.key] || []
          if (![...sel].some((id) => vals.includes(id))) return false
        } else {
          if (!sel.has(m[row.key])) return false
        }
      }
      return true
    })
  }, [active])

  const anyActive = Object.values(active).some((s) => s && s.size > 0)

  return (
    <div>
      <div className="filters ui">
        {ROWS.map((row) => (
          <div className="filt-row" key={row.key}>
            <span className="lbl">{row.label}</span>
            {row.opts.map((o) => {
              const on = active[row.key]?.has(o.id)
              return (
                <button key={o.id} className={'chip' + (on ? ' on' : '')} onClick={() => toggle(row.key, o.id)}>
                  {o.label}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <p className="count ui">
        {filtered.length} {filtered.length === 1 ? 'look' : 'look'}
        {anyActive && (
          <button onClick={clear} style={{ marginLeft: 10, color: 'var(--gold)', background: 'none', border: 'none', fontSize: 12 }}>
            Azzera filtri
          </button>
        )}
      </p>

      {filtered.length === 0 ? (
        <p className="empty">Nessun look con questi filtri.</p>
      ) : (
        <div className="gallery">
          {filtered.map((s) => (
            <StyleCard s={s} key={s.num} />
          ))}
        </div>
      )}
    </div>
  )
}

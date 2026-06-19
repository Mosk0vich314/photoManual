import React from 'react'
import { Link } from 'react-router-dom'
import { SCENE_GUIDE, styleByNum } from '../data/index.js'

export default function Picker() {
  return (
    <div className="ui">
      <h1 className="page" style={{ fontFamily: "'Iowan Old Style', Georgia, serif" }}>Quale look?</h1>
      <p className="subtitle">
        Lo stile deve assecondare la luce che c'è già. Parti dalla scena, non dal cursore.
      </p>

      <div className="scene-list">
        {SCENE_GUIDE.map((row, i) => {
          const styles = row.styles.map(styleByNum).filter(Boolean)
          const primary = styles[0]
          return (
            <Link className="scene-row" to={`/look/${primary.slug}`} key={i}>
              <div className="dots">
                {styles.map((s) => (
                  <i key={s.num} style={{ background: (s.m.swatches || ['#888'])[1] || '#888' }}>{s.num}</i>
                ))}
              </div>
              <div className="q">
                {row.scene}
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
                  {styles.map((s) => s.film || s.title.replace(/^Look\s+/, '')).join(' · ')}
                </div>
              </div>
              <span className="arr">›</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

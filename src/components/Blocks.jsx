import React from 'react'
import SchedaRapida from './SchedaRapida.jsx'

// Render one paragraph's runs: text | label(bold) | value(mono badge) | emph(italic)
function Para({ runs }) {
  return (
    <p>
      {runs.map((r, i) => {
        if (r.k === 'label') return <span className="lab" key={i}>{r.t}</span>
        if (r.k === 'value') return <span className="val" key={i}>{r.t.trim()}</span>
        if (r.k === 'emph') return <em key={i}>{r.t}</em>
        return <React.Fragment key={i}>{r.t}</React.Fragment>
      })}
    </p>
  )
}

// normalize curly apostrophes/quotes so widget keys can use straight ones
const normKey = (s) => (s || '').replace(/[‘’ʼ′]/g, "'")

// Render a list of blocks. `widgets` lets a page inject extra nodes after a
// given heading text (used for the color wheel, schematics, scene picker).
export default function Blocks({ blocks, widgets }) {
  const out = []
  blocks.forEach((b, i) => {
    if (b.type === 'heading') {
      out.push(
        <h2 className={'sec-h' + (i === 0 ? ' first' : '')} key={i}>
          {b.text}
        </h2>,
      )
    } else if (b.type === 'para') {
      out.push(<Para runs={b.runs} key={i} />)
    } else if (b.type === 'caption') {
      out.push(<p className="caption" key={i}>{b.text}</p>)
    } else if (b.type === 'example') {
      out.push(
        <p className="caption" key={i} style={{ borderColor: 'var(--gold-soft)', color: 'var(--text-2)' }}>
          {b.text}
        </p>,
      )
    } else if (b.type === 'scheda') {
      out.push(<SchedaRapida rows={b.rows} key={i} />)
    }
    if (b.type === 'heading' && widgets) {
      const w = widgets[b.text] || widgets[normKey(b.text)]
      if (w) out.push(<React.Fragment key={'w' + i}>{w}</React.Fragment>)
    }
  })
  return <div className="prose">{out}</div>
}

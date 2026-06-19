import React from 'react'

// Highlight numeric tokens (slider values) inside the quick-reference values.
function withNumbers(text) {
  // match things like -0,15/-0,30  +30/+50  ~210  20–40  8–12  T+10/+15
  const parts = text.split(/([+\-~]?\d[\d.,/–\-]*)/g)
  return parts.map((p, i) =>
    /^[+\-~]?\d/.test(p) ? <span className="n" key={i}>{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>,
  )
}

export default function SchedaRapida({ rows }) {
  return (
    <div className="scheda">
      <div className="sc-h">⚡ Scheda Rapida</div>
      {rows.map((r, i) => (
        <div className="row" key={i}>
          <div className="k">{r.label}</div>
          <div className="v">{withNumbers(r.value)}</div>
        </div>
      ))}
    </div>
  )
}

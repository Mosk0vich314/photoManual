import React from 'react'

// Smooth path (Catmull-Rom -> cubic Bézier) through pixel points — the SVG
// equivalent of TikZ's plot[smooth, tension=0.7].
function smooth(pts) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const t = 1 / 6
    const c1x = p1.x + (p2.x - p0.x) * t
    const c1y = p1.y + (p2.y - p0.y) * t
    const c2x = p2.x - (p3.x - p1.x) * t
    const c2y = p2.y - (p3.y - p1.y) * t
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

// The tone curve diagram. `points` are [input, output] pairs in 0..4 units
// (same scale as the manual's TikZ). x = neri→bianchi, y = scuro→chiaro.
export default function ToneCurve({ points, caption, annotated = false }) {
  const padL = 22, padR = 12, padT = 12, padB = 26
  const S = 200
  const W = padL + S + padR
  const H = padT + S + padB
  const map = ([x, y]) => ({ x: padL + (x / 4) * S, y: padT + (1 - y / 4) * S })
  const px = points.map(map)
  const d = smooth(px)
  const lifted = points[0][1] >= 0.3 // raised black point (faded)
  const gold = '#c7a86a'

  return (
    <figure className="fig">
      <div className="fig-frame">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption} fontFamily="'SF Pro Text', system-ui, sans-serif">
          {/* frame */}
          <rect x={padL} y={padT} width={S} height={S} fill="none" stroke="var(--line)" strokeWidth="1.2" />
          {/* grid: neri | ombre | mezzitoni | luci | bianchi */}
          {[1, 2, 3].map((i) => (
            <g key={i} stroke="var(--line)" strokeWidth="0.6" opacity="0.5">
              <line x1={padL + (i / 4) * S} y1={padT} x2={padL + (i / 4) * S} y2={padT + S} />
              <line x1={padL} y1={padT + (i / 4) * S} x2={padL + S} y2={padT + (i / 4) * S} />
            </g>
          ))}
          {/* "nessuna modifica" diagonal */}
          <line x1={map([0, 0]).x} y1={map([0, 0]).y} x2={map([4, 4]).x} y2={map([4, 4]).y}
            stroke="var(--text-3)" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
          {/* the curve */}
          <path d={d} fill="none" stroke={gold} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {lifted && <circle cx={px[0].x} cy={px[0].y} r="3.2" fill={gold} />}

          {annotated && (
            <>
              <circle cx={px[0].x} cy={px[0].y} r="3.2" fill={gold} />
              <text x={px[0].x + 6} y={px[0].y - 4} fontSize="9" fill={gold}>punto nero sollevato</text>
              <text x={padL + S * 0.30} y={padT + S * 0.74} fontSize="9" fill="var(--text-2)">sotto → scurisce</text>
              <text x={padL + S * 0.42} y={padT + S * 0.24} fontSize="9" fill="var(--text-2)">sopra → schiarisce</text>
            </>
          )}

          {/* axis labels */}
          <text x={padL + S / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-3)">
            ingresso: neri → bianchi
          </text>
          <text x={11} y={padT + S / 2} fontSize="10" fill="var(--text-3)" textAnchor="middle"
            transform={`rotate(-90 11 ${padT + S / 2})`}>
            uscita: scuro → chiaro
          </text>
        </svg>
      </div>
      {caption && <figcaption className="fig-cap">{caption}</figcaption>}
    </figure>
  )
}

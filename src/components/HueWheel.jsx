import React, { useRef, useState } from 'react'

const NAMES = [
  [0, 'Rosso'], [30, 'Arancio'], [60, 'Giallo'], [90, 'Lime'],
  [120, 'Verde'], [150, 'Verde acqua'], [180, 'Ciano'], [210, 'Blu'],
  [240, 'Blu'], [270, 'Viola'], [300, 'Magenta'], [330, 'Rosa'],
]
function nameFor(deg) {
  let best = NAMES[0]
  let bd = 360
  for (const n of NAMES) {
    const d = Math.min(Math.abs(deg - n[0]), 360 - Math.abs(deg - n[0]))
    if (d < bd) { bd = d; best = n }
  }
  return best[1]
}

// 0° at top, increasing clockwise — matches the manual's Color Grading wheel.
export default function HueWheel() {
  const ref = useRef(null)
  const [deg, setDeg] = useState(40)
  const dragging = useRef(false)

  const update = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const pt = e.touches ? e.touches[0] : e
    const dx = pt.clientX - cx
    const dy = pt.clientY - cy
    let a = (Math.atan2(dx, -dy) * 180) / Math.PI // 0 at top, clockwise
    if (a < 0) a += 360
    setDeg(Math.round(a))
  }

  const start = (e) => { dragging.current = true; update(e) }
  const move = (e) => { if (dragging.current) { e.preventDefault(); update(e) } }
  const end = () => { dragging.current = false }

  const R = 130
  const rad = (deg * Math.PI) / 180
  const mx = R + Math.sin(rad) * (R - 18)
  const my = R - Math.cos(rad) * (R - 18)
  const color = `hsl(${deg} 85% 55%)`

  return (
    <div className="wheel-wrap ui">
      <div
        ref={ref}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        style={{
          width: R * 2, height: R * 2, borderRadius: '50%', position: 'relative',
          touchAction: 'none', cursor: 'pointer',
          background:
            'conic-gradient(from 0deg, hsl(0 85% 55%), hsl(30 85% 55%), hsl(60 85% 55%), hsl(90 85% 55%), hsl(120 85% 55%), hsl(150 85% 55%), hsl(180 85% 55%), hsl(210 85% 55%), hsl(240 85% 55%), hsl(270 85% 55%), hsl(300 85% 55%), hsl(330 85% 55%), hsl(360 85% 55%))',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.08)',
        }}
      >
        {/* inner mask to make a ring + readout hub */}
        <div style={{
          position: 'absolute', inset: 40, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--bg) 60%, rgba(11,12,15,0.6) 100%)',
          display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 1px var(--line)',
        }}>
          <div className="wheel-read">
            <div className="deg" style={{ color }}>{deg}°</div>
            <div className="nm">{nameFor(deg)}</div>
          </div>
        </div>
        {/* marker */}
        <svg width={R * 2} height={R * 2} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <circle cx={mx} cy={my} r="13" fill={color} stroke="#fff" strokeWidth="2.5" />
        </svg>
      </div>
      <div className="wheel-hint">Trascina per leggere i gradi della ruota del Color Grading.</div>
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'

// ---- curve math -----------------------------------------------------------
// Monotone cubic (Fritsch–Carlson) interpolation -> 256-entry lookup table.
// Monotone = no overshoot, so the curve never bends outside [0,255]: the gold
// standard for tone-curve LUTs.
function buildLUT(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0])
  const n = pts.length
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const dx = [], dy = [], m = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = xs[i + 1] - xs[i] || 1
    dy[i] = ys[i + 1] - ys[i]
    m[i] = dy[i] / dx[i]
  }
  const t = new Array(n)
  t[0] = m[0]
  t[n - 1] = m[n - 2]
  for (let i = 1; i < n - 1; i++) {
    t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2
  }
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue }
    const a = t[i] / m[i], b = t[i + 1] / m[i]
    const h = Math.hypot(a, b)
    if (h > 3) { const s = 3 / h; t[i] = s * a * m[i]; t[i + 1] = s * b * m[i] }
  }
  const lut = new Uint8ClampedArray(256)
  let seg = 0
  for (let x = 0; x < 256; x++) {
    while (seg < n - 2 && x > xs[seg + 1]) seg++
    const h = dx[seg]
    const u = (x - xs[seg]) / h
    const u2 = u * u, u3 = u2 * u
    const h00 = 2 * u3 - 3 * u2 + 1
    const h10 = u3 - 2 * u2 + u
    const h01 = -2 * u3 + 3 * u2
    const h11 = u3 - u2
    lut[x] = h00 * ys[seg] + h10 * h * t[seg] + h01 * ys[seg + 1] + h11 * h * t[seg + 1]
  }
  return lut
}

// ---- test scene -----------------------------------------------------------
// Synthetic, copyright-free frame: blue sky + warm sun glow + green/dark
// ground, with an 11-step grey ramp at the bottom for precise tone reading.
// Chosen so BOTH luminance moves and channel (colour) moves are obvious.
function paintScene(data, W, H) {
  const horizon = 0.56
  const sun = { x: 0.72, y: 0.2 }
  const lerp = (a, b, t) => a + (b - a) * t
  const rampH = Math.round(H * 0.12)
  for (let y = 0; y < H; y++) {
    const ny = y / H
    for (let x = 0; x < W; x++) {
      const nx = x / W
      let r, g, b
      if (y >= H - rampH) {
        const step = Math.floor((x / W) * 11) / 10
        r = g = b = step * 255
      } else if (ny < horizon) {
        const t = ny / horizon
        r = lerp(120, 224, t); g = lerp(158, 196, t); b = lerp(200, 168, t)
        const dx = nx - sun.x, dy = ny - sun.y
        const d = Math.sqrt(dx * dx + dy * dy)
        const glow = Math.max(0, 1 - d / 0.5) ** 2.2
        r = Math.min(255, r + glow * 130); g = Math.min(255, g + glow * 105); b = Math.min(255, b + glow * 55)
      } else {
        const t = (ny - horizon) / (1 - horizon - 0.12)
        r = lerp(96, 26, t); g = lerp(104, 24, t); b = lerp(74, 20, t)
      }
      // gentle vignette
      const vx = nx - 0.5, vy = ny - 0.5
      const vig = 1 - Math.min(1, (vx * vx + vy * vy) * 0.8) * 0.35
      const i = (y * W + x) * 4
      data[i] = r * vig; data[i + 1] = g * vig; data[i + 2] = b * vig; data[i + 3] = 255
    }
  }
}

// ---- config ---------------------------------------------------------------
const IW = 384, IH = 232
const PAD = { l: 24, r: 12, t: 12, b: 22 }, S = 200
const VW = PAD.l + S + PAD.r, VH = PAD.t + S + PAD.b
const LINEAR = [[0, 0], [255, 255]]
const CHANNELS = [
  { id: 'rgb', label: 'RGB', color: '#d8c9a0' },
  { id: 'r', label: 'R', color: '#e0584f' },
  { id: 'g', label: 'G', color: '#5fae5f' },
  { id: 'b', label: 'B', color: '#5b8cff' },
]
const RULE = {
  rgb: 'Canale composito: agisce solo sulla luminosità. Su = schiarisce, giù = scurisce.',
  r: 'Rosso: su → rosso/caldo · giù → ciano.',
  g: 'Verde: su → verde · giù → magenta.',
  b: 'Blu: su → blu/freddo · giù → giallo/caldo.',
}
const PRESETS = {
  Azzera: { rgb: LINEAR, r: LINEAR, g: LINEAR, b: LINEAR },
  Contrasto: { rgb: [[0, 0], [64, 44], [128, 128], [192, 212], [255, 255]], r: LINEAR, g: LINEAR, b: LINEAR },
  Sbiadito: { rgb: [[0, 42], [128, 132], [255, 232]], r: LINEAR, g: LINEAR, b: LINEAR },
  'Teal & Orange': {
    rgb: LINEAR,
    r: [[0, 0], [128, 128], [255, 248]],
    g: LINEAR,
    b: [[0, 58], [128, 124], [255, 206]],
  },
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export default function CurvePlayground() {
  const canvasRef = useRef(null)
  const baseRef = useRef(null)   // source ImageData
  const outRef = useRef(null)    // working ImageData
  const svgRef = useRef(null)
  const [channel, setChannel] = useState('rgb')
  const [pts, setPts] = useState({ rgb: LINEAR, r: LINEAR, g: LINEAR, b: LINEAR })
  const [sel, setSel] = useState(null)        // selected point index (current channel)
  const [dragging, setDragging] = useState(false)
  const [ready, setReady] = useState(false)

  // build the source scene once
  useEffect(() => {
    const cv = canvasRef.current
    const ctx = cv.getContext('2d', { willReadFrequently: true })
    const base = ctx.createImageData(IW, IH)
    paintScene(base.data, IW, IH)
    baseRef.current = base
    outRef.current = ctx.createImageData(IW, IH)
    setReady(true)
  }, [])

  // re-render the preview whenever a curve changes
  useEffect(() => {
    if (!ready) return
    const lutR = buildLUT(pts.r), lutG = buildLUT(pts.g), lutB = buildLUT(pts.b), lutRGB = buildLUT(pts.rgb)
    const s = baseRef.current.data, d = outRef.current.data
    for (let i = 0; i < s.length; i += 4) {
      // channel curves first, then the composite (contrast on top)
      d[i] = lutRGB[lutR[s[i]]]
      d[i + 1] = lutRGB[lutG[s[i + 1]]]
      d[i + 2] = lutRGB[lutB[s[i + 2]]]
      d[i + 3] = 255
    }
    canvasRef.current.getContext('2d').putImageData(outRef.current, 0, 0)
  }, [pts, ready])

  const mapX = (v) => PAD.l + (v / 255) * S
  const mapY = (v) => PAD.t + (1 - v / 255) * S
  const cur = CHANNELS.find((c) => c.id === channel)
  const lut = buildLUT(pts[channel])

  // ---- pointer geometry (in viewBox units; the svg scales uniformly) ----
  const GRAB = 18  // tap within this of a point => grab it (not add)
  const ADD = 12   // tap within this of the curve line => add a point
  const eventToView = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    return [((e.clientX - rect.left) / rect.width) * VW, ((e.clientY - rect.top) / rect.height) * VH]
  }
  const viewToData = ([vx, vy]) => [
    clamp(((vx - PAD.l) / S) * 255, 0, 255),
    clamp((1 - (vy - PAD.t) / S) * 255, 0, 255),
  ]

  const setChannelPts = (next) => setPts((p) => ({ ...p, [channel]: next }))

  // drive an active drag through window listeners (robust across the gesture)
  useEffect(() => {
    if (!dragging || sel == null) return
    const onMove = (e) => {
      e.preventDefault()
      const [dx, dy] = viewToData(eventToView(e))
      setPts((p) => {
        const arr = p[channel].map((q) => [...q])
        const last = arr.length - 1
        if (sel === 0) arr[0] = [0, Math.round(dy)]
        else if (sel === last) arr[last] = [255, Math.round(dy)]
        else {
          const lo = arr[sel - 1][0] + 3, hi = arr[sel + 1][0] - 3
          arr[sel] = [Math.round(clamp(dx, lo, hi)), Math.round(dy)]
        }
        return { ...p, [channel]: arr }
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, sel, channel])

  // single entry point: grab the nearest point, else add one ONLY if the tap
  // lands on the curve, else just deselect. No more stray points.
  const onPointerDown = (e) => {
    const view = eventToView(e)
    const arr = pts[channel]
    let best = -1, bestD = Infinity
    arr.forEach((p, i) => {
      const d = Math.hypot(mapX(p[0]) - view[0], mapY(p[1]) - view[1])
      if (d < bestD) { bestD = d; best = i }
    })
    if (bestD <= GRAB) { setSel(best); setDragging(true); return }

    const [dx, dy] = viewToData(view)
    const onCurve = Math.abs(view[1] - mapY(lut[clamp(Math.round(dx), 0, 255)])) <= ADD
    if (onCurve) {
      const a = arr.map((q) => [...q])
      let idx = a.findIndex((q) => q[0] > dx)
      if (idx <= 0) idx = a.length - 1
      idx = clamp(idx, 1, a.length - 1)
      a.splice(idx, 0, [Math.round(clamp(dx, a[idx - 1][0] + 3, a[idx][0] - 3)), Math.round(dy)])
      setChannelPts(a)
      setSel(idx)
      setDragging(true)
      return
    }
    setSel(null)
  }

  const pickChannel = (id) => { setChannel(id); setSel(null) }
  const applyPreset = (name) => { setPts({ ...PRESETS[name] }); setSel(null) }
  const lastIdx = pts[channel].length - 1
  const canRemove = sel != null && sel !== 0 && sel !== lastIdx
  const removeSelected = () => {
    if (!canRemove) return
    setChannelPts(pts[channel].filter((_, j) => j !== sel))
    setSel(null)
  }

  let path = `M ${mapX(0)} ${mapY(lut[0])}`
  for (let x = 4; x <= 255; x += 4) path += ` L ${mapX(x)} ${mapY(lut[x])}`

  return (
    <div className="curve-lab ui">
      <canvas ref={canvasRef} width={IW} height={IH} className="cv-canvas" />

      <div className="curve-tabs">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            className={'tab' + (channel === c.id ? ' on' : '')}
            style={channel === c.id ? { borderColor: c.color, color: c.color } : undefined}
            onClick={() => pickChannel(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="curve-svg"
        onPointerDown={onPointerDown}
      >
        <rect x={PAD.l} y={PAD.t} width={S} height={S} fill="none" stroke="var(--line)" strokeWidth="1.2" />
        {[1, 2, 3].map((i) => (
          <g key={i} stroke="var(--line)" strokeWidth="0.6" opacity="0.5">
            <line x1={PAD.l + (i / 4) * S} y1={PAD.t} x2={PAD.l + (i / 4) * S} y2={PAD.t + S} />
            <line x1={PAD.l} y1={PAD.t + (i / 4) * S} x2={PAD.l + S} y2={PAD.t + (i / 4) * S} />
          </g>
        ))}
        <line x1={mapX(0)} y1={mapY(0)} x2={mapX(255)} y2={mapY(255)}
          stroke="var(--text-3)" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <path d={path} fill="none" stroke={cur.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {pts[channel].map((p, i) => (
          <g key={i}>
            {sel === i && (
              <circle cx={mapX(p[0])} cy={mapY(p[1])} r="11" fill="none" stroke={cur.color} strokeWidth="1.5" opacity="0.6" />
            )}
            <circle
              cx={mapX(p[0])} cy={mapY(p[1])} r="6.5"
              fill={cur.color} stroke="#0b0c0f" strokeWidth="1.5"
            />
          </g>
        ))}
      </svg>

      <div className="curve-actions">
        <button className="pbtn danger" onClick={removeSelected} disabled={!canRemove}>
          ✕ Rimuovi punto
        </button>
      </div>

      <div className="curve-presets">
        {Object.keys(PRESETS).map((name) => (
          <button key={name} className="pbtn" onClick={() => applyPreset(name)}>
            {name}
          </button>
        ))}
      </div>

      <p className="curve-hint">
        Tocca un punto per selezionarlo e trascinalo. Tocca <i>sulla curva</i> per aggiungerne uno;
        «Rimuovi punto» per toglierlo.
      </p>
      <p className="curve-hint" style={{ marginTop: 2 }}>{RULE[channel]}</p>
    </div>
  )
}

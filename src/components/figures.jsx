import React from 'react'

// Schematics rebuilt from the manual's TikZ figures as responsive SVG.
// Shared look: dark framed panel, gold accent, captions below.

const GOLD = '#c7a86a'
const SANS = "'SF Pro Text', system-ui, sans-serif"

function Fig({ caption, children, frame = true }) {
  return (
    <figure className="fig">
      {frame ? <div className="fig-frame">{children}</div> : children}
      {caption && <figcaption className="fig-cap">{caption}</figcaption>}
    </figure>
  )
}

function smooth(pts) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    const t = 1 / 6
    d += ` C ${(p1.x + (p2.x - p0.x) * t).toFixed(2)} ${(p1.y + (p2.y - p0.y) * t).toFixed(2)} ${(p2.x - (p3.x - p1.x) * t).toFixed(2)} ${(p2.y - (p3.y - p1.y) * t).toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

const pol = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)]

// ---- Istogramma (Scattare per la Post) ----------------------------------
export function Histogram() {
  const W = 320, H = 130, padX = 10, top = 12, base = 100
  const pts = [[0, 0.15], [1.1, 0.9], [2.4, 2.1], [3.8, 1.4], [5.2, 1.9], [6.8, 0.7], [8, 0.5]]
  const map = ([x, y]) => ({ x: padX + (x / 8) * (W - 2 * padX), y: base - (y / 2.6) * (base - top) })
  const mp = pts.map(map)
  const line = smooth(mp)
  const area = `${line} L ${mp[mp.length - 1].x} ${base} L ${mp[0].x} ${base} Z`
  const zones = ['neri', 'ombre', 'mezzitoni', 'luci', 'bianchi']
  return (
    <Fig caption="L’istogramma: distribuzione dei toni. Un picco appoggiato a un bordo significa informazione persa (clipping).">
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={SANS}>
        <rect x={padX} y={top} width={W - 2 * padX} height={base - top} fill="none" stroke="var(--line)" strokeWidth="1" />
        {[1.6, 3.2, 4.8, 6.4].map((x, i) => (
          <line key={i} x1={map([x, 0]).x} y1={top} x2={map([x, 0]).x} y2={base} stroke="var(--line)" strokeDasharray="3 3" opacity="0.5" />
        ))}
        <path d={area} fill={GOLD} opacity="0.28" />
        <path d={line} fill="none" stroke={GOLD} strokeWidth="1.6" />
        {zones.map((z, i) => (
          <text key={z} x={padX + (0.8 + i * 1.6) / 8 * (W - 2 * padX)} y={base + 13} textAnchor="middle" fontSize="9.5" fill="var(--text-3)">{z}</text>
        ))}
        <line x1={map([7, 2.0]).x} y1={map([7, 2.0]).y} x2={map([7.9, 0.6]).x} y2={map([7.9, 0.6]).y} stroke={GOLD} strokeWidth="1" markerEnd="" />
        <text x={W - padX} y={top + 8} textAnchor="end" fontSize="9.5" fill={GOLD}>coda sul bordo = clipping</text>
      </svg>
    </Fig>
  )
}

// ---- Scala dei tempi di scatto (Expert RAW) -----------------------------
export function ShutterScale() {
  const W = 320, H = 92, x0 = 10, x1 = 310, y = 58, h = 16
  const X = (t) => x0 + (t / 11) * (x1 - x0)
  const ticks = [[0.4, '1/4000'], [1.8, '1/1000'], [3.2, '1/250'], [4.5, '1/100'], [5.7, '1/30'], [6.8, '1/8'], [8.2, '1 s'], [9.8, '30 s']]
  return (
    <Fig caption="La scala dei tempi di scatto. A sinistra si congela il movimento, a destra si accumula luce — e mosso.">
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={SANS}>
        <rect x={X(0)} y={y} width={X(4.5) - X(0)} height={h} fill={GOLD} opacity="0.32" />
        <rect x={X(4.5)} y={y} width={X(6.8) - X(4.5)} height={h} fill={GOLD} opacity="0.14" />
        <rect x={x0} y={y} width={x1 - x0} height={h} fill="none" stroke="var(--line)" strokeWidth="1" />
        {ticks.map(([t, l]) => (
          <g key={l}>
            <line x1={X(t)} y1={y + h} x2={X(t)} y2={y + h + 4} stroke="var(--text-3)" />
            <text x={X(t)} y={y + h + 14} textAnchor="middle" fontSize="8.5" fill="var(--text-3)">{l}</text>
          </g>
        ))}
        <text x={X(2.2)} y={y - 6} textAnchor="middle" fontSize="9" fill="var(--text-2)">mano libera sicura</text>
        <text x={X(5.65)} y={y - 6} textAnchor="middle" fontSize="9" fill="var(--text-2)">zona a rischio mosso</text>
        <text x={X(8.9)} y={y - 6} textAnchor="middle" fontSize="9" fill="var(--text-2)">appoggio / treppiede</text>
        <line x1={X(4.5)} y1={y - 18} x2={X(4.5)} y2={y - 2} stroke={GOLD} strokeWidth="1.3" />
        <text x={X(4.5)} y={y - 22} textAnchor="middle" fontSize="9" fill={GOLD}>limite a mano libera</text>
      </svg>
    </Fig>
  )
}

// ---- Triangolo dell'esposizione (Expert RAW) ----------------------------
export function ExposureTriangle() {
  const W = 320, H = 200, cx = 110, cy = 110, r = 66
  const T = pol(cx, cy, r, 90), I = pol(cx, cy, r, 210), A = pol(cx, cy, r, 330)
  return (
    <Fig caption="Il triangolo dell’esposizione sul telefono: con l’apertura fissa, restano tempo e ISO, in reciprocità.">
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={SANS}>
        <line x1={T[0]} y1={T[1]} x2={A[0]} y2={A[1]} stroke="var(--text-3)" strokeDasharray="4 3" opacity="0.5" />
        <line x1={I[0]} y1={I[1]} x2={A[0]} y2={A[1]} stroke="var(--text-3)" strokeDasharray="4 3" opacity="0.5" />
        <line x1={T[0]} y1={T[1]} x2={I[0]} y2={I[1]} stroke={GOLD} strokeWidth="2" />
        {[T, I, A].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={i === 2 ? 'var(--text-3)' : GOLD} />)}
        <text x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fill="var(--text-3)">esposizione</text>
        <text x={T[0]} y={T[1] - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">Tempo</text>
        <text x={I[0] - 6} y={I[1] + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">ISO</text>
        <text x={A[0] + 4} y={A[1] + 14} textAnchor="middle" fontSize="10" fill="var(--text-3)">Apertura (fissa)</text>
        <text x={196} y={70} fontSize="9.5" fill="var(--text-2)">tempo più lento →</text>
        <text x={196} y={83} fontSize="9.5" fill="var(--text-2)">più luce, più mosso</text>
        <text x={196} y={108} fontSize="9.5" fill="var(--text-2)">ISO più alto →</text>
        <text x={196} y={121} fontSize="9.5" fill="var(--text-2)">più luce, più rumore</text>
      </svg>
    </Fig>
  )
}

// ---- Tecnica della soglia (Pannello Custom) -----------------------------
export function ThresholdDemo() {
  const W = 320, H = 150
  return (
    <Fig caption="La tecnica della soglia. A sinistra lo schermo nero dei Bianchi mostra i pixel in clipping; a destra lo schermo bianco dei Neri evidenzia il nero puro.">
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={SANS}>
        <rect x={8} y={28} width={130} height={88} fill="#000" stroke="var(--line)" />
        <circle cx={48} cy={58} r="3.5" fill="#19c3d6" />
        <circle cx={96} cy={86} r="4.5" fill="#d63ca0" />
        <circle cx={70} cy={70} r="2.5" fill="#fff" />
        <text x={73} y={126} textAnchor="middle" fontSize="9.5" fill="var(--text-2)">Soglia Bianchi (schermo nero)</text>
        <text x={73} y={20} textAnchor="middle" fontSize="9" fill={GOLD}>spingi finché compaiono pixel</text>
        <path d="M 150 72 L 170 72" stroke={GOLD} strokeWidth="2" />
        <path d="M 170 72 l -6 -4 l 0 8 z" fill={GOLD} />
        <rect x={182} y={28} width={130} height={88} fill="#f0f0f0" stroke="var(--line)" />
        <circle cx={222} cy={62} r="3.5" fill="#000" />
        <circle cx={262} cy={90} r="5" fill="#000" />
        <text x={247} y={126} textAnchor="middle" fontSize="9.5" fill="var(--text-2)">Soglia Neri (schermo bianco)</text>
        <text x={247} y={20} textAnchor="middle" fontSize="9" fill={GOLD}>spingi finché compaiono punti neri</text>
      </svg>
    </Fig>
  )
}

// ---- Recupero del cielo (Il Cielo) --------------------------------------
export function SkyRecovery() {
  const W = 320, H = 120
  return (
    <Fig caption="Recupero del cielo: finché c’è informazione (non bianco puro), abbassare Luci/Bianchi e mascherare il cielo ne fa riemergere struttura e colore.">
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={SANS}>
        {/* prima */}
        <g>
          <rect x={8} y={14} width={120} height={84} fill="none" stroke="var(--line)" />
          <rect x={9} y={15} width={118} height={40} fill="#e6e6e6" opacity="0.85" />
          <rect x={9} y={55} width={118} height={42} fill="#2C3E50" opacity="0.5" />
          <text x={68} y={112} textAnchor="middle" fontSize="9.5" fill="var(--text-3)">cielo bruciato</text>
        </g>
        <path d="M 138 56 L 182 56" stroke={GOLD} strokeWidth="2" />
        <path d="M 182 56 l -6 -4 l 0 8 z" fill={GOLD} />
        <text x={160} y={48} textAnchor="middle" fontSize="9" fill={GOLD}>recupero</text>
        {/* dopo */}
        <g>
          <rect x={192} y={14} width={120} height={84} fill="none" stroke="var(--line)" />
          <rect x={193} y={15} width={118} height={40} fill="#2C3E50" opacity="0.7" />
          <ellipse cx={228} cy={32} rx={20} ry={8} fill="#dfe3e6" opacity="0.55" />
          <ellipse cx={278} cy={42} rx={24} ry={8} fill="#dfe3e6" opacity="0.45" />
          <rect x={193} y={55} width={118} height={42} fill="#2C3E50" opacity="0.45" />
          <text x={252} y={112} textAnchor="middle" fontSize="9.5" fill="var(--text-3)">nuvole e blu riemergono</text>
        </g>
      </svg>
    </Fig>
  )
}

// ---- Le armonie: 4 mini-ruote (Teoria del Colore) -----------------------
function MiniWheel({ type, label }) {
  const D = 92, c = D / 2, r = c - 14
  const dot = (deg, key, big) => { const [x, y] = pol(c, c, r, deg); return <circle key={key} cx={x} cy={y} r={big ? 3 : 2.4} fill={GOLD} /> }
  const seg = (a, b) => { const p = pol(c, c, r, a), q = pol(c, c, r, b); return <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={GOLD} strokeWidth="1.3" /> }
  let content = null
  if (type === 'complementare') content = <>{seg(30, 210)}{dot(30, 'a')}{dot(210, 'b')}</>
  else if (type === 'analoga') {
    const A = pol(c, c, r, 150), B = pol(c, c, r, 210)
    content = <><path d={`M ${A[0]} ${A[1]} A ${r} ${r} 0 0 1 ${B[0]} ${B[1]}`} fill="none" stroke={GOLD} strokeWidth="2.4" />{dot(150, 'a')}{dot(180, 'b')}{dot(210, 'c')}</>
  } else if (type === 'split') content = <>{seg(180, 30)}{seg(180, 240)}{dot(30, 'a')}{dot(180, 'b')}{dot(240, 'c')}</>
  else if (type === 'triadica') content = <>{seg(90, 210)}{seg(210, 330)}{seg(330, 90)}{dot(90, 'a')}{dot(210, 'b')}{dot(330, 'c')}</>
  return (
    <div className="fig-cell">
      <svg viewBox={`0 0 ${D} ${D}`} fontFamily={SANS}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--text-3)" strokeWidth="1" opacity="0.6" />
        {content}
      </svg>
      <div className="fig-cell-cap">{label}</div>
    </div>
  )
}

export function HarmonyWheels() {
  return (
    <Fig frame={false} caption="Le quattro relazioni fondamentali sulla ruota: distanza e disposizione dei colori determinano l’effetto.">
      <div className="fig-frame fig-row">
        <MiniWheel type="complementare" label="complementare" />
        <MiniWheel type="analoga" label="analoga" />
        <MiniWheel type="split" label="split-compl." />
        <MiniWheel type="triadica" label="triadica" />
      </div>
    </Fig>
  )
}

// ---- Ruota delle tonalità con fascia incarnato (Ritrarre il Volto) ------
export function SkinToneBand() {
  const W = 240, cx = 120, cy = 134, R = 82, hole = 50
  const wedges = []
  for (let a = 0; a < 360; a += 15) {
    const p1 = pol(cx, cy, R, a - 7.5), p2 = pol(cx, cy, R, a + 7.5)
    wedges.push(<path key={a} d={`M ${cx} ${cy} L ${p1[0]} ${p1[1]} A ${R} ${R} 0 0 0 ${p2[0]} ${p2[1]} Z`} fill={`hsl(${a} 75% 55%)`} />)
  }
  const b1 = pol(cx, cy, R + 6, 18), b2 = pol(cx, cy, R + 6, 42)
  const tick = pol(cx, cy, R + 18, 30)
  return (
    <Fig caption="Tutta la pelle umana vive in una fascia di ~20° (arancio). Pochi gradi di spostamento cambiano il significato del volto.">
      <svg viewBox={`0 0 ${W} 240`} fontFamily={SANS}>
        <text x={cx} y={18} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={GOLD}>fascia incarnato · 20–40°</text>
        {wedges}
        <circle cx={cx} cy={cy} r={hole} fill="var(--panel)" />
        {/* fascia incarnato 18–42° + tacca verso l'etichetta */}
        <path d={`M ${b1[0]} ${b1[1]} A ${R + 6} ${R + 6} 0 0 0 ${b2[0]} ${b2[1]}`} fill="none" stroke={GOLD} strokeWidth="4.5" strokeLinecap="round" />
        <line x1={tick[0]} y1={tick[1]} x2={tick[0] + 6} y2={tick[1] - 10} stroke={GOLD} strokeWidth="1.2" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10.5" fill="var(--text-2)">− rosso: vitalità</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10.5" fill="var(--text-2)">+ giallo: malattia</text>
      </svg>
    </Fig>
  )
}

// ---- Regola dei terzi (Inquadratura) ------------------------------------
export function RuleOfThirds() {
  const W = 300, H = 200, x0 = 8, y0 = 8, w = W - 16, h = H - 24
  const vx = [x0 + w / 3, x0 + 2 * w / 3], hy = [y0 + h / 3, y0 + 2 * h / 3]
  const pts = [[vx[0], hy[0]], [vx[1], hy[0]], [vx[0], hy[1]], [vx[1], hy[1]]]
  return (
    <Fig caption="Regola dei terzi: i quattro punti di forza (intersezioni) e l’orizzonte allineato a una linea.">
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={SANS}>
        <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="var(--line)" strokeWidth="1.2" />
        {vx.map((x, i) => <line key={'v' + i} x1={x} y1={y0} x2={x} y2={y0 + h} stroke="var(--text-3)" strokeDasharray="4 3" opacity="0.6" />)}
        {hy.map((y, i) => <line key={'h' + i} x1={x0} y1={y} x2={x0 + w} y2={y} stroke="var(--text-3)" strokeDasharray="4 3" opacity="0.6" />)}
        <line x1={x0} y1={hy[1]} x2={x0 + w} y2={hy[1]} stroke={GOLD} strokeWidth="1.4" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--text-2)" />)}
        <circle cx={vx[0]} cy={hy[1]} r="5.5" fill={GOLD} />
        <text x={vx[0]} y={hy[1] - 9} textAnchor="middle" fontSize="9.5" fill={GOLD}>soggetto</text>
        <text x={x0 + w * 0.7} y={hy[1] + 15} textAnchor="middle" fontSize="9" fill="var(--text-3)">orizzonte sul terzo inferiore</text>
      </svg>
    </Fig>
  )
}

// ---- Spirale aurea / Fibonacci (Inquadratura) ---------------------------
function arc(x0, y0, a0, a1, r) {
  const cx = x0 - r * Math.cos((a0 * Math.PI) / 180)
  const cy = y0 - r * Math.sin((a0 * Math.PI) / 180)
  const n = Math.max(10, Math.round(Math.abs(a1 - a0) / 6))
  const out = []
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + (a1 - a0) * (i / n)) * Math.PI) / 180
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return out
}
export function GoldenSpiral() {
  const minX = -3, maxX = 10, minY = -5, maxY = 3
  const pad = 8, k = 23
  const W = pad * 2 + (maxX - minX) * k, H = pad * 2 + (maxY - minY) * k
  const m = ([x, y]) => [pad + (x - minX) * k, pad + (maxY - y) * k]
  const squares = [[0, 0, 1, 1], [1, 0, 1, 1], [0, 1, 2, 2], [-3, 0, 3, 3], [-3, -5, 5, 5], [2, -5, 8, 8]]
  const arcs = [arc(1, 0, 270, 360, 1), arc(2, 1, 0, 90, 2), arc(0, 3, 90, 180, 3), arc(-3, 0, 180, 270, 5), arc(2, -5, 270, 360, 8)]
  const toPath = (pp) => pp.map((p, i) => { const q = m(p); return `${i ? 'L' : 'M'} ${q[0].toFixed(1)} ${q[1].toFixed(1)}` }).join(' ')
  return (
    <Fig caption="Spirale aurea: i quadrati di lato 1, 1, 2, 3, 5, 8 e la curva che converge verso il punto focale.">
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={SANS}>
        {squares.map((s, i) => { const a = m([s[0], s[1] + s[3]]); return <rect key={i} x={a[0]} y={a[1]} width={s[2] * k} height={s[3] * k} fill="none" stroke="var(--line)" strokeWidth="0.8" opacity="0.7" /> })}
        {arcs.map((pp, i) => <path key={i} d={toPath(pp)} fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />)}
      </svg>
    </Fig>
  )
}

// ---- Headroom & lookroom (Inquadratura) ---------------------------------
export function HeadroomLookroom() {
  const W = 300, H = 200, x0 = 8, y0 = 8, w = W - 16, h = H - 16
  const vx = [x0 + w / 3, x0 + 2 * w / 3], hy1 = y0 + h / 3
  const hx = x0 + w * 0.30, hyc = y0 + h * 0.46, hr = 30
  return (
    <Fig caption="Headroom e lookroom: spazio misurato sopra la testa e ampio respiro davanti alla direzione dello sguardo.">
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={SANS}>
        <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="var(--line)" strokeWidth="1.2" />
        {vx.map((x, i) => <line key={i} x1={x} y1={y0} x2={x} y2={y0 + h} stroke="var(--text-3)" strokeDasharray="3 3" opacity="0.3" />)}
        <line x1={x0} y1={hy1} x2={x0 + w} y2={hy1} stroke="var(--text-3)" strokeDasharray="3 3" opacity="0.3" />
        <circle cx={hx} cy={hyc} r={hr} fill="none" stroke="var(--text-2)" strokeWidth="1.4" />
        <path d={`M ${hx + hr} ${hyc} l -14 -9 l 0 18 z`} fill="var(--text-2)" />
        <line x1={x0 + 24} y1={y0} x2={x0 + 24} y2={hyc - hr} stroke="var(--text-2)" />
        <path d={`M ${x0 + 24} ${y0} l -3 6 l 6 0 z`} fill="var(--text-2)" />
        <path d={`M ${x0 + 24} ${hyc - hr} l -3 -6 l 6 0 z`} fill="var(--text-2)" />
        <text x={x0 + 30} y={(y0 + hyc - hr) / 2 + 4} fontSize="9.5" fill="var(--text-2)">headroom</text>
        <line x1={hx + hr + 6} y1={hyc} x2={x0 + w - 10} y2={hyc} stroke={GOLD} strokeDasharray="4 3" strokeWidth="1.3" />
        <path d={`M ${x0 + w - 10} ${hyc} l -8 -4 l 0 8 z`} fill={GOLD} />
        <text x={(hx + hr + x0 + w) / 2} y={hyc + 16} textAnchor="middle" fontSize="9.5" fill={GOLD}>spazio di sguardo (lookroom)</text>
      </svg>
    </Fig>
  )
}

// ---- Interfaccia Expert RAW (Expert RAW sul telefono) -------------------
const PHONE_LEGEND = [
  ['1', 'Risoluzione (50M / 12M)'], ['2', 'Formato RAW+JPEG'], ['3', 'Istogramma live'],
  ['4', 'Livella elettronica'], ['5', 'Apertura — fissa'], ['6', 'Tempo di scatto'],
  ['7', 'Sensibilità ISO'], ['8', 'Compensazione EV'], ['9', 'Bilanciamento bianco (K)'],
  ['10', 'Messa a fuoco manuale'], ['11', 'Obiettivo (UW / W / ST)'], ['12', 'Labs (astro, multi-esposiz.)'],
]
function Num({ x, y, n }) {
  return <><circle cx={x} cy={y} r="7" fill={GOLD} /><text x={x} y={y + 3} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#0b0c0f">{n}</text></>
}
export function PhoneUI() {
  const W = 200, H = 330
  return (
    <Fig caption="L’interfaccia di Expert RAW. In giallo i valori impostati manualmente; in grigio i parametri non regolabili.">
      <div className="fig-frame">
        <svg viewBox={`0 0 ${W} ${H}`} fontFamily={SANS} style={{ maxWidth: 220, margin: '0 auto' }}>
          <rect x={6} y={6} width={188} height={318} rx={16} fill="none" stroke="var(--text-2)" strokeWidth="1.4" />
          {/* mirino */}
          <rect x={12} y={70} width={176} height={196} fill="var(--bg-2)" stroke="var(--line)" />
          <line x1={70.7} y1={70} x2={70.7} y2={266} stroke="var(--line)" opacity="0.5" />
          <line x1={129.3} y1={70} x2={129.3} y2={266} stroke="var(--line)" opacity="0.5" />
          <line x1={12} y1={135.3} x2={188} y2={135.3} stroke="var(--line)" opacity="0.5" />
          <line x1={12} y1={200.6} x2={188} y2={200.6} stroke="var(--line)" opacity="0.5" />
          {/* riga sup */}
          <text x={22} y={56} fontSize="9" fill="var(--text-2)">50M</text>
          <text x={70} y={56} fontSize="9" fill="var(--text-2)">RAW+JPEG</text>
          <rect x={150} y={44} width={34} height={18} fill="none" stroke="var(--line)" />
          <path d="M 152 60 q 8 -16 16 -6 q 8 8 14 -8" fill="none" stroke={GOLD} strokeWidth="1" />
          {/* livella */}
          <circle cx={100} cy={150} r="13" fill="none" stroke="var(--text-3)" />
          <line x1={83} y1={150} x2={117} y2={150} stroke="var(--text-3)" />
          {/* barra controlli */}
          <rect x={14} y={276} width={172} height={20} rx={6} fill="#2C3E50" opacity="0.3" />
          <text x={30} y={289} fontSize="8.5" fill="var(--text-3)">F1.7</text>
          <text x={66} y={289} fontSize="8.5" fill="var(--text)">1/90s</text>
          <text x={104} y={289} fontSize="8.5" fill="var(--text)">ISO1600</text>
          <text x={145} y={289} fontSize="8.5" fill="var(--text)">EV0</text>
          <text x={170} y={289} fontSize="8.5" fill={GOLD}>5500K</text>
          {/* MF + obiettivi */}
          <rect x={14} y={300} width={28} height={16} rx={4} fill="none" stroke="var(--line)" />
          <text x={28} y={311} textAnchor="middle" fontSize="8" fill={GOLD}>MF</text>
          <text x={70} y={311} textAnchor="middle" fontSize="8" fill="var(--text-2)">UW</text>
          <circle cx={100} cy={308} r="7" fill={GOLD} /><text x={100} y={311} textAnchor="middle" fontSize="8" fill="#0b0c0f">W</text>
          <text x={128} y={311} textAnchor="middle" fontSize="8" fill="var(--text-2)">ST</text>
          {/* Labs (basso-destra del mirino) */}
          <text x={176} y={258} textAnchor="end" fontSize="8" fill="var(--text-3)">Labs</text>
          {/* callout */}
          <Num x={22} y={40} n="1" /><Num x={92} y={40} n="2" /><Num x={167} y={36} n="3" />
          <Num x={120} y={150} n="4" /><Num x={24} y={266} n="5" /><Num x={66} y={270} n="6" />
          <Num x={104} y={270} n="7" /><Num x={145} y={270} n="8" /><Num x={180} y={268} n="9" />
          <Num x={52} y={308} n="10" /><Num x={150} y={308} n="11" /><Num x={184} y={250} n="12" />
        </svg>
        <ol className="fig-legend">
          {PHONE_LEGEND.map(([n, t]) => (
            <li key={n}><span className="fig-legend-n">{n}</span>{t}</li>
          ))}
        </ol>
      </div>
    </Fig>
  )
}

import React, { useEffect } from 'react'
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { styleBySlug, chapterBySlug, profileBySlug } from './data/index.js'

import Home from './pages/Home.jsx'
import Looks from './pages/Looks.jsx'
import StyleDetail from './pages/StyleDetail.jsx'
import Profili from './pages/Profili.jsx'
import ProfileDetail from './pages/ProfileDetail.jsx'
import Manuale from './pages/Manuale.jsx'
import ChapterReader from './pages/ChapterReader.jsx'
import Picker from './pages/Picker.jsx'
import Search from './pages/Search.jsx'

const TABS = [
  { to: '/', ic: '◐', label: 'Inizio', end: true },
  { to: '/look', ic: '▦', label: 'Look' },
  { to: '/scena', ic: '◎', label: 'Scena' },
  { to: '/manuale', ic: '☰', label: 'Manuale' },
  { to: '/cerca', ic: '⌕', label: 'Cerca' },
]
const ROOTS = new Set(TABS.map((t) => t.to))

function topbarTitle(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'look' && parts[1]) {
    const s = styleBySlug(parts[1])
    return s ? { sub: `Stile ${s.num}`, title: s.title } : { title: 'Look' }
  }
  if (parts[0] === 'profili' && parts[1]) {
    const p = profileBySlug(parts[1])
    return p ? { sub: p.category, title: p.name } : { title: 'Profilo' }
  }
  if (parts[0] === 'capitolo' && parts[1]) {
    const c = chapterBySlug(parts[1])
    return c ? { sub: 'Manuale', title: c.title } : { title: 'Capitolo' }
  }
  switch (pathname) {
    case '/look': return { sub: 'Galleria', title: 'I 24 Look' }
    case '/profili': return { sub: 'Galleria', title: 'Profili Film' }
    case '/scena': return { sub: 'Guida', title: 'Quale look per la scena?' }
    case '/manuale': return { sub: 'Indice', title: 'Il Manuale' }
    case '/cerca': return { sub: '', title: 'Cerca' }
    default: return null
  }
}

function Topbar() {
  const loc = useLocation()
  const nav = useNavigate()
  const isRoot = ROOTS.has(loc.pathname)
  const t = topbarTitle(loc.pathname)

  if (loc.pathname === '/') {
    return (
      <header className="topbar">
        <div className="ttl">
          <small>Fotografia & Color Grading</small>
          Manuale
        </div>
      </header>
    )
  }
  return (
    <header className="topbar ui">
      {!isRoot && (
        <button className="back" onClick={() => nav(-1)} aria-label="Indietro">‹</button>
      )}
      <div className="ttl">
        {t?.sub && <small>{t.sub}</small>}
        {t?.title}
      </div>
    </header>
  )
}

function BottomNav() {
  return (
    <nav className="bottomnav ui">
      <div className="inner">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}>
            <span className="ic">{t.ic}</span>
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="app">
      <ScrollTop />
      <Topbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/look" element={<Looks />} />
          <Route path="/look/:slug" element={<StyleDetail />} />
          <Route path="/profili" element={<Profili />} />
          <Route path="/profili/:slug" element={<ProfileDetail />} />
          <Route path="/scena" element={<Picker />} />
          <Route path="/manuale" element={<Manuale />} />
          <Route path="/capitolo/:slug" element={<ChapterReader />} />
          <Route path="/cerca" element={<Search />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

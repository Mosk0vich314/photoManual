import React from 'react'
import { Link } from 'react-router-dom'
import Poster from './Poster.jsx'

export default function StyleCard({ s }) {
  const sw = s.m.swatches || ['#222', '#333', '#444']
  return (
    <Link className="scard" to={`/look/${s.slug}`}>
      <Poster colors={sw} className="scard-poster">
        <span className="pcontent num-badge">{String(s.num).padStart(2, '0')}</span>
      </Poster>
      <div className="body">
        <div className="name">{s.title.replace(/^Look\s+/, '')}</div>
        <div className="film">
          {s.film ? <b>{s.film}</b> : <b>{s.m.harmony}</b>}
          {s.director ? ` · ${s.director}` : ''}
        </div>
      </div>
    </Link>
  )
}

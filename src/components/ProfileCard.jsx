import React from 'react'
import { Link } from 'react-router-dom'
import Poster from './Poster.jsx'

export default function ProfileCard({ p }) {
  const sw = p.swatches || ['#222', '#333', '#444']
  return (
    <Link className="scard" to={`/profili/${p.slug}`}>
      <Poster colors={sw} className="scard-poster">
        <span className="pcontent num-badge">{p.badge}</span>
      </Poster>
      <div className="body">
        <div className="name">{p.name}</div>
        <div className="film">
          <b>{p.category}</b>
          {p.tagline ? ` · ${p.tagline}` : ''}
        </div>
      </div>
    </Link>
  )
}

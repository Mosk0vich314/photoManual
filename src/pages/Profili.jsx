import React from 'react'
import { PROFILES, PROFILES_META } from '../data/index.js'
import ProfileCard from '../components/ProfileCard.jsx'

export default function Profili() {
  return (
    <div>
      <p className="subtitle">{PROFILES_META.subtitle}.</p>
      <p className="count ui">{PROFILES.length} profili · {PROFILES_META.maker}</p>
      <div className="gallery">
        {PROFILES.map((p) => (
          <ProfileCard p={p} key={p.id} />
        ))}
      </div>
      <p className="profile-note ui">{PROFILES_META.note}</p>
    </div>
  )
}

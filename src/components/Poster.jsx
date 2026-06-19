import React from 'react'

// A procedural "cinematic frame" built from a look's palette:
// diagonal palette gradient + key light + film grain + vignette.
// Legal & offline alternative to copyrighted film stills; if you later add a
// real photo, pass it as `image` and it renders under the same grade overlays.
export default function Poster({ colors = [], angle = 150, className = '', style, image, children }) {
  const a = colors[0] || '#23262d'
  const b = colors[1] || colors[0] || '#33373f'
  const c = colors[2] || colors[1] || colors[0] || '#15171d'
  const grad = `linear-gradient(${angle}deg, ${a} 0%, ${b} 50%, ${c} 100%)`
  return (
    <div
      className={'poster ' + className}
      style={{ background: image ? `#000` : grad, ...style }}
    >
      {image && <div className="poster-img" style={{ backgroundImage: `url(${image})` }} />}
      {image && <div className="poster-tint" style={{ background: grad }} />}
      <div className="poster-light" />
      <div className="poster-grain" />
      <div className="poster-vig" />
      {children}
    </div>
  )
}

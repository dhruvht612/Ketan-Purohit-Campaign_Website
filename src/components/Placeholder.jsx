import { useState } from 'react'
import './Placeholder.css'

/**
 * Image slot with graceful fallback.
 * ---------------------------------
 * Pass `src` to show a real photo. If `src` is missing OR fails to load, a
 * tasteful on-brand gradient panel (keyed off `seed`, with an optional label
 * and the "KP" monogram) is drawn instead — so the layout never breaks while
 * photos are being added or wired from the CMS.
 *
 * `objectPosition` lets you nudge the focal point of a real photo (e.g. keep a
 * face in frame on tall crops).
 */

// Two soft palettes we rotate between, both on-brand.
const palettes = [
  ['#2a6fd6', '#153f86'],
  ['#f6a417', '#d97a12'],
  ['#3f86e0', '#1b4f9c'],
  ['#5aa0e8', '#1e5fc4'],
]

function hash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function Placeholder({
  src,
  alt = '',
  seed = 'ketan',
  label,
  monogram = false,
  ratio = '4 / 3',
  rounded = 'var(--radius)',
  objectPosition = 'center',
  className = '',
  loading = 'lazy',
}) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        onError={() => setFailed(true)}
        className={`ph-img ${className}`}
        style={{ aspectRatio: ratio, borderRadius: rounded, objectPosition }}
      />
    )
  }

  const h = hash(seed)
  const [c1, c2] = palettes[h % palettes.length]
  const angle = 115 + (h % 40)

  return (
    <div
      className={`ph ${className}`}
      role="img"
      aria-label={alt || label || 'Campaign photo placeholder'}
      style={{
        aspectRatio: ratio,
        borderRadius: rounded,
        background: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
      }}
    >
      <span className="ph__grain" aria-hidden="true" />
      {monogram && <span className="ph__monogram" aria-hidden="true">KP</span>}
      {label && <span className="ph__label">{label}</span>}
      <span className="ph__tag" aria-hidden="true">Photo</span>
    </div>
  )
}

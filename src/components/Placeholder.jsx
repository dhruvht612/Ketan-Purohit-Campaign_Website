import { useState } from 'react'
import './Placeholder.css'

/**
 * Image slot.
 * -----------
 * Pass `src` to show a real photo. With no `src` — or if the file fails to
 * load — it draws a deliberately neutral, obviously-empty panel instead: a
 * hatched cream tile, a camera glyph, and a "photo placeholder" flag.
 *
 * It is intentionally NOT a pretty stock-style image. A campaign site must
 * never show something a visitor could mistake for a real campaign photo, so
 * empty slots are meant to read as empty. Drop the final photo in and the
 * placeholder disappears with no code change.
 *
 * `objectPosition` nudges the focal point of a real photo (e.g. keeping a face
 * in frame on tall crops).
 */
export default function Placeholder({
  src,
  alt = '',
  label,
  monogram = false,
  ratio = '4 / 3',
  rounded = 'var(--radius)',
  objectPosition = 'center',
  className = '',
  loading = 'lazy',
  /* 'high' for the one image above the fold on first paint — the hero
     portrait. Everything else stays on the browser's own heuristic.
     Rendered as the lowercase DOM attribute: react-dom 18 does not know the
     camelCase `fetchPriority` prop and warns, but passes `fetchpriority`
     through untouched. */
  fetchPriority = 'auto',
  tone = 'cream',
}) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchpriority={fetchPriority}
        onError={() => setFailed(true)}
        className={`ph-img ${className}`}
        style={{ aspectRatio: ratio, borderRadius: rounded, objectPosition }}
      />
    )
  }

  // Strip the [BRACKETS] from placeholder alt text for the on-tile caption.
  const caption = label ?? (alt ? alt.replace(/^\[|\]$/g, '') : 'Photo placeholder')

  return (
    <div
      className={`ph ph--${tone} ${className}`}
      role="img"
      aria-label={alt || label || 'Photo placeholder — final campaign photo to be added'}
      style={{ aspectRatio: ratio, borderRadius: rounded }}
    >
      <span className="ph__hatch" aria-hidden="true" />
      <span className="ph__glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.7l1.2-2h7.2l1.2 2h1.7A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
          <circle cx="12" cy="13" r="3.6" />
        </svg>
      </span>
      {monogram && <span className="ph__monogram" aria-hidden="true">KP</span>}
      <span className="ph__caption">{caption}</span>
      <span className="ph__tag" aria-hidden="true">Photo placeholder</span>
    </div>
  )
}

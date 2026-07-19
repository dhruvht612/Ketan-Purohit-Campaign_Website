import './Placeholder.css'

/**
 * Styled image placeholder.
 * ------------------------
 * Every real photo slot renders through this component. When a real image URL
 * is provided (`src`), it shows the photo; otherwise it draws a tasteful,
 * deterministic gradient panel keyed off `seed`, with an optional label and the
 * "KP" monogram. To drop in real photography later, pass `src` from the CMS —
 * no layout changes needed.
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
  className = '',
  loading = 'lazy',
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`ph-img ${className}`}
        style={{ aspectRatio: ratio, borderRadius: rounded }}
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

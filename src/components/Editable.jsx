import { isPlaceholder } from '../lib/cms.js'

/**
 * Content slots that know whether they're still empty.
 * ---------------------------------------------------
 * Any CMS value written in [SQUARE BRACKETS] renders in a muted placeholder
 * style with a visible "awaiting content" flag, so a draft can never be read
 * as a real campaign statement. Replace the bracketed text in the JSON and
 * these render as ordinary copy — no code change needed.
 */

/** A visible "still to come" flag. */
export function PlaceholderTag({ children = 'Placeholder', onDark = false, className = '' }) {
  return (
    <span className={`placeholder-tag ${onDark ? 'placeholder-tag--onDark' : ''} ${className}`}>
      <span aria-hidden="true">✎</span> {children}
    </span>
  )
}

/** A single value (heading, caption, label…). */
export function Text({ value, as: Tag = 'p', className = '', children, ...rest }) {
  const pending = isPlaceholder(value)
  return (
    <Tag className={`${className} ${pending ? 'placeholder-text' : ''}`.trim()} {...rest}>
      {value}
      {children}
    </Tag>
  )
}

/**
 * A block of paragraphs. Falls back to `placeholder` when the campaign hasn't
 * supplied the copy yet (used by Issues / Privacy / Terms, where the real text
 * must come from the campaign verbatim).
 */
export function Paragraphs({
  items = [],
  placeholder,
  className = 'prose',
  tagLabel = 'Awaiting final content',
  onDark = false,
}) {
  const filled = (items || []).filter((p) => typeof p === 'string' && p.trim() !== '')

  if (!filled.length) {
    if (!placeholder) return null
    return (
      <div className={className}>
        <PlaceholderTag onDark={onDark}>{tagLabel}</PlaceholderTag>
        <p className="placeholder-text" style={{ marginTop: '10px' }}>{placeholder}</p>
      </div>
    )
  }

  const anyPending = filled.some(isPlaceholder)
  return (
    <div className={className}>
      {anyPending && <PlaceholderTag onDark={onDark}>{tagLabel}</PlaceholderTag>}
      {filled.map((p, i) => (
        <p key={i} className={isPlaceholder(p) ? 'placeholder-text' : ''} style={anyPending && i === 0 ? { marginTop: '10px' } : undefined}>
          {p}
        </p>
      ))}
    </div>
  )
}

export { isPlaceholder }

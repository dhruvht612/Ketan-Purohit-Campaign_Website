import Placeholder from './Placeholder.jsx'
import { isPlaceholder } from '../lib/cms.js'

/**
 * One tile in the photo gallery. Clicking opens the lightbox — but only for
 * tiles that hold a real photo, so empty slots stay inert instead of opening
 * an empty viewer.
 */
export default function PhotoTile({ photo, onOpen }) {
  const hasPhoto = Boolean(photo.src)
  const captionPending = isPlaceholder(photo.caption)

  const inner = (
    <>
      <Placeholder
        src={photo.src}
        alt={photo.alt || photo.caption}
        ratio={photo.ratio || '4 / 3'}
        rounded="0"
      />
      {hasPhoto && !captionPending && (
        <span className="gallery__cap">
          <span className="gallery__cap-cat">{photo.category}</span>
          {photo.caption}
        </span>
      )}
      {/* On a real photo the category rides in the hover caption instead of a
          fixed badge, which would sit on top of the photograph. */}
      {photo.category && !hasPhoto && <span className="gallery__cat">{photo.category}</span>}
    </>
  )

  if (!hasPhoto) {
    return <div className="gallery__item gallery__item--empty">{inner}</div>
  }

  return (
    <button type="button" className="gallery__item" onClick={onOpen} aria-label={`View photo: ${photo.caption}`}>
      {inner}
    </button>
  )
}

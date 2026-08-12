import { useState, useEffect, useCallback, useMemo } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import PhotoTile from '../components/PhotoTile.jsx'
import Placeholder from '../components/Placeholder.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import { PlaceholderTag } from '../components/Editable.jsx'
import { getGallery, getGalleryCategories } from '../lib/cms.js'

export default function Pictures() {
  const all = getGallery()
  const categories = getGalleryCategories()
  const [filter, setFilter] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const shown = useMemo(
    () => (filter === 'All' ? all : all.filter((g) => g.category === filter)),
    [all, filter],
  )

  /* Only real photos can be opened, so the viewer walks that subset. */
  const viewable = useMemo(() => shown.filter((g) => g.src), [shown])

  const close = useCallback(() => setLightbox(null), [])
  const step = useCallback(
    (dir) => setLightbox((i) => (i == null ? i : (i + dir + viewable.length) % viewable.length)),
    [viewable.length],
  )

  useEffect(() => {
    if (lightbox == null) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, close, step])

  const current = lightbox != null ? viewable[lightbox] : null

  return (
    <>
      <PageHeader
        eyebrow="Photos"
        title="Campaign photo gallery"
        lede="Photos from across the campaign."
      />

      <section className="section">
        <div className="container">
          <Reveal className="issues-notice">
            <PlaceholderTag>Awaiting campaign photos</PlaceholderTag>
            <p>
              Empty tiles below are deliberately blank rather than stock photography, so
              nothing here can be mistaken for a real campaign photo. Drop final images
              into <code>/public/images</code> and point each item's <code>src</code> in{' '}
              <code>src/content/gallery.json</code> at them.
            </p>
          </Reveal>

          <div className="filters" role="group" aria-label="Filter photos by category">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`filter ${filter === c ? 'is-active' : ''}`}
                aria-pressed={filter === c}
                onClick={() => { setFilter(c); setLightbox(null) }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="gallery">
            {shown.map((photo) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                onOpen={() => setLightbox(viewable.findIndex((v) => v.id === photo.id))}
              />
            ))}
          </div>
        </div>
      </section>

      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close}>
          <button className="lightbox__close" onClick={close} aria-label="Close photo viewer">
            <Icon name="close" size={22} />
          </button>

          {viewable.length > 1 && (
            <button
              className="lightbox__nav lightbox__nav--prev"
              onClick={(e) => { e.stopPropagation(); step(-1) }}
              aria-label="Previous photo"
            >
              <Icon name="arrow" size={22} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}

          <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
            <Placeholder
              src={current.src}
              alt={current.alt || current.caption}
              ratio={current.ratio}
              rounded="var(--radius)"
              loading="eager"
              className="lightbox__img"
            />
            <p className="lightbox__cap">{current.caption}</p>
          </div>

          {viewable.length > 1 && (
            <button
              className="lightbox__nav lightbox__nav--next"
              onClick={(e) => { e.stopPropagation(); step(1) }}
              aria-label="Next photo"
            >
              <Icon name="arrow" size={22} />
            </button>
          )}
        </div>
      )}
    </>
  )
}

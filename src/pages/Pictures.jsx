import { useState, useEffect, useCallback } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Placeholder from '../components/Placeholder.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import { getGallery, getGalleryCategories } from '../lib/cms.js'

export default function Pictures() {
  const all = getGallery()
  const categories = getGalleryCategories()
  const [filter, setFilter] = useState('All')
  const [lightbox, setLightbox] = useState(null) // index into `shown`

  const shown = filter === 'All' ? all : all.filter((g) => g.category === filter)

  const close = useCallback(() => setLightbox(null), [])
  const step = useCallback(
    (dir) => setLightbox((i) => (i == null ? i : (i + dir + shown.length) % shown.length)),
    [shown.length],
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

  return (
    <>
      <PageHeader
        eyebrow="Pictures"
        title="Out in the community"
        lede="Moments from town halls, school visits, and neighbourhood events across Ward 12."
      />

      <section className="section">
        <div className="container">
          <div className="filters">
            {categories.map((c) => (
              <button
                key={c}
                className={`filter ${filter === c ? 'is-active' : ''}`}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="gallery">
            {shown.map((g, i) => (
              <button
                key={g.id}
                className="gallery__item"
                onClick={() => setLightbox(i)}
                aria-label={`View: ${g.caption}`}
              >
                <Placeholder
                  seed={g.seed}
                  label={g.category}
                  alt={g.caption}
                  ratio={i % 3 === 0 ? '3 / 4' : i % 3 === 1 ? '4 / 3' : '1 / 1'}
                  rounded="0"
                />
                <span className="gallery__cap">{g.caption}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox != null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close}>
          <button className="lightbox__close" onClick={close} aria-label="Close">
            <Icon name="close" size={22} />
          </button>
          <button className="lightbox__nav lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); step(-1) }} aria-label="Previous">
            <Icon name="arrow" size={22} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
            <Placeholder seed={shown[lightbox].seed} label={shown[lightbox].category} alt={shown[lightbox].caption} ratio="16 / 10" rounded="var(--radius)" loading="eager" />
            <p className="lightbox__cap">{shown[lightbox].caption}</p>
          </div>
          <button className="lightbox__nav lightbox__nav--next" onClick={(e) => { e.stopPropagation(); step(1) }} aria-label="Next">
            <Icon name="arrow" size={22} />
          </button>
        </div>
      )}
    </>
  )
}

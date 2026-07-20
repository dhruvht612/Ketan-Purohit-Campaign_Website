import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Placeholder from './Placeholder.jsx'
import Icon from './Icon.jsx'
import Button from './Button.jsx'
import './Carousel.css'

const AUTOPLAY_MS = 6000

export default function Carousel({ slides }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()
  const touchStart = useRef(null)
  const count = slides.length

  const go = useCallback((next) => setIndex((i) => (next + count) % count), [count])

  useEffect(() => {
    if (paused || reduce) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [paused, reduce, count])

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1))
    touchStart.current = null
  }

  const slide = slides[index]

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label="Campaign priorities"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="container">
        <div className="carousel__frame">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              className="carousel__slide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.55, ease: 'easeInOut' }}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}: ${slide.kicker}`}
            >
              <div className="carousel__media">
                <Placeholder
                  src={slide.src}
                  seed={slide.image}
                  monogram={slide.id === 'intro'}
                  label={slide.id === 'intro' ? null : slide.kicker}
                  alt={`${slide.kicker} — ${slide.headline}`}
                  ratio="16 / 11"
                  rounded="var(--radius-lg)"
                  objectPosition="center top"
                  loading="eager"
                />
              </div>

              <div className="carousel__body">
                <span className={`carousel__kicker ${slide.tone === 'accent' ? 'is-accent' : ''}`}>
                  {slide.kicker}
                </span>
                <h2 className="carousel__headline">{slide.headline}</h2>
                <ul className="carousel__points">
                  {slide.points.map((p) => (
                    <li key={p}>
                      <span className={`tick ${slide.tone === 'accent' ? 'tick--accent' : ''}`} />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="carousel__actions">
                  <Button to="/issues" variant="secondary" size="sm">
                    Explore the issues <Icon name="arrow" size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button className="carousel__arrow carousel__arrow--prev" onClick={() => go(index - 1)} aria-label="Previous slide">
            <Icon name="arrow" size={22} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <button className="carousel__arrow carousel__arrow--next" onClick={() => go(index + 1)} aria-label="Next slide">
            <Icon name="arrow" size={22} />
          </button>
        </div>

        <div className="carousel__dots" role="tablist" aria-label="Choose slide">
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}: ${s.kicker}`}
              className={`carousel__dot ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

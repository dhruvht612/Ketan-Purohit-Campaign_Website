import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import QuoteCard from './QuoteCard.jsx'
import './QuoteCarousel.css'

const AUTOPLAY_MS = 5200

/**
 * Horizontal campaign-statement carousel.
 * ---------------------------------------
 * Built on a native scroll-snap track, which gives real horizontal scrolling,
 * momentum and swipe on touch devices for free — no gesture library, and the
 * user can always just flick it.
 *
 * Behaviour:
 *   · prev/next buttons, and ←/→ keys while the track has focus
 *   · pagination dots grouped by topic (one per category, not per card —
 *     24 dots would be noise)
 *   · gentle autoplay that stops the moment anyone engages: hover, focus,
 *     touch, manual scroll, or the explicit pause button. It also idles
 *     while the carousel is off-screen or the tab is hidden, and never runs
 *     at all under prefers-reduced-motion.
 *
 * Content comes from src/content/quotes.json — see `cards` prop.
 */
export default function QuoteCarousel({
  cards = [],
  eyebrow = 'In his words',
  title,
  lede,
}) {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)
  const [engaged, setEngaged] = useState(false)   // transient: hover / focus / touch
  const [stopped, setStopped] = useState(false)   // sticky: user pressed pause
  const [visible, setVisible] = useState(true)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const count = cards.length

  /* First card index of each topic — the dots map to topics, not cards. */
  const topics = []
  cards.forEach((c, i) => {
    if (!topics.some((t) => t.categoryId === c.categoryId)) {
      topics.push({ categoryId: c.categoryId, category: c.category, index: i })
    }
  })

  /* The track is inset so the first card lines up with the page container;
     that inset has to come back out of every scroll target. */
  const padLeft = (track) => parseFloat(getComputedStyle(track).paddingLeft) || 0

  const scrollToIndex = useCallback((i, behavior = 'smooth') => {
    const track = trackRef.current
    if (!track) return
    const target = track.children[Math.max(0, Math.min(i, count - 1))]
    if (target) track.scrollTo({ left: target.offsetLeft - padLeft(track), behavior })
  }, [count])

  /* Derive the active card from real scroll position, so swipes, wheel
     scrolling and button presses all stay in sync with the dots. */
  const syncFromScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const { scrollLeft, scrollWidth, clientWidth } = track
    const pad = padLeft(track)
    let nearest = 0
    let best = Infinity
    for (let i = 0; i < track.children.length; i++) {
      const d = Math.abs(track.children[i].offsetLeft - pad - scrollLeft)
      if (d < best) { best = d; nearest = i }
    }
    setActive(nearest)
    setAtStart(scrollLeft <= 2)
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(syncFromScroll)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    syncFromScroll()
    return () => {
      track.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [syncFromScroll])

  /* Idle while off-screen — an autoplaying carousel nobody is looking at is
     just wasted motion. */
  useEffect(() => {
    const track = trackRef.current
    if (!track || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 },
    )
    io.observe(track)
    return () => io.disconnect()
  }, [])

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (stopped || engaged || !visible || reduceMotion || count < 2) return
    const id = setInterval(() => {
      const track = trackRef.current
      if (!track || document.hidden) return
      const last = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2
      scrollToIndex(last ? 0 : active + 1)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [stopped, engaged, visible, reduceMotion, active, count, scrollToIndex])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setEngaged(true); scrollToIndex(active + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setEngaged(true); scrollToIndex(active - 1) }
    if (e.key === 'Home') { e.preventDefault(); setEngaged(true); scrollToIndex(0) }
    if (e.key === 'End') { e.preventDefault(); setEngaged(true); scrollToIndex(count - 1) }
  }

  if (!count) return null

  const activeTopic =
    [...topics].reverse().find((t) => t.index <= active) ?? topics[0]

  return (
    <section
      className="qc"
      aria-labelledby="qc-title"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      /* Focus inside the carousel pauses it, so a keyboard user isn't chased
         along mid-read — but not focus on the play/pause control itself. That
         button keeps focus after a click, which would otherwise leave the
         carousel permanently paused the moment someone pressed Play. */
      onFocusCapture={(e) => {
        if (!e.target.closest('.qc__btn--play')) setEngaged(true)
      }}
      onBlurCapture={() => setEngaged(false)}
      onTouchStart={() => setEngaged(true)}
      onPointerDown={() => setEngaged(true)}
    >
      <div className="container">
        <div className="qc__head">
          <div>
            <span className="eyebrow eyebrow--onDark">
              <span className="tick tick--gold" /> {eyebrow}
            </span>
            <h2 id="qc-title" className="qc__title">{title}</h2>
            {lede && <p className="qc__lede">{lede}</p>}
          </div>

          <div className="qc__controls">
            <button
              type="button"
              className="qc__btn qc__btn--play"
              onClick={() => setStopped((s) => {
                /* Pressing Play is an explicit request to resume, so clear the
                   transient engagement the click itself just set. */
                if (s) setEngaged(false)
                return !s
              })}
              aria-pressed={stopped}
            >
              <Icon name={stopped ? 'play' : 'pause'} size={16} />
              <span>{stopped ? 'Play' : 'Pause'}</span>
              <span className="visually-hidden">auto-scrolling statements</span>
            </button>
            <button
              type="button"
              className="qc__btn qc__btn--arrow"
              onClick={() => { setEngaged(true); scrollToIndex(active - 1) }}
              disabled={atStart}
              aria-label="Previous statement"
            >
              <Icon name="arrow" size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button
              type="button"
              className="qc__btn qc__btn--arrow"
              onClick={() => { setEngaged(true); scrollToIndex(active + 1) }}
              disabled={atEnd}
              aria-label="Next statement"
            >
              <Icon name="arrow" size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="qc__track"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Campaign statements"
        onKeyDown={onKeyDown}
      >
        {cards.map((card, i) => (
          <QuoteCard
            key={card.id}
            card={card}
            position={i + 1}
            total={count}
            isActive={i === active}
          />
        ))}
      </div>

      <div className="container">
        <div className="qc__foot">
          {/* Topic pagination — one dot per campaign topic. */}
          <div className="qc__dots" role="tablist" aria-label="Jump to a topic">
            {topics.map((t) => {
              const isCurrent = t.categoryId === activeTopic?.categoryId
              return (
                <button
                  key={t.categoryId}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  className={`qc__dot ${isCurrent ? 'is-active' : ''}`}
                  onClick={() => { setEngaged(true); scrollToIndex(t.index) }}
                >
                  <span className="qc__dot-label">{t.category}</span>
                </button>
              )
            })}
          </div>

          <p className="qc__count" aria-live="polite">
            <span className="visually-hidden">Showing statement </span>
            {active + 1} <span aria-hidden="true">/</span>
            <span className="visually-hidden"> of </span> {count}
          </p>
        </div>
      </div>
    </section>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, animate } from 'framer-motion'
import Icon from './Icon.jsx'
import './QuoteCarousel.css'

/**
 * Campaign board carousel.
 * ------------------------
 * One board at a time, at full width, with a thumbnail strip underneath in
 * which the active board expands. Ported from a Tailwind reference component
 * to this project's own conventions — JSX and a co-located stylesheet, brand
 * tokens rather than utility classes.
 *
 * Why this shape rather than the marquee it replaces: these boards are dense
 * designs carrying a headline and four supporting lines *inside the artwork*.
 * At marquee-card width those lines were too small to read, which is a strange
 * thing to do to your own campaign messaging. Showing one board across the full
 * column makes the artwork legible as designed, and the strip below is how you
 * get to the other five without a moving target to chase.
 *
 * Interaction, in order of what people actually reach for:
 *   · drag or swipe the board itself — velocity above 500px/s flicks to the
 *     next board, otherwise it takes a 30% drag past the edge to commit, so a
 *     hesitant drag springs back instead of changing the board under you
 *   · the arrows, which stop at both ends rather than wrapping — with six
 *     boards and a visible counter, wrapping reads as a glitch
 *   · the thumbnails, which double as the position readout
 *
 * Accessibility:
 *   · the strip is a real tablist; arrow keys move between boards and the
 *     panel is labelled by its tab
 *   · nothing auto-advances, so there is no motion to pause and no WCAG 2.2.2
 *     obligation to discharge
 *   · under prefers-reduced-motion the spring is replaced by an instant jump
 *     and the thumbnail expansion is not animated
 *   · each board's words live in its `alt`, since they are baked into the
 *     artwork; the visible line list below repeats them as real text
 */

/* Thumbnail geometry. Shared with the stylesheet through custom properties so
   the scroll arithmetic below and the rendered widths cannot disagree. */
const FULL_W = 132
const COLLAPSED_W = 42
const GAP = 4

export default function QuoteCarousel({ cards = [], eyebrow = 'In his words', title, lede }) {
  const count = cards.length

  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const viewportEl = useRef(null)
  const stripEl = useRef(null)
  const reduceMotion = useReducedMotion()

  const x = useMotionValue(0)

  const go = useCallback(
    (next) => setIndex(Math.max(0, Math.min(count - 1, next))),
    [count],
  )

  /* Slide the track to the active board. Measured from the live element rather
     than assumed, so it stays correct through a resize or an orientation
     change. Skipped mid-drag: the pointer owns `x` until it lets go. */
  useEffect(() => {
    const el = viewportEl.current
    if (!el || dragging) return

    const settle = () => {
      const target = -index * el.offsetWidth
      if (reduceMotion) x.set(target)
      else animate(x, target, { type: 'spring', stiffness: 300, damping: 30 })
    }

    settle()
    const ro = new ResizeObserver(settle)
    ro.observe(el)
    return () => ro.disconnect()
  }, [index, x, dragging, reduceMotion])

  /* Keep the active thumbnail centred in the strip. The arithmetic mirrors the
     widths above: every thumbnail before the active one is collapsed. */
  useEffect(() => {
    const strip = stripEl.current
    if (!strip) return
    const left =
      index * (COLLAPSED_W + GAP) - strip.offsetWidth / 2 + FULL_W / 2
    strip.scrollTo({
      left: Math.max(0, left),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [index, reduceMotion])

  const onDragEnd = (_event, info) => {
    setDragging(false)
    const width = viewportEl.current?.offsetWidth || 1
    const { offset, velocity } = info

    let next = index
    if (Math.abs(velocity.x) > 500) next = velocity.x > 0 ? index - 1 : index + 1
    else if (Math.abs(offset.x) > width * 0.3) next = offset.x > 0 ? index - 1 : index + 1

    go(next)
  }

  /* Arrow keys on the strip, per the tablist pattern. Home/End are cheap to
     support and are what a keyboard user reaches for with six tabs. */
  const onStripKeyDown = (e) => {
    const moves = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: count - 1 }
    if (!(e.key in moves)) return
    e.preventDefault()
    go(moves[e.key])
  }

  if (!count) return null

  const active = cards[index]

  return (
    <section className="qc" aria-labelledby="qc-title">
      <div className="container">
        <div className="qc__head">
          <div>
            {eyebrow && (
              <span className="eyebrow eyebrow--onDark">
                <span className="tick tick--gold" /> {eyebrow}
              </span>
            )}
            <h2 id="qc-title" className="qc__title">{title}</h2>
            {lede && <p className="qc__lede">{lede}</p>}
          </div>

          <p className="qc__count" aria-live="polite">
            <span className="qc__count-now">{index + 1}</span>
            <span className="qc__count-of"> / {count}</span>
          </p>
        </div>

        <div className={`qc__stage qc__stage--${active.tone || 'navy'}`}>
          <div className="qc__viewport" ref={viewportEl}>
            <motion.div
              className="qc__track"
              style={{ x }}
              drag={count > 1 ? 'x' : false}
              dragElastic={0.2}
              dragMomentum={false}
              /* Without this the track can be flung past the first or last
                 board and left hanging in empty space. */
              dragConstraints={{ left: 0, right: 0 }}
              onDragStart={() => setDragging(true)}
              onDragEnd={onDragEnd}
            >
              {cards.map((card, i) => (
                <div
                  className="qc__slide"
                  key={card.id}
                  id={`qc-panel-${card.id}`}
                  role="tabpanel"
                  aria-labelledby={`qc-tab-${card.id}`}
                  /* Only the board on screen is exposed; the rest are beside
                     it in the DOM and would otherwise all be read out. */
                  aria-hidden={i === index ? undefined : true}
                >
                  <img
                    className="qc__board"
                    src={card.image?.src}
                    alt={card.image?.alt || card.category}
                    draggable={false}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))}
            </motion.div>

            <button
              type="button"
              className="qc__nav qc__nav--prev"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              aria-label="Previous board"
            >
              <Icon name="arrow" size={20} />
            </button>
            <button
              type="button"
              className="qc__nav qc__nav--next"
              onClick={() => go(index + 1)}
              disabled={index === count - 1}
              aria-label="Next board"
            >
              <Icon name="arrow" size={20} />
            </button>
          </div>

          {/* The board's own supporting lines, as real text. The artwork holds
              them too, but only legibly on a wide screen. */}
          <div className="qc__caption">
            <h3 className="qc__caption-title">{active.category}</h3>
            {active.lines?.length > 0 && (
              <ul className="qc__caption-lines">
                {active.lines.map((line) => (
                  <li key={line}>
                    <span className="tick tick--gold" aria-hidden="true" /> {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div
          className="qc__strip"
          ref={stripEl}
          role="tablist"
          aria-label="Campaign boards"
          onKeyDown={onStripKeyDown}
        >
          <div className="qc__strip-inner">
            {cards.map((card, i) => (
              <motion.button
                type="button"
                key={card.id}
                id={`qc-tab-${card.id}`}
                role="tab"
                aria-selected={i === index}
                aria-controls={`qc-panel-${card.id}`}
                /* Roving tabindex: one stop for the whole strip, then the
                   arrow keys move within it. */
                tabIndex={i === index ? 0 : -1}
                onClick={() => go(i)}
                className={`qc__thumb ${i === index ? 'is-active' : ''}`}
                initial={false}
                animate={{ width: i === index ? FULL_W : COLLAPSED_W }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
              >
                <img src={card.image?.src} alt="" draggable={false} loading="lazy" />
                <span className="visually-hidden">{card.category}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

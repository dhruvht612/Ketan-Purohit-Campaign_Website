import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import QuoteCard from './QuoteCard.jsx'
import './QuoteCarousel.css'

/** Constant travel speed of the track, in CSS pixels per second. */
const SPEED = 35
/** How long an arrow nudge takes to settle. */
const NUDGE_MS = 620
/** Topic jumps travel much further, so they get a distance-scaled duration. */
const JUMP_PX_PER_SEC = 4200
const JUMP_MIN_MS = 280
const JUMP_MAX_MS = 1000

/**
 * Campaign board marquee.
 * -----------------------
 * A single continuous track of campaign boards drifting right-to-left at a
 * constant 35px/s. Each card is one finished piece of campaign artwork, and
 * clicking it opens that board full size — the boards carry their supporting
 * lines inside the image, and at card width those lines are too small to read. Not a slideshow: nothing advances by index, and there is no
 * per-card timer. The list is rendered end to end more than once and the whole
 * track is translated by exactly one list-width, so the moment the animation
 * restarts, card N+1 is standing precisely where card 1 was — the loop has no
 * seam to see.
 *
 * Two transforms compose, on two elements, so they never fight:
 *
 *   .qc__shift   user position — arrow nudges and topic jumps (transitioned)
 *     .qc__track the marquee    — one CSS keyframe animation, never restarted
 *
 * Nothing here re-renders React per frame. The animation is pure CSS on the
 * compositor; the shift is written straight to the element's style; the only
 * state that changes while the track moves is the highlighted topic, and that
 * is derived from arithmetic on a twice-a-second tick, not from layout reads
 * per card.
 *
 * The travel distance is measured from the live DOM rather than assumed to be
 * 50% of the track: with a flex `gap`, half a two-copy track is half a gap
 * short of a full list, and that error would show up as a lurch at every loop.
 *
 * Accessibility:
 *   · pauses on hover, on focus inside, while off-screen and while the tab is
 *     hidden; an explicit pause/play control covers touch and keyboard, where
 *     hover does not exist (WCAG 2.2.2)
 *   · under prefers-reduced-motion there is no animation at all — the track
 *     renders once and becomes a normal horizontal scroller, and the same
 *     arrows and topic buttons drive it
 *   · only the first copy is exposed to assistive tech; the rest is aria-hidden
 *   · an open board stops the track outright, since the viewer covers it and
 *     touch has no hover to pause with
 */
export default function QuoteCarousel({
  cards = [],
  eyebrow = 'In his words',
  title,
  lede,
}) {
  const count = cards.length

  const viewportEl = useRef(null)
  const shiftEl = useRef(null)
  const trackEl = useRef(null)
  const dotsEl = useRef(null)
  const viewerCloseEl = useRef(null)

  /* Geometry, refreshed on resize. Kept in refs: it drives style writes and
     arithmetic, never markup. */
  const geo = useRef({ span: 0, step: 0, cardW: 0, pad: 0, offsets: [] })
  /* Current user offset in px. Deliberately not React state — moving the
     track must not re-render every card on it. Rests at -span; see `fold`. */
  const shift = useRef(0)

  const [reduceMotion, setReduceMotion] = useState(false)
  /* How many times the list is laid end to end.
     Three, not two. The track rests one whole list in — see `fold` — so that
     there is a full list of real cards on BOTH sides of the visible window.
     Without that, pressing "back" at the top of a loop, or jumping to a topic
     that happens to sit behind you, would scroll off the front of the track
     into empty navy. Measurement raises it further on very wide viewports. */
  const [reps, setReps] = useState(3)
  const [stopped, setStopped] = useState(false)   // sticky: pause pressed
  const [engaged, setEngaged] = useState(false)   // transient: hover / focus
  const [onScreen, setOnScreen] = useState(true)
  const [activeTopic, setActiveTopic] = useState(null)
  /* Index of the board being read full size, or null. The boards are dense
     designs: at card width their supporting lines are unreadable, so opening
     one is the primary way to actually read it. */
  const [viewer, setViewer] = useState(null)

  /* First card of each topic — the buttons address topics, not cards. */
  const topics = []
  cards.forEach((c, i) => {
    if (!topics.some((t) => t.categoryId === c.categoryId)) {
      topics.push({ categoryId: c.categoryId, category: c.category, index: i })
    }
  })

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduceMotion) setReps(1)
    else setReps((r) => (r < 3 ? 3 : r))
  }, [reduceMotion])

  /* ---- Geometry ---------------------------------------------------------
     span: the distance from card 1 to card N+1 — one whole list including the
     gap that follows it. Translating the track by exactly this lands the
     second copy on top of where the first began. */
  const measure = useCallback(() => {
    const track = trackEl.current
    const viewport = viewportEl.current
    if (!track || !viewport || !count) return
    const kids = track.children
    if (kids.length < 2) return

    const base = kids[0].offsetLeft
    const offsets = []
    for (let i = 0; i < kids.length; i++) offsets.push(kids[i].offsetLeft - base)

    const cardW = kids[0].offsetWidth
    const step = kids.length > 1 ? offsets[1] : cardW
    const span = kids.length > count ? offsets[count] : 0
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0

    geo.current = { span, step, cardW, pad, offsets }

    if (span > 0) {
      track.style.setProperty('--qc-span', `${span}px`)
      track.style.setProperty('--qc-duration', `${(span / SPEED).toFixed(2)}s`)

      /* Park one list in, so there is content behind us as well as ahead.
         Re-based rather than nudged, because a changed span invalidates
         whatever offset the user had built up. */
      if (Math.abs(shift.current + span) > span / 2) {
        const el = shiftEl.current
        if (el) {
          el.style.transitionDuration = '0ms'
          shift.current = -span
          el.style.transform = `translate3d(${-span}px, 0, 0)`
        }
      }

      /* Worst-case left edge of the visible window, in track coordinates, is
         the marquee's full span plus the furthest the resting offset can sit
         from centre — 2.5 lists. Anything beyond that would show the end. */
      const needed = Math.max(3, Math.ceil(2.5 + viewport.clientWidth / span))
      if (needed !== reps) setReps(needed)
    }
  }, [count, reps])

  useLayoutEffect(() => {
    measure()
    const viewport = viewportEl.current
    if (!viewport || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(viewport)
    return () => ro.disconnect()
  }, [measure, reps, count])

  /* Webfonts land after first paint and change the card height, not its
     width — but re-measuring is cheap insurance against any reflow. */
  useEffect(() => {
    document.fonts?.ready.then(measure).catch(() => {})
  }, [measure])

  /* ---- The user offset --------------------------------------------------
     Written straight to the element. `animate: false` suppresses the
     transition for one write, which is how the offset is folded back into
     range without anything moving on screen. */
  const writeShift = useCallback((value, { animate = true, ms = NUDGE_MS } = {}) => {
    const el = shiftEl.current
    if (!el) return
    el.style.transitionDuration = animate ? `${ms}ms` : '0ms'
    shift.current = value
    el.style.transform = `translate3d(${value}px, 0, 0)`
  }, [])

  /* The track repeats every `span` px, so every offset has an identical twin
     one span away. Folding keeps the offset near its resting point — one list
     in — so the window always has real cards on both sides no matter how many
     times the arrows are pressed. The fold itself cannot be seen: the two
     positions render the same pixels.
     The window is exactly one span wide and centred on -span, i.e.
     (-1.5·span, -0.5·span]. */
  const fold = useCallback((value) => {
    const { span } = geo.current
    if (!span) return value
    let v = value
    while (v > -span / 2) v -= span
    while (v <= -span * 1.5) v += span
    return v
  }, [])

  useEffect(() => {
    const el = shiftEl.current
    if (!el) return
    const onEnd = () => {
      const folded = fold(shift.current)
      if (folded !== shift.current) writeShift(folded, { animate: false })
    }
    el.addEventListener('transitionend', onEnd)
    return () => el.removeEventListener('transitionend', onEnd)
  }, [fold, writeShift])

  /* ---- Controls --------------------------------------------------------- */

  /** dir: 1 moves toward later cards, -1 back toward earlier ones. */
  const nudge = useCallback((dir) => {
    const { step } = geo.current
    const distance = step || 340
    if (reduceMotion) {
      viewportEl.current?.scrollBy({ left: dir * distance, behavior: 'smooth' })
      return
    }
    writeShift(shift.current - dir * distance, { animate: true })
  }, [reduceMotion, writeShift])

  const jumpToTopic = useCallback((cardIndex) => {
    const viewport = viewportEl.current
    const track = trackEl.current
    if (!viewport || !track) return
    const card = track.children[cardIndex]
    if (!card) return

    if (reduceMotion) {
      viewport.scrollTo({
        left: card.offsetLeft - geo.current.pad,
        behavior: 'smooth',
      })
      return
    }

    /* How far this card is from where it should sit, right now — read from
       live rects, so it accounts for the marquee's current position without
       having to know it. The destination is then folded back into the safe
       window, which picks whichever copy of this topic keeps real cards on
       both sides of the viewport; every copy shows the same statement. */
    const delta =
      viewport.getBoundingClientRect().left +
      geo.current.pad -
      card.getBoundingClientRect().left
    const target = fold(shift.current + delta)
    const ms = Math.min(
      JUMP_MAX_MS,
      Math.max(JUMP_MIN_MS, (Math.abs(target - shift.current) / JUMP_PX_PER_SEC) * 1000),
    )
    writeShift(target, { animate: true, ms })
  }, [fold, reduceMotion, writeShift])

  /* ---- Idle while nobody can see it ------------------------------------- */
  useEffect(() => {
    const viewport = viewportEl.current
    if (!viewport || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      threshold: 0.05,
    })
    io.observe(viewport)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onVisibility = () => setOnScreen(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const closeViewer = useCallback(() => setViewer(null), [])
  const stepViewer = useCallback(
    (dir) => setViewer((i) => (i == null ? i : (i + dir + count) % count)),
    [count],
  )

  useEffect(() => {
    if (viewer == null) return
    /* The dialog covers the track, so focus has to come with it — otherwise a
       keyboard user is left tabbing through the page behind the overlay. */
    const returnTo = document.activeElement
    viewerCloseEl.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') closeViewer()
      if (e.key === 'ArrowRight') stepViewer(1)
      if (e.key === 'ArrowLeft') stepViewer(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      returnTo?.focus?.()
    }
    /* Only on open/close: re-running per board change would drag focus off the
       next/prev button mid-browse. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer == null, closeViewer, stepViewer])

  /* The viewer covers the track, and on touch there is no hover to pause it —
     so an open board stops the marquee explicitly. */
  const running = !stopped && !engaged && onScreen && !reduceMotion && viewer == null

  /* ---- Which topic is passing, and how far through it ------------------
     The track is periodic, so the position within one list is all that
     matters: fold the live offset into 0..span and see which topic's block of
     cards that lands in. One style read per tick, then arithmetic on cached
     offsets — no per-card layout reads and no rAF loop.

     The fill is written straight to the buttons rather than held in state:
     progress changes twice a second, and routing that through React would
     re-render every card on the track for a 6-element cosmetic update. It is
     written as a 0..1 ratio because the bar is drawn full width and scaled on
     the compositor, not resized. The bars carry a linear 520ms transition, so
     sampling twice a second still renders as a smooth, constant-rate fill —
     which is exactly what it is. */
  useEffect(() => {
    if (!count) return
    const tick = () => {
      const track = trackEl.current
      const viewport = viewportEl.current
      const { offsets, span } = geo.current
      if (!track || !viewport || !offsets.length) return

      let pos
      if (reduceMotion) {
        pos = viewport.scrollLeft
      } else {
        if (!span) return
        let m = 0
        const t = getComputedStyle(track).transform
        if (t && t !== 'none') {
          const parts = t.slice(t.indexOf('(') + 1, -1).split(',')
          m = parseFloat(parts[parts.length - 2]) || 0
        }
        pos = -(m + shift.current)
        pos = ((pos % span) + span) % span
      }

      const last = offsets[count] || offsets[offsets.length - 1] || 1
      let current = topics[0]
      let fill = 0
      for (let i = 0; i < topics.length; i++) {
        const start = offsets[topics[i].index] ?? 0
        const end = i + 1 < topics.length ? offsets[topics[i + 1].index] : last
        if (pos >= start && pos < end) {
          current = topics[i]
          fill = end > start ? (pos - start) / (end - start) : 0
          break
        }
      }

      const dots = dotsEl.current
      if (dots) {
        for (const btn of dots.children) {
          const on = btn.dataset.topic === current.categoryId
          btn.style.setProperty('--qc-fill', on ? fill.toFixed(4) : '0')
        }
      }
      setActiveTopic((prev) => (prev === current.categoryId ? prev : current.categoryId))
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, reduceMotion, reps])

  if (!count) return null

  /* The list, laid end to end. Only the first copy is real to assistive tech. */
  const laid = []
  for (let r = 0; r < reps; r++) {
    cards.forEach((card, i) => laid.push({ card, i, copy: r }))
  }

  return (
    <section
      className={`qc ${running ? '' : 'is-paused'}`}
      aria-labelledby="qc-title"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      /* Focus inside holds the track still so a keyboard user is not carried
         along mid-read — but not focus on the play control itself, which keeps
         focus after a click and would otherwise leave the track parked. */
      onFocusCapture={(e) => {
        if (!e.target.closest('.qc__btn--play')) setEngaged(true)
      }}
      onBlurCapture={() => setEngaged(false)}
    >
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

          <div className="qc__controls">
            {!reduceMotion && (
              <button
                type="button"
                className="qc__btn qc__btn--play"
                onClick={() => setStopped((s) => {
                  /* Pressing Play is an explicit resume, so clear the
                     transient engagement the click itself just set. */
                  if (s) setEngaged(false)
                  return !s
                })}
                aria-pressed={stopped}
              >
                <Icon name={stopped ? 'play' : 'pause'} size={16} />
                <span>{stopped ? 'Play' : 'Pause'}</span>
                <span className="visually-hidden">the moving boards</span>
              </button>
            )}
            <button
              type="button"
              className="qc__btn qc__btn--arrow"
              onClick={() => nudge(-1)}
              aria-label="Move back to earlier boards"
            >
              <Icon name="arrow" size={20} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button
              type="button"
              className="qc__btn qc__btn--arrow"
              onClick={() => nudge(1)}
              aria-label="Move on to later boards"
            >
              <Icon name="arrow" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Full-bleed on purpose: the heading stays in the page container, the
          cards run edge to edge and off both sides. */}
      <div
        ref={viewportEl}
        className="qc__viewport"
        role="group"
        aria-roledescription="carousel"
        aria-label="Campaign boards"
        /* Focusable only when it is a real scroller — under reduced motion.
           While it is a marquee there is nothing here to scroll, and the
           arrows and topic buttons are the keyboard route. */
        tabIndex={reduceMotion ? 0 : undefined}
      >
        <div ref={shiftEl} className="qc__shift">
          <div ref={trackEl} className="qc__track">
            {laid.map(({ card, i, copy }) => (
              <div
                key={`${copy}-${card.id}`}
                className="qc__cell"
                aria-hidden={copy > 0 ? true : undefined}
              >
                <QuoteCard
                  card={card}
                  position={i + 1}
                  total={count}
                  onOpen={() => setViewer(i)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="qc__foot">
          <div ref={dotsEl} className="qc__dots">
            {topics.map((t) => (
              <button
                key={t.categoryId}
                type="button"
                data-topic={t.categoryId}
                aria-current={t.categoryId === activeTopic ? 'true' : undefined}
                className={`qc__dot ${t.categoryId === activeTopic ? 'is-active' : ''}`}
                onClick={() => jumpToTopic(t.index)}
              >
                <span className="qc__dot-label">{t.category}</span>
                {/* Fills as this topic's cards travel through the viewport, so
                    the strip doubles as a position readout for a track that has
                    no slide number to show. */}
                <span className="qc__dot-fill" aria-hidden="true" />
              </button>
            ))}
          </div>

          <p className="qc__count">
            {count} <span className="qc__count-word">campaign boards</span>
          </p>
        </div>
      </div>

      {/* One board, read full size. The supporting lines are baked into the
          artwork and only become legible at this scale, so they are also listed
          as real text underneath — which is what a narrow phone gets to read
          when even the full-size board is too small. */}
      {viewer != null && cards[viewer] && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${cards[viewer].category} — campaign board`}
          onClick={closeViewer}
        >
          <button
            ref={viewerCloseEl}
            className="lightbox__close"
            onClick={closeViewer}
            aria-label="Close the board"
          >
            <Icon name="close" size={22} />
          </button>

          {count > 1 && (
            <button
              className="lightbox__nav lightbox__nav--prev"
              onClick={(e) => { e.stopPropagation(); stepViewer(-1) }}
              aria-label="Previous board"
            >
              <Icon name="arrow" size={22} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}

          <div
            className="lightbox__inner lightbox__inner--board"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={cards[viewer].image?.src}
              /* Short here on purpose: the board's own lines are listed
                 below as real text, so the long readout in `image.alt`
                 would be heard twice. */
              alt={`${cards[viewer].category} campaign board`}
              className="lightbox__img qc__board"
            />
            <ul className="qc__board-lines">
              {(cards[viewer].lines ?? []).map((line) => (
                <li key={line}>
                  <span className="tick tick--gold" aria-hidden="true" /> {line}
                </li>
              ))}
            </ul>
          </div>

          {count > 1 && (
            <button
              className="lightbox__nav lightbox__nav--next"
              onClick={(e) => { e.stopPropagation(); stepViewer(1) }}
              aria-label="Next board"
            >
              <Icon name="arrow" size={22} />
            </button>
          )}
        </div>
      )}
    </section>
  )
}

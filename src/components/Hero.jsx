import { motion, useReducedMotion } from 'framer-motion'
import Button from './Button.jsx'
import Placeholder from './Placeholder.jsx'
import Icon from './Icon.jsx'
import { getSite } from '../lib/cms.js'
import './Hero.css'

/** The ghosted schoolhouse that sits behind the flyer's portrait. */
function Schoolhouse(props) {
  return (
    <svg viewBox="0 0 200 180" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true" {...props}>
      <path d="M100 14v22" />
      <path d="M100 16h24l-8 7 8 7h-24" fill="currentColor" stroke="none" />
      <path d="M40 74 100 36l60 38" strokeLinejoin="round" />
      <rect x="52" y="74" width="96" height="92" />
      <rect x="86" y="118" width="28" height="48" />
      <circle cx="100" cy="94" r="13" />
      <path d="M100 87v7l5 4" />
      <rect x="62" y="118" width="16" height="18" />
      <rect x="122" y="118" width="16" height="18" />
    </svg>
  )
}

/**
 * The flyer's painted plaque: a navy brush block with streaks trailing off its
 * left edge and a red stroke sweeping the lower boundary. Stretched to the
 * badge's box (preserveAspectRatio="none"), so the strokes stay organic at any
 * size. The red sits below the text, never behind it — gold on red would drop
 * under 4.5:1.
 */
function PaintBlock(props) {
  return (
    <svg viewBox="0 0 460 150" preserveAspectRatio="none" aria-hidden="true" {...props}>
      <g className="hero__paint-navy">
        <path d="M48 20C124 8 194 16 266 12c68-4 130 6 186-4 4 32 3 92-2 128-70 10-150-2-224 3-66 5-126-2-180 6-6-40-5-92 2-125z" />
        <path d="M48 40c-18 1-36 4-48 7 14 3 32 4 48 5z" />
        <path d="M48 76c-20 2-40 6-52 10 16 3 36 3 52 3z" />
        <path d="M49 110c-14 2-27 6-37 9 12 3 26 3 37 3z" />
      </g>
      <path
        className="hero__paint-red"
        d="M0 112c80 12 170-4 256 4 74 7 140-4 204 2v14c-66-6-130 5-208-2-86-8-172 9-252-4z"
      />
    </svg>
  )
}

export default function Hero() {
  const site = getSite()
  const { brand } = site
  const reduce = useReducedMotion()

  const rise = (delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: [0.22, 0.61, 0.36, 1] },
  })

  /* The flyer sets the last word of the tagline in gold. */
  const tagline = brand.tagline || ''
  const highlight = brand.taglineHighlight || ''
  const taglineHead = highlight ? tagline.replace(highlight, '').trim() : tagline

  return (
    <>
      <section className="hero" aria-label="Introduction">
        <div className="hero__bg" aria-hidden="true">
          <span className="hero__wash" />
          <Schoolhouse className="hero__school" />
          <span className="hero__grid" />
        </div>

        <div className="container hero__inner">
          <div className="hero__copy">
            <motion.span className="hero__eyebrow" {...rise(0.05)}>
              <span className="hero__star" aria-hidden="true">★</span>
              {brand.election}
              <span className="hero__star" aria-hidden="true">★</span>
            </motion.span>

            <motion.h1 className="hero__title" {...rise(0.12)}>
              <span className="hero__title-first">{brand.firstName}</span>
              <span className="hero__title-last">{brand.lastName}</span>
            </motion.h1>

            <motion.p className="hero__for" {...rise(0.2)}>
              <Icon name="cap" size={20} strokeWidth={2} />
              For
            </motion.p>
            <motion.p className="hero__role" {...rise(0.24)}>
              {brand.role}
            </motion.p>

            <motion.p className="hero__lede" {...rise(0.32)}>
              {brand.intro}
            </motion.p>

            <motion.div className="hero__actions" {...rise(0.4)}>
              <Button to="/donate" variant="accent" size="lg">Donate</Button>
              <Button to="/volunteer" variant="secondary" size="lg">
                Volunteer <Icon name="arrow" size={18} />
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="hero__media"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.97, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="hero__portrait">
              <Placeholder
                src={site.images.portrait}
                monogram
                alt={`${brand.name}, candidate for ${brand.role}`}
                ratio="4 / 5"
                rounded="var(--radius)"
                objectPosition="center top"
                loading="eager"
              />
            </div>
            <div className="hero__badge">
              <PaintBlock className="hero__badge-paint" />
              <p className="script hero__badge-script">{brand.script}</p>
              <p className="hero__badge-line">{brand.scriptLine2}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The flyer's navy tagline band */}
      <div className="hero__band">
        <div className="container hero__band-inner">
          <p className="hero__band-text">
            {taglineHead} {highlight && <em>{highlight}</em>}
          </p>
          <p className="script hero__band-script">{brand.footerLine}</p>
        </div>
      </div>
    </>
  )
}

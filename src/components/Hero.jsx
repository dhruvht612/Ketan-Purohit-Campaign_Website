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
              <span className="tick tick--accent" aria-hidden="true" />
              <div>
                <strong>{brand.script}</strong>
                <span>{brand.scriptLine2}</span>
              </div>
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

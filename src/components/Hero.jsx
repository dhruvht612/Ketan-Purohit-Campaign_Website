import { motion, useReducedMotion } from 'framer-motion'
import Button from './Button.jsx'
import Placeholder from './Placeholder.jsx'
import Icon from './Icon.jsx'
import { getSite } from '../lib/cms.js'
import './Hero.css'

export default function Hero() {
  const site = getSite()
  const reduce = useReducedMotion()

  const rise = (delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] },
  })

  return (
    <section className="hero" aria-label="Introduction">
      {/* Subtle animated background */}
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__blob hero__blob--1" />
        <span className="hero__blob hero__blob--2" />
        <span className="hero__grid" />
      </div>

      <div className="container hero__inner">
        <div className="hero__copy">
          <motion.span className="hero__eyebrow" {...rise(0.05)}>
            <span className="tick tick--accent" /> {site.brand.role} · 2026
          </motion.span>

          <motion.h1 className="hero__title" {...rise(0.12)}>
            {site.brand.name}
          </motion.h1>

          <motion.p className="hero__tagline" {...rise(0.2)}>
            Integrity <span>·</span> Vision <span>·</span> Leadership
          </motion.p>

          <motion.p className="hero__lede" {...rise(0.28)}>
            A dedicated, full-time voice for Ward 12 — putting students first,
            treating parents as partners, and bringing real accountability back
            to the board.
          </motion.p>

          <motion.div className="hero__actions" {...rise(0.36)}>
            <Button to="/donate" variant="accent" size="lg">Donate</Button>
            <Button to="/volunteer" variant="secondary" size="lg">
              Volunteer <Icon name="arrow" size={18} />
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="hero__media"
          initial={{ opacity: 0, scale: reduce ? 1 : 0.96, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="hero__portrait">
            <Placeholder
              src={site.images.portrait}
              seed="ketan-portrait"
              monogram
              alt="Ketan Purohit, candidate for TDSB Ward 12 Trustee"
              ratio="4 / 5"
              rounded="var(--radius-lg)"
              objectPosition="center top"
              loading="eager"
            />
          </div>
          <div className="hero__badge">
            <span className="tick" />
            <div>
              <strong>Full-time trustee</strong>
              <span>Ready to serve on day one</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

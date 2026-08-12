import { motion, useReducedMotion } from 'framer-motion'
import './PageHeader.css'

/** Compact hero band for interior pages. */
export default function PageHeader({ eyebrow, title, lede }) {
  const reduce = useReducedMotion()
  return (
    <header className="page-header">
      <div className="page-header__bg" aria-hidden="true">
        <span className="page-header__wash" />
        <span className="page-header__grid" />
      </div>
      <div className="container page-header__inner">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {eyebrow && (
            <span className="eyebrow eyebrow--center">
              <span className="tick tick--accent" /> {eyebrow}
            </span>
          )}
          <h1 className="page-header__title">{title}</h1>
          {lede && <p className="page-header__lede">{lede}</p>}
        </motion.div>
      </div>
    </header>
  )
}

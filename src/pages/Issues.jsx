import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import Button from '../components/Button.jsx'
import { getIssues } from '../lib/cms.js'

export default function Issues() {
  const issues = getIssues()
  const [open, setOpen] = useState(null)

  return (
    <>
      <PageHeader
        eyebrow="The Issues"
        title="A practical plan for stronger schools"
        lede="Where Ketan stands on the priorities that shape every student’s day. Select any issue to read the plan behind it."
      />

      <section className="section">
        <div className="container">
          <div className="grid-cards">
            {issues.map((issue, i) => {
              const isOpen = open === issue.id
              return (
                <Reveal key={issue.id} delay={i * 60}>
                  <article className={`card issue-full ${isOpen ? 'is-open' : ''}`}>
                    <span className="issue-card__icon">
                      <Icon name={issue.icon} size={26} strokeWidth={1.8} />
                    </span>
                    <h3 className="issue-card__title">{issue.title}</h3>
                    <p className="issue-card__summary">{issue.summary}</p>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          className="issue-full__detail"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                        >
                          <p>{issue.detail}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      className="issue-full__toggle"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : issue.id)}
                    >
                      {isOpen ? 'Show less' : 'Learn more'}
                      <Icon name="arrow" size={16} style={{ transform: isOpen ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
                    </button>
                  </article>
                </Reveal>
              )
            })}
          </div>

          <Reveal className="center-cta">
            <p className="issues-cta-text">Have a priority we’ve missed? We’d love to hear it.</p>
            <Button to="/contact" variant="primary" size="lg">
              Share your thoughts <Icon name="arrow" size={18} />
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}

import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon.jsx'
import Button from './Button.jsx'
import Placeholder from './Placeholder.jsx'
import { Text, Paragraphs } from './Editable.jsx'
import './IssueCard.css'

/**
 * One issue, in two shapes.
 *
 *   variant="preview"  icon + title + short description, links to /issues.
 *                      Used for the homepage grid.
 *   variant="full"     supporting visual + title + short description +
 *                      expandable long-form content + optional CTA.
 *                      Used on the Issues page.
 *
 * All copy comes from src/content/issues.json, so the final write-up drops in
 * without touching this component.
 */
export default function IssueCard({ issue, variant = 'preview' }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  if (variant === 'preview') {
    return (
      <article className="card card--hover card--ruled issue-card">
        <span className="issue-card__icon">
          <Icon name={issue.icon} size={26} strokeWidth={1.8} />
        </span>
        <h3 className="issue-card__title">{issue.title}</h3>
        <Text as="p" value={issue.short} className="issue-card__summary" />
        <Link to="/issues" className="issue-card__more">
          Learn more <Icon name="arrow" size={16} />
        </Link>
      </article>
    )
  }

  return (
    <article className={`card card--hover issue-full ${open ? 'is-open' : ''}`}>
      <div className="issue-full__media">
        <Placeholder
          src={issue.image?.src}
          alt={issue.image?.alt || `${issue.title} — supporting image`}
          ratio="16 / 9"
          rounded="0"
        />
        <span className="issue-full__icon">
          <Icon name={issue.icon} size={22} strokeWidth={2} />
        </span>
      </div>

      <div className="issue-full__body">
        <h3 className="issue-card__title">{issue.title}</h3>
        <Text as="p" value={issue.short} className="issue-card__summary" />

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              className="issue-full__detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <div className="issue-full__detail-inner">
                <Paragraphs
                  items={issue.long}
                  placeholder={`[FULL WRITE-UP — the campaign's position on ${issue.title}.]`}
                  tagLabel="Write-up to be supplied"
                />
                {issue.cta?.enabled && issue.cta.to && (
                  <Button to={issue.cta.to} variant="secondary" size="sm" className="issue-full__cta">
                    {issue.cta.label} <Icon name="arrow" size={15} />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          className="issue-full__toggle"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Show less' : 'Read more'}
          <Icon name="arrow" size={16} style={{ transform: open ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
          <span className="visually-hidden"> about {issue.title}</span>
        </button>
      </div>
    </article>
  )
}

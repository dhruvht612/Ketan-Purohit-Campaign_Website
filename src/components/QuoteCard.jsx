import Placeholder from './Placeholder.jsx'
import Icon from './Icon.jsx'
import { getBrand } from '../lib/cms.js'

/**
 * One campaign statement in the homepage carousel: a photo, the topic it
 * belongs to, and the statement itself — presented as something the campaign
 * is saying, not as a generic content tile.
 *
 * Reusable on its own; the carousel just lays a row of these out.
 */
export default function QuoteCard({ card, position, total, isActive = false }) {
  const brand = getBrand()

  return (
    <article
      className={`qcard qcard--${card.tone || 'navy'} ${isActive ? 'is-active' : ''}`}
      aria-roledescription="slide"
      aria-label={`${position} of ${total}: ${card.category}`}
    >
      <div className="qcard__media">
        <Placeholder
          src={card.image?.src}
          alt={card.image?.alt || `${card.category} — ${card.quote}`}
          ratio="16 / 10"
          rounded="0"
        />
        <span className="qcard__topic">{card.category}</span>
      </div>

      <div className="qcard__body">
        <span className="qcard__mark" aria-hidden="true">
          <Icon name="quote" size={26} />
        </span>
        <p className="qcard__quote">{card.quote}</p>
        <p className="qcard__by">
          <span className="tick" aria-hidden="true" />
          <span>
            <strong>{brand.name}</strong>
            <span className="qcard__role">{brand.role}</span>
          </span>
        </p>
      </div>
    </article>
  )
}

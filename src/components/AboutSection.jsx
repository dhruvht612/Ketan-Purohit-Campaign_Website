import Placeholder from './Placeholder.jsx'
import Reveal from './Reveal.jsx'
import Button from './Button.jsx'
import Icon from './Icon.jsx'
import { Text, Paragraphs, PlaceholderTag, isPlaceholder } from './Editable.jsx'
import { getAbout, getSite } from '../lib/cms.js'
import './AboutSection.css'

/**
 * The About block — used on the homepage and on /about.
 *
 * Everything it shows comes from src/content/about.json: the large photo, the
 * heading, the short intro, the long-form biography, optional highlights and
 * an optional CTA. Slots still in [BRACKETS] render flagged as placeholders.
 *
 * `compact` trims the long biography down to the intro for the homepage, so
 * the full write-up lives on /about without duplicating it.
 */
export default function AboutSection({ compact = false }) {
  const about = getAbout()
  const site = getSite()
  const highlights = (about.highlights || []).filter(Boolean)
  const showHighlights = highlights.length > 0

  return (
    <section className="section about" id="about">
      <div className="container about__grid">
        <Reveal className="about__media">
          <figure className="about__figure">
            <div className="about__photo">
              <Placeholder
                src={about.photo?.src || site.images.portrait}
                monogram
                alt={about.photo?.alt || `${site.brand.name}, ${site.brand.role} candidate`}
                ratio="4 / 5"
                rounded="var(--radius)"
                objectPosition="center top"
              />
            </div>
            {about.photo?.caption && (
              <figcaption className="about__caption">
                {isPlaceholder(about.photo.caption) && <PlaceholderTag>Caption</PlaceholderTag>}
                <Text as="span" value={about.photo.caption} />
              </figcaption>
            )}
          </figure>

          {showHighlights && (
            <ul className="about__stats">
              {highlights.map((h) => (
                <li key={h.id} className="about__stat">
                  <Text as="span" value={h.value} className="about__stat-value" />
                  <Text as="span" value={h.label} className="about__stat-label" />
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <div className="about__copy">
          <Reveal>
            <span className="eyebrow">
              <span className="tick tick--accent" /> {about.eyebrow}
            </span>
            <h2 className="section-title about__title bar-accent">{about.title}</h2>
            <Text as="p" value={about.intro} className="about__lede" />
          </Reveal>

          {!compact && (
            <Reveal delay={90} className="about__bio">
              <h3 className="about__bio-title">Biography</h3>
              <Paragraphs
                items={about.biography}
                placeholder="[BIOGRAPHY — to be supplied by the campaign.]"
                tagLabel="Biography to be supplied"
              />
            </Reveal>
          )}

          {about.cta?.enabled && (
            <Reveal delay={140} className="about__cta">
              <Button to={about.cta.to} variant="primary" size="lg">
                {about.cta.label} <Icon name="arrow" size={18} />
              </Button>
              {compact && (
                <Button to="/about" variant="link" size="md" className="about__cta-link">
                  Read the full biography <Icon name="arrow" size={16} />
                </Button>
              )}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}

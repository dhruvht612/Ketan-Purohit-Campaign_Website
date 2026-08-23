import Placeholder from './Placeholder.jsx'
import Reveal from './Reveal.jsx'
import Button from './Button.jsx'
import Icon from './Icon.jsx'
import { Text, Paragraphs, PlaceholderTag, isPlaceholder } from './Editable.jsx'
import { getAbout, getSite } from '../lib/cms.js'
import './AboutSection.css'

/**
 * The About block — used on the homepage and in full on /about.
 *
 * Everything it shows comes from src/content/about.json, and it follows the
 * campaign's own running order: the portrait and the lead statement, then
 * "What do I bring?", then why he is running, then the priorities. Slots still
 * in [BRACKETS] render flagged as placeholders.
 *
 * `compact` is the homepage cut: portrait, lead statement, and the opening
 * paragraph of the bio. Everything else — the rest of the bio, why he is
 * running, the priorities — lives on /about, so nothing is said twice and the
 * priorities do not land directly above the homepage's issues preview.
 *
 * The two long blocks carry `id`s because the About menu in the header links
 * straight to them.
 */
export default function AboutSection({ compact = false }) {
  const about = getAbout()
  const site = getSite()
  const highlights = (about.highlights || []).filter(Boolean)
  const why = about.whyRunning
  const priorities = about.priorities
  const bring = about.bring

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

          {highlights.length > 0 && (
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
            {/* The flyer's lead statement: the ask, then the three words the
                campaign runs on. */}
            <Text as="p" value={about.intro} className="about__lede" />
            {about.motto && <p className="about__motto">{about.motto}</p>}
            {/* On the homepage the lead statement is a single line, so the
                opening paragraph of the bio comes with it — otherwise the
                block is a photo and a slogan. The rest is on /about. */}
            {compact && bring?.paragraphs?.[0] && (
              <p className="about__compact-bio">{bring.paragraphs[0]}</p>
            )}
          </Reveal>

          {!compact && bring && (
            <Reveal delay={90} className="about__bio" id="bring">
              <h3 className="about__bio-title">{bring.title}</h3>
              <Paragraphs
                items={bring.paragraphs}
                placeholder="[BIOGRAPHY — to be supplied by the campaign.]"
                tagLabel="Biography to be supplied"
              />
            </Reveal>
          )}

          {!compact && why?.items?.length > 0 && (
            <Reveal delay={120} className="about__why" id="why">
              <h3 className="about__bio-title">{why.title}</h3>
              {why.lead && <p className="about__why-lead">{why.lead}</p>}
              <ul className="about__why-list">
                {why.items.map((item) => (
                  <li key={item}>
                    <span className="tick tick--gold" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {!compact && priorities?.items?.length > 0 && (
            <Reveal delay={150} className="about__priorities" id="priorities">
              {priorities.eyebrow && (
                <span className="eyebrow about__priorities-eyebrow">
                  <span className="tick tick--gold" /> {priorities.eyebrow}
                </span>
              )}
              <h3 className="about__bio-title">{priorities.title}</h3>
              <ul className="about__priority-list">
                {priorities.items.map((p) => (
                  <li key={p.id} className="about__priority">
                    <span className="about__priority-label">{p.label}</span>
                    <span className="about__priority-text">{p.text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {about.cta?.enabled && (
            <Reveal delay={190} className="about__cta">
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

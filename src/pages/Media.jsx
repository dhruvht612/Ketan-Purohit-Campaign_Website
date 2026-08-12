import PageHeader from '../components/PageHeader.jsx'
import MediaCard from '../components/MediaCard.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import Button from '../components/Button.jsx'
import { PlaceholderTag } from '../components/Editable.jsx'
import { getMedia } from '../lib/cms.js'

/**
 * Media page — one labelled block per media type (appearances, coverage,
 * articles, videos, other). Groups come from src/content/media.json, so a new
 * category or item is a data change, not a code change.
 */
export default function Media() {
  const { groups } = getMedia()

  return (
    <>
      <PageHeader
        eyebrow="News & Media"
        title="Campaign media"
        lede="Appearances, coverage, articles and video from the campaign."
      />

      <section className="section">
        <div className="container">
          <Reveal className="issues-notice">
            <PlaceholderTag>Awaiting final material</PlaceholderTag>
            <p>
              The structure below is ready for real media. Add entries under the matching
              group in <code>src/content/media.json</code> — set <code>url</code> to make a
              card clickable and <code>image.src</code> to give it a thumbnail.
            </p>
          </Reveal>

          {groups.map((group) => (
            <section key={group.id} className="media-section" aria-labelledby={`media-${group.id}`}>
              <div className="subsection-head">
                <span className="subsection-head__icon">
                  <Icon name={group.icon} size={22} strokeWidth={2} />
                </span>
                <div>
                  <h2 id={`media-${group.id}`}>{group.title}</h2>
                  {group.blurb && <p className="subsection-head__blurb">{group.blurb}</p>}
                </div>
              </div>

              <div className={group.layout === 'video' ? 'video-grid' : 'news-grid'}>
                {group.items.map((item, i) => (
                  <Reveal key={item.id} delay={i * 60}>
                    <MediaCard item={item} layout={group.layout} />
                  </Reveal>
                ))}
              </div>
            </section>
          ))}

          <Reveal className="center-cta">
            <Button to="/pictures" variant="secondary" size="lg">
              See campaign photos <Icon name="arrow" size={18} />
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}

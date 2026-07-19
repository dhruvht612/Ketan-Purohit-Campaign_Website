import PageHeader from '../components/PageHeader.jsx'
import Placeholder from '../components/Placeholder.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import Button from '../components/Button.jsx'
import { getNews } from '../lib/cms.js'

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function News() {
  const { articles, videos } = getNews()

  return (
    <>
      <PageHeader
        eyebrow="News & Media"
        title="Latest from the campaign"
        lede="Announcements, event recaps, and policy updates — plus videos from the trail across Ward 12."
      />

      <section className="section">
        <div className="container">
          <div className="subsection-head">
            <span className="tick" />
            <h2>Articles &amp; announcements</h2>
          </div>

          <div className="news-grid">
            {articles.map((a, i) => (
              <Reveal key={a.id} delay={i * 60}>
                <article className="card card--hover article-card">
                  <div className="article-card__media">
                    <Placeholder seed={a.image} label={a.category} alt={a.title} ratio="16 / 10" rounded="0" />
                    <span className="article-card__cat">{a.category}</span>
                  </div>
                  <div className="article-card__body">
                    <span className="article-card__date">{formatDate(a.date)}</span>
                    <h3 className="article-card__title">{a.title}</h3>
                    <p className="article-card__excerpt">{a.excerpt}</p>
                    <a className="article-card__more" href="#read">
                      Read more <Icon name="arrow" size={16} />
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="subsection-head">
            <span className="tick tick--accent" />
            <h2>Videos</h2>
          </div>

          <div className="video-grid">
            {videos.map((v, i) => (
              <Reveal key={v.id} delay={i * 60}>
                <div className="video-card" role="button" tabIndex={0} aria-label={`Play video: ${v.title}`}>
                  <Placeholder seed={v.thumb} alt={v.title} ratio="16 / 9" rounded="0" />
                  <div className="video-card__play">
                    <span className="video-card__btn"><Icon name="play" size={26} /></span>
                  </div>
                  <div className="video-card__meta">
                    <strong>{v.title}</strong>
                    <span className="video-card__dur">{v.duration}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="center-cta">
            <Button to="/pictures" variant="secondary" size="lg">
              See campaign pictures <Icon name="arrow" size={18} />
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}

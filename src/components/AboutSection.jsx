import Placeholder from './Placeholder.jsx'
import Reveal from './Reveal.jsx'
import { getAbout } from '../lib/cms.js'
import './AboutSection.css'

export default function AboutSection() {
  const about = getAbout()

  return (
    <section className="section about" id="about">
      <div className="container about__grid">
        <Reveal className="about__media">
          <div className="about__photo">
            <Placeholder
              seed="ketan-about"
              monogram
              alt="Ketan Purohit meeting with community members"
              ratio="4 / 5"
              rounded="var(--radius-lg)"
            />
          </div>
          <div className="about__stats">
            {about.stats.map((s) => (
              <div key={s.label} className="about__stat">
                <span className="about__stat-value">{s.value}</span>
                <span className="about__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="about__copy">
          <Reveal>
            <span className="eyebrow">{about.eyebrow}</span>
            <h2 className="section-title about__title">{about.title}</h2>
            <p className="section-lede about__lede">{about.lede}</p>
          </Reveal>

          <div className="about__cards">
            {about.cards.map((card, i) => (
              <Reveal key={card.id} delay={i * 90} className="card card--hover about__card">
                <h3 className="about__card-title">{card.title}</h3>
                <div className="prose">
                  {card.body.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

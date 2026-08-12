import Hero from '../components/Hero.jsx'
import QuoteCarousel from '../components/QuoteCarousel.jsx'
import AboutSection from '../components/AboutSection.jsx'
import IssueCard from '../components/IssueCard.jsx'
import DonateCTA from '../components/DonateCTA.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import { getQuotes, getIssues } from '../lib/cms.js'

export default function Home() {
  const quotes = getQuotes()
  const issues = getIssues().slice(0, 6)

  return (
    <>
      <Hero />

      {/* No eyebrow here: "What this campaign stands for" only restated the
          heading below it. The heading carries itself. */}
      <QuoteCarousel
        cards={quotes}
        eyebrow={null}
        title="Where Ketan stands"
        lede="Scroll through the campaign's statements across the issues that shape every student's day."
      />

      <AboutSection compact />

      {/* Issues preview */}
      <section className="section section--tint">
        <div className="container">
          <Reveal className="section-head">
            <h2 className="section-title bar-accent bar-accent--center">The issues that matter</h2>
            <p className="section-lede">
              The priorities this campaign is running on. Full write-ups are on the Issues page.
            </p>
          </Reveal>

          <div className="grid-cards">
            {issues.map((issue, i) => (
              <Reveal key={issue.id} delay={i * 70}>
                <IssueCard issue={issue} variant="preview" />
              </Reveal>
            ))}
          </div>

          <Reveal className="center-cta">
            <Button to="/issues" variant="primary" size="lg">
              See all issues <Icon name="arrow" size={18} />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Donation CTA */}
      <section className="section section--cream">
        <div className="container">
          <Reveal>
            <DonateCTA variant="band" />
          </Reveal>
        </div>
      </section>
    </>
  )
}

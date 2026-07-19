import Hero from '../components/Hero.jsx'
import Carousel from '../components/Carousel.jsx'
import AboutSection from '../components/AboutSection.jsx'
import IssueCard from '../components/IssueCard.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import { getSlides, getIssues } from '../lib/cms.js'

export default function Home() {
  const slides = getSlides()
  const issues = getIssues().slice(0, 6)

  return (
    <>
      <Hero />
      <Carousel slides={slides} />
      <AboutSection />

      {/* Issues preview */}
      <section className="section section--tint">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow eyebrow--center"><span className="tick" /> Where Ketan stands</span>
            <h2 className="section-title">The issues that matter to Ward 12</h2>
            <p className="section-lede">
              Practical priorities, built from listening to students, parents, and educators
              across the ward.
            </p>
          </Reveal>

          <div className="grid-cards">
            {issues.map((issue, i) => (
              <Reveal key={issue.id} delay={i * 70}>
                <IssueCard issue={issue} />
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
    </>
  )
}

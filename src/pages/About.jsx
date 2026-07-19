import PageHeader from '../components/PageHeader.jsx'
import AboutSection from '../components/AboutSection.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'

const VALUES = [
  { title: 'Show up', body: 'Every board meeting, every town hall, every school — present and prepared, not just at election time.' },
  { title: 'Listen first', body: 'Decisions shaped by the families and educators who live with them, not made behind closed doors.' },
  { title: 'Deliver results', body: 'Clear goals, measurable progress, and honest updates on what is and isn’t working.' },
]

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About Ketan"
        title="Integrity, vision, and leadership for Ward 12"
        lede="A neighbour and parent who has spent his life close to the classroom — ready to bring a full-time, listen-first approach to the board."
      />

      <AboutSection />

      <section className="section section--tint">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow eyebrow--center"><span className="tick" /> How Ketan works</span>
            <h2 className="section-title">Three commitments you can count on</h2>
          </Reveal>
          <div className="grid-cards">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80} className="card value-card">
                <span className="value-card__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="center-cta">
            <Button to="/volunteer" variant="primary" size="lg">
              Join the campaign <Icon name="arrow" size={18} />
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}

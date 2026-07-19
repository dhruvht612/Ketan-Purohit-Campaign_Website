import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import { getGroups } from '../lib/cms.js'

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default function Groups() {
  const groups = getGroups()

  return (
    <>
      <PageHeader
        eyebrow="Community Groups"
        title="A campaign powered by community"
        lede="Ketan is proud to work alongside the organizations and supporter groups building a stronger Ward 12."
      />

      <section className="section">
        <div className="container">
          <div className="grid-cards">
            {groups.map((g, i) => (
              <Reveal key={g.id} delay={i * 60}>
                <article className="card card--hover group-card">
                  <span className="group-card__logo" aria-hidden="true">{initials(g.name)}</span>
                  <span className="group-card__type">{g.type}</span>
                  <h3 className="group-card__name">{g.name}</h3>
                  <p className="group-card__desc">{g.description}</p>
                  <Button to="/contact" variant="secondary" size="sm">
                    Join <Icon name="arrow" size={15} />
                  </Button>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="center-cta">
            <p className="issues-cta-text">Represent a group that wants to get involved?</p>
            <Button to="/contact" variant="primary" size="lg">
              Partner with us <Icon name="arrow" size={18} />
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}

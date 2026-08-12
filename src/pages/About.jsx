import PageHeader from '../components/PageHeader.jsx'
import AboutSection from '../components/AboutSection.jsx'
import DonateCTA from '../components/DonateCTA.jsx'
import Reveal from '../components/Reveal.jsx'
import { getAbout } from '../lib/cms.js'

export default function About() {
  const about = getAbout()

  return (
    <>
      <PageHeader
        eyebrow={about.eyebrow}
        title={about.title}
        lede="Ketan's background, and why he's running for TDSB Ward 12 Trustee."
      />

      {/* Full About block: large photo, intro, complete biography, CTA. */}
      <AboutSection />

      <section className="section section--tint">
        <div className="container">
          <Reveal>
            <DonateCTA variant="band" />
          </Reveal>
        </div>
      </section>
    </>
  )
}

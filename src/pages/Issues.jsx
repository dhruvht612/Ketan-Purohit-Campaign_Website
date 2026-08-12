import PageHeader from '../components/PageHeader.jsx'
import IssueCard from '../components/IssueCard.jsx'
import Reveal from '../components/Reveal.jsx'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import { PlaceholderTag } from '../components/Editable.jsx'
import { getIssues } from '../lib/cms.js'

export default function Issues() {
  const issues = getIssues()

  return (
    <>
      <PageHeader
        eyebrow="The Issues"
        title="Where Ketan stands"
        lede="The priorities this campaign is running on. Open any issue to read the full write-up."
      />

      <section className="section">
        <div className="container">
          <Reveal className="issues-notice">
            <PlaceholderTag>Awaiting final write-up</PlaceholderTag>
            <p>
              The issue headings below are in place and ready for the campaign's final
              wording. Each one takes a supporting image, a short description and a
              longer write-up — supply them in <code>src/content/issues.json</code> and
              they appear here automatically.
            </p>
          </Reveal>

          <div className="grid-cards issues-grid">
            {issues.map((issue, i) => (
              <Reveal key={issue.id} delay={i * 60}>
                <IssueCard issue={issue} variant="full" />
              </Reveal>
            ))}
          </div>

          <Reveal className="center-cta">
            <p className="issues-cta-text">Have a priority we've missed? We'd love to hear it.</p>
            <Button to="/contact" variant="primary" size="lg">
              Share your thoughts <Icon name="arrow" size={18} />
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}

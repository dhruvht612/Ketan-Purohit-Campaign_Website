import LegalPage from './LegalPage.jsx'
import { getPrivacy } from '../lib/cms.js'

/**
 * Privacy Policy.
 *
 * The section structure mirrors the policy document supplied for the site.
 * Section bodies are filled by pasting that document into
 * `privacy.sections[].body` in src/content/legal.json — the wording must come
 * from the supplied policy, so none is drafted here.
 */
export default function Privacy() {
  const privacy = getPrivacy()

  return (
    <LegalPage
      eyebrow="Privacy"
      title={privacy.title}
      lede={privacy.lede}
      effective={privacy.effective}
      sections={privacy.sections}
      footer={
        <div className="legal-contact">
          <h2 className="legal-section__title">Questions about this policy?</h2>
          <p>
            Contact{' '}
            <a href={`mailto:${privacy.contactEmail}`} className="legal-contact__link">
              {privacy.contactEmail}
            </a>
            .
          </p>
        </div>
      }
    />
  )
}

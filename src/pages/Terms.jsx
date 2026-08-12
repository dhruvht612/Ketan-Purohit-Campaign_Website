import LegalPage from './LegalPage.jsx'
import { getTerms } from '../lib/cms.js'

/**
 * Terms page. Exists so the "Terms" link in the SMS/marketing consent notice
 * resolves somewhere real; the wording itself is supplied by the campaign via
 * src/content/legal.json.
 */
export default function Terms() {
  const terms = getTerms()

  return (
    <LegalPage
      eyebrow="Legal"
      title={terms.title}
      lede={terms.lede}
      sections={terms.sections}
    />
  )
}

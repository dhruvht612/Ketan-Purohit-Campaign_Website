import { Link } from 'react-router-dom'
import { getConsentText, hasTerms, getTerms } from '../lib/cms.js'
import './ConsentCheckbox.css'

/**
 * SMS / marketing consent opt-in.
 * ------------------------------
 * The wording is reproduced verbatim from src/content/legal.json — it is
 * compliance text, so it is never paraphrased here. The JSON carries {TERMS}
 * and {PRIVACY} tokens which this component swaps for real in-site links; the
 * policies themselves live on their own pages, so the form stays short.
 *
 * This checkbox is the opt-in itself: it is never required to submit the
 * form. It only becomes a hard requirement in the direction that matters —
 * ticking it means agreeing to be messaged, so a phone number has to be
 * present. That check lives with the form's validation.
 */
export default function ConsentCheckbox({ id = 'sms-consent', checked, onChange, error }) {
  const consent = getConsentText()
  const terms = getTerms()

  /* Split the compliance text on its link tokens, keeping every other
     character exactly as supplied. */
  const parts = consent.text.split(/(\{TERMS\}|\{PRIVACY\})/g)

  return (
    <div className={`consent ${error ? 'has-error' : ''}`}>
      <div className="consent__row">
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={`${id}-text${error ? ` ${id}-error` : ''}`}
        />
        <label htmlFor={id} className="consent__optin">{consent.optInLabel}</label>
      </div>

      <p id={`${id}-text`} className="consent__text">
        {parts.map((part, i) => {
          if (part === '{PRIVACY}') {
            return (
              <Link key={i} to="/privacy" className="consent__link">
                {consent.privacyLabel}
              </Link>
            )
          }
          if (part === '{TERMS}') {
            return hasTerms() ? (
              <Link key={i} to={terms.route} className="consent__link">
                {consent.termsLabel}
              </Link>
            ) : (
              <span key={i}>{consent.termsLabel}</span>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </p>

      <p className="consent__hint">{consent.optInHint}</p>
      {error && <p id={`${id}-error`} className="field__error" role="alert">{error}</p>}
    </div>
  )
}

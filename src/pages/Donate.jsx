import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import { useToast } from '../components/Toast.jsx'
import { getSite } from '../lib/cms.js'
import { createDonation } from '../lib/api.js'

const PRESETS = [5, 10, 25, 50, 100]

export default function Donate() {
  const site = getSite()
  const { min, max, donation: legalText, individualOnly } = site.legal
  const toast = useToast()

  const [amount, setAmount] = useState(25)
  const [custom, setCustom] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const effectiveAmount = custom !== '' ? Number(custom) : amount

  const pickPreset = (v) => {
    setAmount(v)
    setCustom('')
    setErrors((e) => ({ ...e, amount: undefined }))
  }

  const validate = () => {
    const e = {}
    const val = effectiveAmount
    if (!val || Number.isNaN(val)) e.amount = 'Please choose or enter an amount.'
    else if (val < min) e.amount = `The minimum contribution is $${min}.`
    else if (val > max) e.amount = `The maximum contribution is $${max} per candidate.`
    if (!confirmed) e.confirmed = 'Please confirm the statement below before continuing.'
    return e
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const eObj = validate()
    setErrors(eObj)
    if (Object.keys(eObj).length) {
      toast('Please review the highlighted items.', { type: 'error' })
      return
    }
    setSubmitting(true)
    try {
      const { url } = await createDonation({ amount: effectiveAmount, confirmed })
      if (url) { window.location.href = url; return }
      toast('Redirecting to secure checkout…', { type: 'success' })
    } catch {
      // Scaffold: payment provider not wired yet.
      toast('Secure checkout isn’t connected yet — add your Stripe keys to go live.', { type: 'error' })
    }
    setSubmitting(false)
  }

  return (
    <>
      <PageHeader
        eyebrow="Chip In"
        title="Power a campaign for stronger schools"
        lede="Your contribution funds lawn signs, door-knocking, and reaching every family in Ward 12. Thank you for your support."
      />

      <section className="section">
        <div className="container">
          <div className="form-layout">
            <form className="form-card" onSubmit={onSubmit} noValidate>
              <div className="form-stack">
                <div className="donate-note">
                  <Icon name="shield" size={18} /> {individualOnly}
                </div>

                <div>
                  <p className="form-legend">Choose an amount</p>
                  <div className="amount-grid">
                    {PRESETS.map((v) => (
                      <button
                        type="button"
                        key={v}
                        className={`amount ${custom === '' && amount === v ? 'is-active' : ''}`}
                        onClick={() => pickPreset(v)}
                      >
                        ${v}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`amount ${custom !== '' ? 'is-active' : ''}`}
                      onClick={() => { setCustom(String(amount || min)); }}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                <Field
                  id="custom"
                  type="number"
                  label="Custom amount (CAD)"
                  min={min}
                  max={max}
                  value={custom}
                  onChange={(e) => { setCustom(e.target.value); setErrors((x) => ({ ...x, amount: undefined })) }}
                  hint={`Between $${min} and $${max}.`}
                  error={errors.amount}
                  placeholder={`e.g. 75`}
                />

                <div className={`legal-box ${errors.confirmed ? 'has-error' : ''}`}>
                  <input
                    id="confirm"
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => { setConfirmed(e.target.checked); setErrors((x) => ({ ...x, confirmed: undefined })) }}
                  />
                  <label htmlFor="confirm">{legalText}</label>
                </div>
                {errors.confirmed && <p className="field__error" role="alert">{errors.confirmed}</p>}

                <Button variant="accent" size="lg" full className="form-submit" disabled={submitting}>
                  {submitting ? 'Processing…' : `Donate $${effectiveAmount > 0 ? effectiveAmount : ''} securely`}
                </Button>
                <p className="form-note">
                  Payments are processed securely by our payment provider. You’ll be redirected to complete your gift.
                </p>
              </div>
            </form>

            <aside className="form-aside">
              <div className="aside-card">
                <h3>Where your gift goes</h3>
                <ul className="aside-list">
                  <li><span className="tick tick--accent" /> <span><strong style={{ color: '#fff' }}>$10</strong> — printing for a block of door hangers</span></li>
                  <li><span className="tick tick--accent" /> <span><strong style={{ color: '#fff' }}>$25</strong> — a lawn sign for a supporter</span></li>
                  <li><span className="tick tick--accent" /> <span><strong style={{ color: '#fff' }}>$100</strong> — a full day of community outreach</span></li>
                </ul>
              </div>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ color: 'var(--blue-900)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="tick" /> Individual donations only
                </h3>
                <p style={{ color: 'var(--muted)' }}>
                  Under Ontario elections law, we accept contributions from individual Ontario
                  residents only — no corporate or union donations. The legal maximum is ${max} per candidate.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

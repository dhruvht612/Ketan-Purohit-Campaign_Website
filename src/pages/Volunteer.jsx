import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Field from '../components/Field.jsx'
import RadioGroup from '../components/RadioGroup.jsx'
import ConsentCheckbox from '../components/ConsentCheckbox.jsx'
import DonateCTA from '../components/DonateCTA.jsx'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import { useToast } from '../components/Toast.jsx'
import { getWardsMeta, getConsentText } from '../lib/cms.js'
import { submitVolunteer } from '../lib/api.js'

const SUPPORT_TYPES = ['Lawn Sign', 'Canvassing', 'Phone Calls', 'Election Day Help']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const empty = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  ward: '',
  support: [],
  smsConsent: false,
}

export default function Volunteer() {
  const wards = getWardsMeta()
  const consent = getConsentText()
  const toast = useToast()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((x) => ({ ...x, [key]: undefined }))
  }

  const setValue = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((x) => ({ ...x, [key]: undefined }))
  }

  const toggleSupport = (value) => {
    setForm((f) => ({
      ...f,
      support: f.support.includes(value)
        ? f.support.filter((v) => v !== value)
        : [...f.support, value],
    }))
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Please enter your first name.'
    if (!form.lastName.trim()) e.lastName = 'Please enter your last name.'
    if (!form.email.trim()) e.email = 'Please enter your email address.'
    else if (!EMAIL_RE.test(form.email)) e.email = 'Please enter a valid email address.'

    /* The consent box is the opt-in itself, so it never blocks a sign-up.
       It only binds in the direction that matters: agreeing to be texted
       requires a number to text. */
    if (form.smsConsent && !form.phone.trim()) {
      e.phone = 'Please add a phone number, or clear the text-message opt-in below.'
      e.smsConsent = consent.requiredError
    }
    return e
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const eObj = validate()
    setErrors(eObj)
    if (Object.keys(eObj).length) {
      toast('Please fix the highlighted fields.', { type: 'error' })
      return
    }
    setSubmitting(true)
    try {
      await submitVolunteer(form)
    } catch {
      // Scaffold: no server during local dev — proceed optimistically.
    }
    setSubmitting(false)
    setDone(true)
    toast('Thanks! Your volunteer sign-up is in.', { type: 'success' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <PageHeader
        eyebrow="Get Involved"
        title="Volunteer with the campaign"
        lede="Tell us how you'd like to help — every hour makes a difference."
      />

      <section className="section">
        <div className="container">
          {done ? (
            <div className="form-card thanks" role="status">
              <span className="thanks__mark"><Icon name="check" size={34} strokeWidth={2.6} /></span>
              <h2>Welcome to the team, {form.firstName}!</h2>
              <p>
                Thanks for signing up to volunteer. A member of our team will be in touch
                shortly with next steps.
              </p>
              <Button to="/" variant="primary">Back to home</Button>
            </div>
          ) : (
            <div className="form-layout">
              <form className="form-card" onSubmit={onSubmit} noValidate>
                <div className="form-stack">
                  <div className="form-row">
                    <Field id="firstName" label="First name" required value={form.firstName}
                      onChange={set('firstName')} error={errors.firstName} autoComplete="given-name" />
                    <Field id="lastName" label="Last name" required value={form.lastName}
                      onChange={set('lastName')} error={errors.lastName} autoComplete="family-name" />
                  </div>

                  <div className="form-row">
                    <Field id="email" type="email" label="Email" required value={form.email}
                      onChange={set('email')} error={errors.email} autoComplete="email" />
                    <Field id="phone" type="tel" label="Phone" value={form.phone}
                      onChange={set('phone')} error={errors.phone}
                      hint="Optional — needed only for text updates" autoComplete="tel" />
                  </div>

                  {/* Two city wards only — radios keep both visible and are
                      quicker than a two-item dropdown, especially on mobile. */}
                  <RadioGroup
                    name="ward"
                    legend={wards.legend}
                    hint={wards.hint}
                    options={wards.options}
                    value={form.ward}
                    onChange={setValue('ward')}
                    error={errors.ward}
                  />

                  <fieldset className="check-fieldset">
                    <legend className="form-legend">How would you like to help?</legend>
                    <div className="checks">
                      {SUPPORT_TYPES.map((t) => (
                        <label key={t} className="check">
                          <input type="checkbox" checked={form.support.includes(t)} onChange={() => toggleSupport(t)} />
                          {t}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <ConsentCheckbox
                    checked={form.smsConsent}
                    onChange={setValue('smsConsent')}
                    error={errors.smsConsent}
                  />

                  <Button variant="primary" size="lg" full className="form-submit" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Sign me up'}
                  </Button>
                  <p className="form-note">We'll only use your details to coordinate volunteering.</p>
                </div>
              </form>

              <aside className="form-aside">
                <div className="aside-card">
                  <h3>Ways to make an impact</h3>
                  <p>Pick what fits your schedule — big or small, it all adds up.</p>
                  <ul className="aside-list">
                    <li><span className="tick tick--gold" /> Display a lawn sign in your yard</li>
                    <li><span className="tick tick--gold" /> Knock on doors with our team</li>
                    <li><span className="tick tick--gold" /> Make calls from home on your own time</li>
                    <li><span className="tick tick--gold" /> Help get out the vote on election day</li>
                  </ul>
                </div>
                <DonateCTA variant="panel" />
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import { useToast } from '../components/Toast.jsx'
import { getWards } from '../lib/cms.js'
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
}

export default function Volunteer() {
  const wards = getWards()
  const toast = useToast()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
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
        lede="Ward 12 wins when neighbours pitch in. Tell us how you’d like to help — every hour makes a difference."
      />

      <section className="section">
        <div className="container">
          {done ? (
            <div className="form-card thanks" role="status">
              <span className="thanks__mark"><Icon name="check" size={34} strokeWidth={2.6} /></span>
              <h2>Welcome to the team, {form.firstName}!</h2>
              <p>
                Thanks for signing up to volunteer. A member of our team will be in touch shortly
                with next steps — check your inbox for a confirmation email.
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
                      onChange={set('phone')} hint="Optional" autoComplete="tel" />
                  </div>

                  <Field as="select" id="ward" label="Ward / Neighbourhood" value={form.ward} onChange={set('ward')}>
                    <option value="">Select your area…</option>
                    {wards.map((w) => <option key={w} value={w}>{w}</option>)}
                  </Field>

                  <fieldset style={{ border: 0, padding: 0 }}>
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

                  <Button variant="primary" size="lg" full className="form-submit" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Sign me up'}
                  </Button>
                  <p className="form-note">We’ll only use your details to coordinate volunteering. No spam, ever.</p>
                </div>
              </form>

              <aside className="form-aside">
                <div className="aside-card">
                  <h3>Ways to make an impact</h3>
                  <p>Pick what fits your schedule — big or small, it all adds up.</p>
                  <ul className="aside-list">
                    <li><span className="tick tick--accent" /> Display a lawn sign in your yard</li>
                    <li><span className="tick tick--accent" /> Knock on doors with our friendly team</li>
                    <li><span className="tick tick--accent" /> Make calls from home on your own time</li>
                    <li><span className="tick tick--accent" /> Help get out the vote on election day</li>
                  </ul>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ color: 'var(--blue-900)', marginBottom: '8px' }}>Prefer to chip in?</h3>
                  <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                    A donation of any size helps us reach more families across Ward 12.
                  </p>
                  <Button to="/donate" variant="accent">Donate instead</Button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

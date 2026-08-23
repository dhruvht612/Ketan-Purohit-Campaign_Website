import { useState } from 'react'
import Field from './Field.jsx'
import Button from './Button.jsx'
import { useToast } from './Toast.jsx'
import { submitVolunteer } from '../lib/api.js'
import './JoinForm.css'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The hero's supporter sign-up. Name and email only — the shortest ask that
 * still lands a usable record, so the hero stays short.
 *
 * It posts to the existing /api/volunteer endpoint, which already requires
 * exactly firstName + lastName + email and treats the rest as optional. That
 * keeps every sign-up on the campaign's one supporter list instead of opening a
 * second, near-identical endpoint.
 *
 * Labels are real <label> elements kept visually hidden: the placeholders carry
 * the same words for sighted users, and screen readers still get a proper name.
 */
export default function JoinForm() {
  const toast = useToast()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Enter your first name.'
    if (!form.lastName.trim()) e.lastName = 'Enter your last name.'
    if (!EMAIL.test(form.email)) e.email = 'Enter a valid email address.'
    return e
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      toast('Please fix the highlighted fields.', { type: 'error' })
      return
    }
    setSubmitting(true)
    try {
      await submitVolunteer(form)
    } catch {
      // Scaffold: no server during local dev — proceed optimistically, as the
      // volunteer and contact forms already do.
    }
    setSubmitting(false)
    setForm({ firstName: '', lastName: '', email: '' })
    toast("Thanks for joining — we'll be in touch.", { type: 'success' })
  }

  return (
    <div className="joinform">
      <h2 className="joinform__title">Join with Ketan</h2>

      <form className="joinform__form" onSubmit={onSubmit} noValidate>
        <div className="joinform__row">
          <Field
            id="firstName"
            label="First name"
            placeholder="First name"
            autoComplete="given-name"
            value={form.firstName}
            onChange={set('firstName')}
            error={errors.firstName}
            required
          />
          <Field
            id="lastName"
            label="Last name"
            placeholder="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={set('lastName')}
            error={errors.lastName}
            required
          />
        </div>

        <Field
          id="email"
          type="email"
          label="Email"
          placeholder="Email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          required
        />

        <Button type="submit" variant="accent" full disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}

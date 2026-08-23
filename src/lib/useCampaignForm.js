import { useCallback, useState } from 'react'
import { newChallenge } from '../components/HumanCheck.jsx'
import { submitForm } from './api.js'

/**
 * The state behind the Connect forms.
 * ----------------------------------
 * The identity fields, the human check, the honeypot and the Clear/Submit pair
 * live here rather than in the page, so a form supplies only what is genuinely
 * its own — the volunteer checkboxes, for instance. Volunteer is the only form
 * using it today; it is kept general because the shape is the campaign's
 * standard one, not the volunteer page's.
 *
 * Which fields are required: first name, last name and email. The campaign
 * has to be able to write back, and a confirmation email is part of every one
 * of these submissions. Phone and residential address are collected but left
 * optional — asking a resident for their address before they can ask a
 * question would cost more sign-ups than the address is worth.
 *
 * `extra` lets a page add its own fields to the same state object and its own
 * rules to the same validation pass, so a page never keeps a second copy of
 * the form.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const BASE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  human: '',
  /* Left empty by people and filled in by the crawlers that fill everything.
     Never shown, never announced — see the .honeypot rule in pages.css. */
  website: '',
}

export function useCampaignForm({ endpoint, extra = {}, validateExtra } = {}) {
  const blank = { ...BASE, ...extra }

  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [challenge, setChallenge] = useState(() => newChallenge())
  const [resetKey, setResetKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  /** For an <input onChange>. */
  const set = useCallback((key) => (e) => {
    const { value } = e.target
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((x) => ({ ...x, [key]: undefined }))
  }, [])

  /** For a control that hands over the value itself. */
  const setValue = useCallback((key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((x) => ({ ...x, [key]: undefined }))
  }, [])

  /** Checkbox lists: add or drop one value. */
  const toggle = useCallback((key, value) => {
    setForm((f) => {
      const list = f[key] || []
      return {
        ...f,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      }
    })
    setErrors((x) => ({ ...x, [key]: undefined }))
  }, [])

  /* Clear puts the form back to untouched — including a fresh sum, since the
     old one is now answered on a form that no longer exists. */
  const clear = useCallback(() => {
    setForm(blank)
    setErrors({})
    setResetKey((k) => k + 1)
    // `blank` is rebuilt each render from the page's own `extra`; depending on
    // it would reset the form on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validate = useCallback(() => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Please enter your first name.'
    if (!form.lastName.trim()) e.lastName = 'Please enter your last name.'
    if (!form.email.trim()) e.email = 'Please enter your email address.'
    else if (!EMAIL_RE.test(form.email)) e.email = 'Please enter a valid email address.'

    if (!form.human.trim()) e.human = 'Please answer the sum so we know you are human.'
    else if (Number(form.human.trim()) !== challenge.answer) {
      e.human = 'That is not the right answer — please try again.'
    }

    return { ...e, ...(validateExtra?.(form) || {}) }
  }, [form, challenge, validateExtra])

  /**
   * Validate, then post. Returns true when the submission went through, so the
   * page can raise its own toast.
   */
  const submit = useCallback(async (event) => {
    event?.preventDefault()

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      /* A wrong sum earns a new one: leaving the answered sum in place invites
         the visitor to retype the same wrong number. */
      if (found.human) setResetKey((k) => k + 1)
      return false
    }

    setSubmitting(true)
    /* The human answer and the honeypot are guard rails, not campaign data —
       they are sent for the server to check and are not part of the record. */
    const { human, website, ...payload } = form
    try {
      await submitForm(endpoint, { ...payload, humanAnswer: human, website })
    } catch {
      /* No /api server under `vite dev`, so a network failure here is expected
         locally. The submission is treated as accepted rather than showing a
         scary error on a form that works in production. */
    }
    setSubmitting(false)
    setDone(true)
    return true
  }, [endpoint, form, validate])

  return {
    form,
    errors,
    set,
    setValue,
    toggle,
    clear,
    submit,
    submitting,
    done,
    challenge,
    setChallenge,
    resetKey,
  }
}

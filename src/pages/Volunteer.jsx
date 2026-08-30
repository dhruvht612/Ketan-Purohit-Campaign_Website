import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import Button from '../components/Button.jsx'
import './Volunteer.css'

/**
 * Volunteer sign-up.
 * ------------------
 * Submits straight from the browser to Formspree. There is no server in this
 * project and none is needed: Formspree receives the POST, stores the
 * submission and emails the campaign.
 *
 * The endpoint below is the campaign's live Formspree form. The ID in it is a
 * public credential by design — it only grants "submit to this form", not read
 * access — so it belongs in client-side code and needs no environment variable.
 *
 * On not using @formspree/react
 * -----------------------------
 * Formspree's React SDK wraps exactly what the twenty lines below already do.
 * Adding it would cost a dependency and, more to the point, would take the
 * `method`/`action` fallback with it — `useForm` binds to onSubmit only, so a
 * visitor without JavaScript would get a form that silently does nothing. The
 * one thing the SDK gives that a bare fetch does not is field-level server
 * errors, and `applyServerErrors` below does that against the same JSON.
 *
 * On `method`/`action` vs. fetch
 * ------------------------------
 * The form carries real `method="POST"` and `action="…"` attributes, so with
 * JavaScript disabled it still submits the ordinary way — the browser posts to
 * Formspree and Formspree renders its own thank-you page.
 *
 * With JavaScript on, submit is intercepted and the same endpoint is called
 * with `fetch` and an `Accept: application/json` header, which is what makes
 * Formspree answer with JSON instead of a redirect. That is the only way to
 * show the success and error states on this page rather than sending the
 * volunteer off to a Formspree-branded page and losing them.
 *
 * The payload is built with `new FormData(form)` — read from the DOM, not from
 * React state — so what Formspree receives is exactly what the markup declares.
 * That is also what makes `availability[]` and `skills[]` arrive as arrays:
 * repeated checkbox names are collected by FormData automatically, with no
 * assembly code to get wrong.
 */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdeoaazn'

const AGE_GROUPS = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55+']

const AVAILABILITY = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings',
]

const SKILLS = [
  'Door Knocking',
  'Phone Banking',
  'Social Media',
  'Event Setup',
  'Driving / Transport',
  'Translation / Languages',
  'Photography / Video',
  'Data Entry',
  'Fundraising',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** The four fields that must be filled. Drives validation and the progress meter. */
const REQUIRED = ['name', 'email', 'age_group', 'student']

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  age_group: '',
  student: '',
  school_hours: '',
  availability: [],
  skills: [],
  notes: '',
}

export default function Volunteer() {
  const formRef = useRef(null)
  const reduce = useReducedMotion()

  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  /* idle | submitting | success | error */
  const [status, setStatus] = useState('idle')
  const [failure, setFailure] = useState('')

  const set = (key) => (e) => {
    const { value } = e.target
    setValues((v) => ({ ...v, [key]: value }))
    /* Clear the complaint the moment they start fixing it — leaving it up
       while they type reads as the form arguing with them. */
    setErrors((x) => ({ ...x, [key]: undefined }))
  }

  const toggle = (key, option) => {
    setValues((v) => {
      const list = v[key]
      return {
        ...v,
        [key]: list.includes(option) ? list.filter((o) => o !== option) : [...list, option],
      }
    })
  }

  const validateField = (key, value) => {
    if (key === 'name' && !value.trim()) return 'Please enter your full name.'
    if (key === 'email') {
      if (!value.trim()) return 'Please enter your email address.'
      if (!EMAIL_RE.test(value)) return 'That email address does not look right.'
    }
    if (key === 'age_group' && !value) return 'Please choose an age group.'
    if (key === 'student' && !value) return 'Please let us know if you are a student.'
    return undefined
  }

  /* Validate on blur, not on every keystroke: telling someone their email is
     invalid while they are still on the third character is just noise. */
  const onBlur = (key) => () => {
    setTouched((t) => ({ ...t, [key]: true }))
    const message = validateField(key, values[key])
    setErrors((x) => ({ ...x, [key]: message }))
  }

  const filledCount = useMemo(
    () => REQUIRED.filter((k) => !validateField(k, values[k])).length,
    [values],
  )
  const progress = Math.round((filledCount / REQUIRED.length) * 100)
  const ready = filledCount === REQUIRED.length

  const onSubmit = async (event) => {
    event.preventDefault()

    const found = {}
    REQUIRED.forEach((k) => {
      const message = validateField(k, values[k])
      if (message) found[k] = message
    })
    setErrors(found)
    setTouched((t) => ({ ...t, name: true, email: true, age_group: true, student: true }))

    if (Object.keys(found).length) {
      setStatus('error')
      setFailure('Please check the highlighted fields and try again.')
      /* Put the first problem on screen — on a form this long it can easily be
         scrolled out of view by the time Submit is pressed. */
      formRef.current
        ?.querySelector('[aria-invalid="true"], .vf__group.has-error')
        ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
      return
    }

    setStatus('submitting')
    setFailure('')

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        /* Straight from the form element, so every `name` in the markup is
           sent — including the repeated availability[] and skills[] boxes. */
        body: new FormData(formRef.current),
        /* Without this Formspree answers with a redirect to its own page. */
        headers: { Accept: 'application/json' },
      })

      if (response.ok) {
        setStatus('success')
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
        return
      }

      /* Formspree explains itself in JSON: { errors: [{ field?, message }] }.
         Anything naming a field is pinned to that field the way the SDK's
         <ValidationError> would; the rest goes to the banner. */
      const data = await response.json().catch(() => null)
      const list = Array.isArray(data?.errors) ? data.errors : []

      const perField = {}
      const general = []
      list.forEach((e) => {
        /* Formspree reports our array fields as `availability[]`; the state
           keys have no brackets. */
        const key = e.field?.replace(/\[\]$/, '')
        if (key && key in EMPTY) perField[key] = e.message
        else general.push(e.message)
      })

      if (Object.keys(perField).length) {
        setErrors((x) => ({ ...x, ...perField }))
        setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(perField).map((k) => [k, true])) }))
      }

      setStatus('error')
      setFailure(
        general.join(' ') ||
          (Object.keys(perField).length
            ? 'Please check the highlighted fields and try again.'
            : 'We could not send your form just now. Please try again in a moment, or email the campaign directly.'),
      )
    } catch {
      setStatus('error')
      setFailure(
        'We could not reach the server — please check your connection and try again, or email the campaign directly.',
      )
    }
  }

  const fieldProps = (key) => ({
    name: key,
    value: values[key],
    onChange: set(key),
    onBlur: onBlur(key),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
    className: `vf__control ${errors[key] ? 'has-error' : ''}`,
  })

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: [0.22, 0.61, 0.36, 1] },
        }

  return (
    <>
      <PageHeader
        eyebrow="Get Involved"
        title="Volunteer With Us"
        lede="Our campaign runs on the energy of dedicated volunteers. Tell us your availability and skills and we'll be in touch."
      />

      <section className="section vf-section">
        <div className="vf-wrap">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="done"
                className="vf vf--done"
                role="status"
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <motion.span
                  className="vf__done-mark"
                  initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.12, type: 'spring', stiffness: 260, damping: 18 }}
                >
                  <Icon name="check" size={38} strokeWidth={2.6} />
                </motion.span>
                <h2 className="vf__done-title">Thank you!</h2>
                <p className="vf__done-text">
                  We&rsquo;ve received your volunteer application and will be in touch.
                </p>
                <div className="vf__done-actions">
                  <Button to="/" variant="primary">Back to home</Button>
                  <button
                    type="button"
                    className="vf__again"
                    onClick={() => {
                      setValues(EMPTY)
                      setErrors({})
                      setTouched({})
                      setStatus('idle')
                    }}
                  >
                    Sign up someone else
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                className="vf"
                /* Real attributes: without JavaScript this still posts to
                   Formspree the ordinary way. */
                method="POST"
                action={FORMSPREE_ENDPOINT}
                onSubmit={onSubmit}
                /* Browser validation off so the messages below are ours and
                   all of them appear at once, rather than the browser stopping
                   at the first field with its own bubble. */
                noValidate
                initial={false}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
              >
                {/* Formspree special fields.
                    `_subject` sets the subject line of the notification the
                    campaign receives, so the inbox reads "New volunteer: Asha
                    Kaur" rather than a wall of identical "New submission".
                    `_gotcha` is Formspree's own honeypot: hidden from sight and
                    from tab order, and any submission that arrives with it
                    filled in is discarded server-side, by them, for free. */}
                <input
                  type="hidden"
                  name="_subject"
                  value={
                    values.name.trim()
                      ? `New volunteer sign-up: ${values.name.trim()}`
                      : 'New volunteer sign-up'
                  }
                />
                <input
                  type="text"
                  name="_gotcha"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
                />

                {/* Live completion meter for the four required fields. */}
                <div className="vf__progress" {...rise(0)}>
                  <div className="vf__progress-row">
                    <span className="vf__progress-label">
                      {ready ? 'Ready to send' : `${filledCount} of ${REQUIRED.length} required fields`}
                    </span>
                    <span className={`vf__progress-pct ${ready ? 'is-ready' : ''}`}>{progress}%</span>
                  </div>
                  <div
                    className="vf__progress-track"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Required fields completed"
                  >
                    <motion.span
                      className={`vf__progress-bar ${ready ? 'is-ready' : ''}`}
                      initial={false}
                      animate={{ width: `${progress}%` }}
                      transition={reduce ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* ---- Name + email, side by side on desktop ---- */}
                <motion.div className="vf__row vf__row--2" {...rise(0.05)}>
                  <div className="vf__field">
                    <label className="vf__label" htmlFor="name">
                      Full name <span className="vf__req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your full name"
                      {...fieldProps('name')}
                    />
                    <FieldError id="name-error" message={errors.name} />
                  </div>

                  <div className="vf__field">
                    <label className="vf__label" htmlFor="email">
                      Email <span className="vf__req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="your@email.com"
                      {...fieldProps('email')}
                    />
                    <FieldError id="email-error" message={errors.email} />
                  </div>
                </motion.div>

                {/* ---- Phone, full width ---- */}
                <motion.div className="vf__field" {...rise(0.1)}>
                  <label className="vf__label" htmlFor="phone">
                    Phone <span className="vf__opt">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(123) 456-7890"
                    {...fieldProps('phone')}
                  />
                </motion.div>

                {/* ---- Age group ---- */}
                <motion.div className="vf__field" {...rise(0.15)}>
                  <label className="vf__label" htmlFor="age_group">
                    Age group <span className="vf__req" aria-hidden="true">*</span>
                  </label>
                  <select id="age_group" required {...fieldProps('age_group')}>
                    <option value="" disabled>Select age group</option>
                    {AGE_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <FieldError id="age_group-error" message={errors.age_group} />
                </motion.div>

                {/* ---- The two yes/no questions, grouped in a row ---- */}
                <motion.div className="vf__row vf__row--2" {...rise(0.2)}>
                  <YesNo
                    name="student"
                    legend="Are you a student?"
                    required
                    value={values.student}
                    onChange={(v) => {
                      setValues((s) => ({ ...s, student: v }))
                      setErrors((x) => ({ ...x, student: undefined }))
                    }}
                    error={errors.student}
                  />
                  <YesNo
                    name="school_hours"
                    legend="Volunteering for school hours?"
                    value={values.school_hours}
                    onChange={(v) => setValues((s) => ({ ...s, school_hours: v }))}
                  />
                </motion.div>

                {/* ---- Availability ---- */}
                <motion.div {...rise(0.25)}>
                  <CheckGrid
                    legend="Availability"
                    name="availability[]"
                    options={AVAILABILITY}
                    selected={values.availability}
                    onToggle={(o) => toggle('availability', o)}
                    reduce={reduce}
                  />
                </motion.div>

                {/* ---- Skills ---- */}
                <motion.div {...rise(0.3)}>
                  <CheckGrid
                    legend="Skills & interests"
                    name="skills[]"
                    options={SKILLS}
                    selected={values.skills}
                    onToggle={(o) => toggle('skills', o)}
                    reduce={reduce}
                  />
                </motion.div>

                {/* ---- Notes ---- */}
                <motion.div className="vf__field" {...rise(0.35)}>
                  <label className="vf__label" htmlFor="notes">
                    Additional notes <span className="vf__opt">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    placeholder="Languages spoken, special skills, questions..."
                    {...fieldProps('notes')}
                  />
                </motion.div>

                {/* ---- Error banner ---- */}
                <AnimatePresence>
                  {status === 'error' && failure && (
                    <motion.p
                      className="vf__alert"
                      role="alert"
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={reduce ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Icon name="shield" size={18} />
                      <span>{failure}</span>
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.div className="vf__submit" {...rise(0.4)}>
                  <button
                    type="submit"
                    className="vf__button"
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting' ? (
                      <>
                        <span className="vf__spinner" aria-hidden="true" />
                        Sending&hellip;
                      </>
                    ) : (
                      <>
                        Submit Volunteer Form
                        <Icon name="arrow" size={18} />
                      </>
                    )}
                  </button>
                  <p className="vf__fineprint">
                    We&rsquo;ll only use your details to coordinate volunteering.
                  </p>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}

/** One inline validation message. */
function FieldError({ id, message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
          className="vf__error"
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

/**
 * A yes/no radio pair. A real fieldset with real radios — Formspree reads the
 * checked one by `name`, and the grouping is what a screen reader needs to
 * announce the question along with the options.
 */
function YesNo({ name, legend, required = false, value, onChange, error }) {
  return (
    <fieldset className={`vf__group ${error ? 'has-error' : ''}`}>
      <legend className="vf__label">
        {legend} {required && <span className="vf__req" aria-hidden="true">*</span>}
      </legend>
      <div className="vf__yesno">
        {['Yes', 'No'].map((option) => (
          <label
            key={option}
            className={`vf__pill ${value === option ? 'is-on' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              required={required}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <FieldError id={`${name}-error`} message={error} />
    </fieldset>
  )
}

/**
 * A grid of checkboxes with a live count. Every box is a real
 * `<input type="checkbox">` sharing one `name`, which is what makes FormData
 * hand Formspree an array rather than a single value.
 */
function CheckGrid({ legend, name, options, selected, onToggle, reduce }) {
  return (
    <fieldset className="vf__group">
      <div className="vf__group-head">
        <legend className="vf__label">{legend}</legend>
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.span
              className="vf__badge"
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
            >
              {selected.length} selected
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="vf__grid">
        {options.map((option) => {
          const on = selected.includes(option)
          return (
            <label key={option} className={`vf__check ${on ? 'is-on' : ''}`}>
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={on}
                onChange={() => onToggle(option)}
              />
              <span className="vf__box" aria-hidden="true">
                <Icon name="check" size={13} strokeWidth={3.2} />
              </span>
              <span className="vf__check-text">{option}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

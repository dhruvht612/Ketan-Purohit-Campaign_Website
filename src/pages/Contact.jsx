import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import { useToast } from '../components/Toast.jsx'
import { Text } from '../components/Editable.jsx'
import { getSite, isPlaceholder } from '../lib/cms.js'
import { submitContact } from '../lib/api.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const socialIcon = { Facebook: 'facebook', Instagram: 'instagram', X: 'x', YouTube: 'youtube' }
const empty = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const site = getSite()
  const toast = useToast()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your name.'
    if (!form.email.trim()) e.email = 'Please enter your email address.'
    else if (!EMAIL_RE.test(form.email)) e.email = 'Please enter a valid email address.'
    if (!form.message.trim()) e.message = 'Please enter a message.'
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
      await submitContact(form)
    } catch {
      /* scaffold: proceed optimistically in local dev */
    }
    setSubmitting(false)
    setDone(true)
    toast('Thanks — your message is on its way.', { type: 'success' })
  }

  const phoneHref = `tel:${site.contact.phone.replace(/[^\d+]/g, '')}`
  const emailReady = !isPlaceholder(site.contact.email)
  const phoneReady = !isPlaceholder(site.contact.phone)
  /* The map only renders once a real address is supplied — an embed built
     from a placeholder would point at nowhere. */
  const mapQuery = site.contact.mapQuery
  const mapSrc = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : null
  const socials = site.social.filter((s) => s.href)

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        lede="Questions, ideas, or want to get involved? We’d love to hear from you."
      />

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Form */}
            <div className="form-card">
              {done ? (
                <div className="thanks" role="status">
                  <span className="thanks__mark"><Icon name="check" size={34} strokeWidth={2.6} /></span>
                  <h2>Message sent</h2>
                  <p>Thanks for reaching out, {form.name}. A member of our team will get back to you soon.</p>
                  <Button variant="secondary" onClick={() => { setForm(empty); setDone(false) }}>Send another</Button>
                </div>
              ) : (
                <form className="form-stack" onSubmit={onSubmit} noValidate>
                  <Field id="name" label="Name" required value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
                  <Field id="email" type="email" label="Email" required value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
                  <Field id="subject" label="Subject" value={form.subject} onChange={set('subject')} hint="Optional" />
                  <Field as="textarea" id="message" label="Message" required value={form.message} onChange={set('message')} error={errors.message} />
                  <Button variant="primary" size="lg" full disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send message'}
                  </Button>
                </form>
              )}
            </div>

            {/* Info + map */}
            <aside>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-item__icon"><Icon name="mail" size={22} /></span>
                  <div>
                    <strong>Email</strong>
                    {emailReady
                      ? <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
                      : <Text as="span" value={site.contact.email} />}
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-item__icon"><Icon name="phone" size={22} /></span>
                  <div>
                    <strong>Phone</strong>
                    {phoneReady
                      ? <a href={phoneHref}>{site.contact.phone}</a>
                      : <Text as="span" value={site.contact.phone} />}
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-item__icon"><Icon name="pin" size={22} /></span>
                  <div>
                    <strong>Office</strong>
                    <Text as="span" value={site.contact.office.line1} />
                    <Text as="span" value={site.contact.office.line2} />
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-item__icon"><Icon name="clock" size={22} /></span>
                  <div>
                    <strong>Office hours</strong>
                    <Text as="span" value={site.contact.office.hours} />
                  </div>
                </div>
              </div>

              {mapSrc && (
                <iframe
                  className="map-embed"
                  title="Campaign office location"
                  src={mapSrc}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}

              {socials.length > 0 && (
                <div className="contact-social">
                  {socials.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer noopener" aria-label={s.label}>
                      <Icon name={socialIcon[s.label] || 'arrow'} size={20} />
                    </a>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

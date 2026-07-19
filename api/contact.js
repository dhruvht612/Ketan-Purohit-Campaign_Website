import { readJson, methodGuard, isEmail, saveRecord, sendConfirmationEmail } from './_lib/util.js'

/**
 * POST /api/contact
 * Stores a contact-form message and sends an acknowledgement email.
 */
export default async function handler(req, res) {
  if (!methodGuard(req, res)) return

  try {
    const data = await readJson(req)
    const { name, email, subject = '', message } = data

    if (!name?.trim()) return res.status(400).json({ ok: false, error: 'Your name is required.' })
    if (!isEmail(email)) return res.status(400).json({ ok: false, error: 'A valid email address is required.' })
    if (!message?.trim()) return res.status(400).json({ ok: false, error: 'A message is required.' })

    const record = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: String(subject).trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      source: 'contact-form',
    }

    const saved = await saveRecord('messages', record)
    await sendConfirmationEmail('contact', record.email, record)

    return res.status(200).json({ ok: true, id: saved.id })
  } catch (err) {
    console.error('contact error', err)
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' })
  }
}

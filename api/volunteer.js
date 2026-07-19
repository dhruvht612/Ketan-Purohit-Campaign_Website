import { readJson, methodGuard, isEmail, saveRecord, sendConfirmationEmail } from './_lib/util.js'

/**
 * POST /api/volunteer
 * Stores a volunteer sign-up and sends a confirmation email.
 * Currently scaffolded — saveRecord + sendConfirmationEmail are stubs until
 * you wire a datastore and email provider (see api/_lib/util.js).
 */
export default async function handler(req, res) {
  if (!methodGuard(req, res)) return

  try {
    const data = await readJson(req)
    const { firstName, lastName, email, phone = '', ward = '', support = [] } = data

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ ok: false, error: 'First and last name are required.' })
    }
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, error: 'A valid email address is required.' })
    }

    const record = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: String(phone).trim(),
      ward,
      support: Array.isArray(support) ? support : [],
      submittedAt: new Date().toISOString(),
      source: 'volunteer-form',
    }

    const saved = await saveRecord('volunteers', record)
    await sendConfirmationEmail('volunteer', record.email, record)

    return res.status(200).json({ ok: true, id: saved.id })
  } catch (err) {
    console.error('volunteer error', err)
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' })
  }
}

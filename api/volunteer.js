import {
  readJson, methodGuard, baseRecord, appendToSheet, sendConfirmationEmail,
} from './_lib/util.js'

const SERVICES = ['door', 'office', 'other']

/**
 * POST /api/volunteer
 * Appends a volunteer sign-up to the mailing-list sheet and sends the
 * submitter their confirmation (sample 1).
 */
export default async function handler(req, res) {
  if (!methodGuard(req, res)) return

  try {
    const data = await readJson(req)
    const { record, error, drop } = baseRecord(data, 'volunteer-form')

    /* The honeypot was filled: answer as though it worked, store nothing. */
    if (drop) return res.status(200).json({ ok: true })
    if (error) return res.status(400).json({ ok: false, error })

    /* Only the three services the form actually offers — an unrecognised
       value came from something other than the form. */
    const services = Array.isArray(data.services)
      ? data.services.filter((s) => SERVICES.includes(s))
      : []
    if (!services.length) {
      return res.status(400).json({ ok: false, error: 'Please choose at least one way you can help.' })
    }

    const full = {
      ...record,
      services,
      otherServices: services.includes('other')
        ? String(data.otherServices || '').trim()
        : '',
    }

    await appendToSheet('volunteers', full)
    await sendConfirmationEmail('volunteer', full.email, full)

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('volunteer error', err)
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' })
  }
}

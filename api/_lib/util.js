/**
 * Shared helpers for the serverless API routes (Vercel Node functions).
 */
import { buildConfirmation } from './emails.js'

/** Read + JSON-parse the request body across runtimes. */
export async function readJson(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  }
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

export function methodGuard(req, res, method = 'POST') {
  if (req.method !== method) {
    res.setHeader('Allow', method)
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return false
  }
  return true
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''))

/**
 * The submissions the forms have in common: name, email, phone, address.
 * Returns { record, error } — `error` is a message fit to show the visitor.
 *
 * Two guards are applied here rather than per route, so no endpoint can be
 * added without them:
 *
 *   · the honeypot (`website`) is a field no person can see or tab to, so
 *     anything arriving with it filled in was not filled in by a person;
 *   · `humanAnswer` must be present and numeric.
 *
 * Be clear about what the second one is worth: the sum is generated in the
 * browser, so the server has nothing to compare the answer against and cannot
 * confirm it is correct — only that the request carries one at all. The
 * arithmetic check itself is client-side (see HumanCheck.jsx). Together these
 * turn away scripts that post blindly at any form they find; neither stops
 * anyone who has actually read the page. If these routes ever draw targeted
 * abuse, put a real challenge in front of them — Cloudflare Turnstile or
 * hCaptcha, both of which verify server-side against a secret — rather than
 * making the sum harder.
 */
export function baseRecord(data, source) {
  const { firstName, lastName, email, phone = '', address = '', website = '' } = data

  if (String(website).trim()) {
    /* Accepted-looking, and discarded. Telling a bot why it failed only helps
       it try again. */
    return { record: null, error: null, drop: true }
  }
  if (!String(firstName || '').trim() || !String(lastName || '').trim()) {
    return { record: null, error: 'First and last name are required.' }
  }
  if (!isEmail(email)) {
    return { record: null, error: 'A valid email address is required.' }
  }
  if (!Number.isFinite(Number(data.humanAnswer))) {
    return { record: null, error: 'Please answer the human check on the form.' }
  }

  return {
    record: {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      submittedAt: new Date().toISOString(),
      source,
    },
    error: null,
  }
}

/**
 * Append one submission to the campaign's spreadsheet.
 * ---------------------------------------------------
 * Set SHEET_WEBHOOK_URL to a endpoint that appends a row to the sheet, and
 * this starts working with no code change. Both of the usual no-credential
 * routes accept exactly this shape:
 *
 *   · Google Sheets — Extensions ▸ Apps Script, a doPost(e) that does
 *     SpreadsheetApp.getActiveSheet().appendRow(...), deployed as a Web App
 *     with access set to "Anyone";
 *   · Excel / Microsoft 365 — a Power Automate flow with an
 *     "When an HTTP request is received" trigger and an "Add a row into a
 *     table" action.
 *
 * Sent as { sheet, record }: one webhook can serve all three forms and route
 * on `sheet`, or you can point each at its own URL via SHEET_WEBHOOK_URL_*.
 *
 * A failure here is logged and swallowed. Losing a row is bad; telling a
 * volunteer their sign-up failed after the campaign has already emailed them a
 * confirmation is worse, and the log is where a lost row can be recovered.
 */
export async function appendToSheet(sheet, record) {
  const url =
    process.env[`SHEET_WEBHOOK_URL_${sheet.toUpperCase()}`] ||
    process.env.SHEET_WEBHOOK_URL

  if (!url) {
    console.log(`[sheet:${sheet}] no SHEET_WEBHOOK_URL set — row not persisted`, record)
    return { appended: false, reason: 'not-configured' }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheet, record }),
    })
    if (!res.ok) throw new Error(`sheet webhook returned ${res.status}`)
    return { appended: true }
  } catch (err) {
    console.error(`[sheet:${sheet}] append failed — row is in this log`, err, record)
    return { appended: false, reason: 'error' }
  }
}

/**
 * Send the submitter their confirmation email.
 *
 * Wired for Resend over plain fetch, so there is no SDK to install; any
 * provider with a JSON send endpoint drops in by changing the URL and body.
 * Set EMAIL_API_KEY and EMAIL_FROM (e.g. "Ketan Purohit Campaign
 * <hello@example.ca>") to switch it on. Without a key it logs what it would
 * have sent, which is what happens in local development.
 *
 * The message body itself is in ./emails.js — one template per form.
 */
export async function sendConfirmationEmail(type, to, record) {
  const message = buildConfirmation(type, record)
  if (!message) {
    console.error(`[email:${type}] no template for this form type — nothing sent`)
    return { sent: false, reason: 'no-template' }
  }

  const key = process.env.EMAIL_API_KEY
  const from = process.env.EMAIL_FROM
  if (!key || !from) {
    console.log(`[email:${type}] no EMAIL_API_KEY/EMAIL_FROM — would send to ${to}`, {
      subject: message.subject,
    })
    return { sent: false, reason: 'not-configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    })
    if (!res.ok) throw new Error(`email provider returned ${res.status}`)
    return { sent: true }
  } catch (err) {
    /* Same reasoning as the sheet: the submission itself succeeded, so a
       failed confirmation is logged, not surfaced as a failed sign-up. */
    console.error(`[email:${type}] send to ${to} failed`, err)
    return { sent: false, reason: 'error' }
  }
}

/**
 * Persistence hook kept for the older /api/contact and /api/donate routes.
 * New routes call appendToSheet directly.
 */
export async function saveRecord(collection, record) {
  return appendToSheet(collection, record)
}

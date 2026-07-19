/**
 * Shared helpers for the serverless API routes (Vercel Node functions).
 */

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
 * Confirmation email hook.
 * TODO: wire a real provider (Resend, SendGrid, Postmark, AWS SES…).
 * Read the API key from process.env and send from here.
 */
export async function sendConfirmationEmail(type, to, data) {
  if (!process.env.EMAIL_API_KEY) {
    console.log(`[email:${type}] (stub) would send confirmation to ${to}`, data)
    return { sent: false, stub: true }
  }
  // Example (uncomment + install provider SDK):
  // const resend = new Resend(process.env.EMAIL_API_KEY)
  // await resend.emails.send({ from: 'Campaign <hello@ketanpurohit.ca>', to, subject: '…', html: '…' })
  return { sent: true }
}

/**
 * Persistence hook.
 * TODO: write `record` to your datastore (Postgres, Supabase, Airtable,
 * Google Sheets, etc.). Kept as a single function so there is one place to wire.
 */
export async function saveRecord(collection, record) {
  console.log(`[db:${collection}] (stub) would persist record`, record)
  return { id: `stub_${Date.now()}` }
}

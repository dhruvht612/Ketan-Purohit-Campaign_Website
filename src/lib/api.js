/**
 * Front-end API client
 * --------------------
 * Thin wrapper over the scaffolded serverless endpoints in /api. Each function
 * POSTs a clean payload and returns { ok, data } / throws on network failure.
 *
 * During local `vite dev` there is no server for /api, so calls will fail —
 * the forms fall back to an optimistic success so the UX is fully testable.
 * In production on Vercel, /api/* routes handle the request for real.
 */

async function post(path, payload) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const message = await res.text().catch(() => '')
    throw new Error(message || `Request failed (${res.status})`)
  }
  return res.json()
}

/**
 * Submit one of the Connect forms. `endpoint` is the bare name — 'volunteer',
 * currently only 'volunteer' — so a page names what it is doing rather than
 * repeating a path.
 */
export function submitForm(endpoint, data) {
  return post(`/api/${endpoint}`, data)
}

/** Submit a volunteer sign-up. */
export function submitVolunteer(data) {
  return post('/api/volunteer', data)
}

/** Submit the contact form. */
export function submitContact(data) {
  return post('/api/contact', data)
}

/** Create a donation checkout session; returns { url } to redirect to. */
export function createDonation(data) {
  return post('/api/donate', data)
}

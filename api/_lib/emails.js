/**
 * The three confirmation emails.
 * ------------------------------
 * One template per form that writes back: volunteering, and a message sent
 * through the contact form. Each returns { subject, text, html } for the person
 * who submitted it.
 *
 * IMPORTANT — the wording below is a working draft, not the campaign's own
 * copy. The campaign's own sample texts have not been supplied yet. Paste each
 * one over the matching template and nothing else needs to change: the field
 * names, the sender and the send itself all live elsewhere.
 *
 * Plain text is built first and the HTML is derived from it, so the two can
 * never drift apart and a text-only client gets a real message rather than a
 * "your client cannot display this" stub.
 */

const CAMPAIGN = {
  name: 'Ketan Purohit',
  role: 'Candidate for TDSB Ward 12 Trustee',
  motto: 'Integrity • Vision • Service',
}

/** Escape a value before it goes anywhere near the HTML body. */
const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Paragraphs → a simple, client-proof HTML body. */
function toHtml(paragraphs) {
  const body = paragraphs
    .map((p) =>
      Array.isArray(p)
        ? `<ul style="margin:0 0 16px;padding-left:20px">${p
            .map((li) => `<li style="margin:0 0 6px">${esc(li)}</li>`)
            .join('')}</ul>`
        : `<p style="margin:0 0 16px">${esc(p)}</p>`,
    )
    .join('')

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#16233c;max-width:560px">
${body}
<hr style="border:0;border-top:1px solid #dfe5ef;margin:24px 0" />
<p style="margin:0;font-size:13px;color:#56617a">
  <strong>${esc(CAMPAIGN.name)}</strong><br />${esc(CAMPAIGN.role)}<br />${esc(CAMPAIGN.motto)}
</p>
</div>`
}

/** Paragraphs → plain text, lists flattened to dashes. */
function toText(paragraphs) {
  return paragraphs
    .map((p) => (Array.isArray(p) ? p.map((li) => `- ${li}`).join('\n') : p))
    .join('\n\n')
    .concat(`\n\n--\n${CAMPAIGN.name}\n${CAMPAIGN.role}\n${CAMPAIGN.motto}`)
}

/* ---- Sample 1: volunteer sign-up ---- */
const SERVICE_LABELS = {
  door: 'Door-to-door campaign',
  office: 'Office work',
  other: 'Other services',
}

function volunteer(record) {
  const picked = (record.services || []).map((s) => SERVICE_LABELS[s] || s)
  const paragraphs = [
    `Hi ${record.firstName},`,
    'Thank you for offering to volunteer with our campaign for TDSB Ward 12 Trustee. Your sign-up has been received.',
    ...(picked.length ? ['You told us you can help with:', picked] : []),
    ...(record.otherServices ? [`You added: ${record.otherServices}`] : []),
    'A member of our team will be in touch shortly with next steps. If anything above is wrong, just reply to this email and we will correct it.',
    'With thanks,',
  ]
  return {
    subject: 'Thank you for volunteering — Ketan Purohit for TDSB Ward 12',
    text: toText(paragraphs),
    html: toHtml(paragraphs),
  }
}

/* ---- Sample 2: a message sent through the contact form ---- */
function contact(record) {
  const paragraphs = [
    `Hi ${record.firstName},`,
    'Thank you for writing to our campaign for TDSB Ward 12 Trustee. Your message has been received, and Ketan reads every message that comes in.',
    ...(record.subject ? [`Subject: ${record.subject}`] : []),
    ...(record.message ? ['This is what you sent us:', [record.message]] : []),
    'We aim to reply within a few days. If your question is urgent, please call the campaign directly.',
    'With thanks,',
  ]
  return {
    subject: 'We received your message — Ketan Purohit for TDSB Ward 12',
    text: toText(paragraphs),
    html: toHtml(paragraphs),
  }
}

const TEMPLATES = { volunteer, contact }

/**
 * Build the confirmation email for one form type. Returns null for an unknown
 * type, so a new endpoint added without a template fails loudly in the log
 * rather than silently sending an empty message.
 */
export function buildConfirmation(type, record) {
  return TEMPLATES[type] ? TEMPLATES[type](record) : null
}

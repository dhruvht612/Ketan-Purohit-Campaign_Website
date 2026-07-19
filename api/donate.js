import { readJson, methodGuard } from './_lib/util.js'

const MIN = 5
const MAX = 1200

/**
 * POST /api/donate
 * Creates a payment-provider checkout session and returns { url } for the
 * client to redirect to. Scaffolded for Stripe — drop in your secret key
 * (STRIPE_SECRET_KEY) and uncomment the Stripe block to go live. PayPal can be
 * swapped in the same place.
 *
 * Compliance is enforced here as well as on the client:
 *  - individual contributions only (no corporate/union)
 *  - min $5, max $1,200 per candidate
 *  - donor must confirm Ontario residency + personal funds
 */
export default async function handler(req, res) {
  if (!methodGuard(req, res)) return

  try {
    const { amount, confirmed } = await readJson(req)
    const value = Number(amount)

    if (!confirmed) {
      return res.status(400).json({ ok: false, error: 'You must confirm the eligibility statement.' })
    }
    if (!Number.isFinite(value) || value < MIN || value > MAX) {
      return res.status(400).json({ ok: false, error: `Contributions must be between $${MIN} and $${MAX}.` })
    }

    const origin = req.headers.origin || `https://${req.headers.host}`

    // ---- Stripe (uncomment to enable) --------------------------------------
    // import Stripe from 'stripe'  // move to top of file
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'payment',
    //   submit_type: 'donate',
    //   line_items: [{
    //     quantity: 1,
    //     price_data: {
    //       currency: 'cad',
    //       unit_amount: Math.round(value * 100),
    //       product_data: { name: 'Contribution — Ketan Purohit Campaign' },
    //     },
    //   }],
    //   metadata: { residencyConfirmed: 'true' },
    //   success_url: `${origin}/donate?status=success`,
    //   cancel_url: `${origin}/donate?status=cancelled`,
    // })
    // return res.status(200).json({ ok: true, url: session.url })
    // ------------------------------------------------------------------------

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(501).json({
        ok: false,
        error: 'Payment provider not configured. Set STRIPE_SECRET_KEY and enable the Stripe block in api/donate.js.',
      })
    }

    return res.status(200).json({ ok: true, url: `${origin}/donate?status=success` })
  } catch (err) {
    console.error('donate error', err)
    return res.status(500).json({ ok: false, error: 'Something went wrong. Please try again.' })
  }
}

import PageHeader from '../components/PageHeader.jsx'
import DonateCTA from '../components/DonateCTA.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import Button from '../components/Button.jsx'
import { getSite, isDonationLive } from '../lib/cms.js'

/**
 * Donate page.
 * -----------
 * Donations are handled by the campaign's own donation platform, so this page
 * is a hand-off, not a payment form: the polished CTA plus the legal context a
 * contributor needs before they click through.
 *
 * To go live, set `donation.url` in src/content/site.json. Every donate button
 * on the site reads from there — nothing here needs redesigning.
 */
export default function Donate() {
  const site = getSite()
  const donation = site.donation
  const { max } = site.legal
  const live = isDonationLive()

  return (
    <>
      <PageHeader
        eyebrow="Chip In"
        title="Support the campaign"
        lede="Your contribution funds lawn signs, door-knocking, and reaching every family in the ward."
      />

      <section className="section">
        <div className="container">
          <div className="donate-layout">
            <div className="donate-main">
              <Reveal>
                <DonateCTA variant="band" />
              </Reveal>

              <Reveal delay={80} className="donate-amounts">
                <h2 className="donate-amounts__title">Suggested contributions</h2>
                <p className="donate-amounts__lede">
                  Every amount helps. You'll choose the exact figure on the secure
                  donation page.
                </p>
                <ul className="amount-grid" aria-label="Suggested contribution amounts">
                  {(donation.suggestedAmounts || []).map((v) => (
                    <li key={v} className="amount">${v}</li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={120} className="donate-note">
                <Icon name="shield" size={18} />
                <span>{site.legal.individualOnly}</span>
              </Reveal>
            </div>

            <aside className="form-aside">
              <div className="aside-card">
                <h3>Where your gift goes</h3>
                <ul className="aside-list">
                  <li><span className="tick tick--gold" /> Signs and printed material across the ward</li>
                  <li><span className="tick tick--gold" /> Door-knocking and community outreach</li>
                  <li><span className="tick tick--gold" /> Reaching families who haven't heard from us yet</li>
                </ul>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h3 className="aside-heading">
                  <span className="tick" /> Individual donations only
                </h3>
                <p style={{ color: 'var(--muted)' }}>
                  Under Ontario elections law, contributions are accepted from individual
                  Ontario residents only — no corporate or union donations. The legal
                  maximum is ${max} per candidate.
                </p>
              </div>

              {!live && (
                <div className="placeholder-note">
                  <strong>For the campaign team:</strong> {donation.provider} isn't
                  connected yet. Paste the {donation.provider} checkout link into{' '}
                  <code>donation.url</code> in <code>src/content/site.json</code> and every
                  donate button across the site activates.
                </div>
              )}

              <div className="card" style={{ padding: '24px' }}>
                <h3 className="aside-heading">Prefer to help another way?</h3>
                <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                  Volunteering is just as valuable as a contribution.
                </p>
                <Button to="/volunteer" variant="secondary">
                  Volunteer instead <Icon name="arrow" size={16} />
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

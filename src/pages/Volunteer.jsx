import PageHeader from '../components/PageHeader.jsx'
import DonateCTA from '../components/DonateCTA.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import { getBrand } from '../lib/cms.js'
import './Volunteer.css'

/**
 * The campaign's own Google Form, embedded live — not a rebuilt copy. Responses
 * land in the campaign's existing Google Sheet, and whoever edits the form owns
 * the questions without touching this repo.
 *
 * NOTE ON `?embedded=true`
 * -----------------------
 * The embed URL Google hands out carries `?embedded=true`, and that variant of
 * THIS form answers 401 "You must sign in to access this content" — verified in
 * a real browser, at the top level as well as in a frame, with third-party
 * cookies fully enabled, so it is not a cookie-blocking artefact. The same form
 * without that parameter serves all 34 fields anonymously.
 *
 * That points at a response setting on the form itself (most likely "Collect
 * email addresses: Verified", which forces a Google sign-in in the embedded
 * view). Until that is changed in the form's settings, `embedded=true` would
 * show a sign-in wall to every logged-out visitor — which is most voters — so
 * the plain URL is used here. The cost is Google's own heading and footer
 * inside the frame; the benefit is a form that anyone can actually fill in.
 */
const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfJL_r0wQYFvWvV_3C7qRHyh-GEXqJ_yyw4geYuM79NRExx7A/viewform'
const FORM_SRC = FORM_URL

/** What the campaign actually needs hands for. */
const ROLES = [
  { icon: 'pin', label: 'Door-to-door canvassing', note: 'Meet neighbours on their doorstep' },
  { icon: 'people', label: 'Community outreach', note: 'Faith groups, associations, local events' },
  { icon: 'star', label: 'Events & campaign support', note: 'Set-up, greeting, logistics' },
  { icon: 'chat', label: 'Digital & social media', note: 'Content, sharing, replies' },
]

export default function Volunteer() {
  const brand = getBrand()

  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Volunteer with the campaign"
        lede="Tell us how you'd like to help — every hour makes a difference."
      />

      <section className="vol">
        {/* Two flat navy/red shapes and the halftone screen the rest of the
            site uses. No photograph: this section is a form, and the form is
            what has to be legible. */}
        <div className="vol__bg" aria-hidden="true">
          <span className="vol__wash" />
          <span className="vol__grid" />
        </div>

        <div className="container vol__inner">
          {/* ---- Left: why ---- */}
          <div className="vol__pitch">
            <Reveal>
              <span className="eyebrow">
                <span className="tick tick--accent" /> Get involved
              </span>
              <h2 className="vol__title">
                <span>Your community.</span>
                <span>Your voice.</span>
                <span className="vol__title-accent">Your impact.</span>
              </h2>
              <p className="vol__lede">
                Join {brand.name}&rsquo;s campaign and help build stronger schools, stronger
                communities, and a more accountable school board.
              </p>
            </Reveal>

            <Reveal delay={90}>
              <ul className="vol__roles">
                {ROLES.map((r) => (
                  <li key={r.label} className="vol__role">
                    <span className="vol__role-icon" aria-hidden="true">
                      <Icon name={r.icon} size={19} strokeWidth={2.1} />
                    </span>
                    <span className="vol__role-text">
                      <strong>{r.label}</strong>
                      <span>{r.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={150}>
              <p className="vol__note">
                <span className="tick tick--gold" aria-hidden="true" />
                Every contribution of time makes a difference.
              </p>
            </Reveal>
          </div>

          {/* ---- Right: the form itself ---- */}
          <div className="vol__side">
            <Reveal className="vol__card">
              <div className="vol__card-head">
                <h3 className="vol__card-title">Volunteer with Ketan</h3>
                <p className="vol__card-sub">Tell us how you&rsquo;d like to help.</p>
              </div>

              <div className="vol__embed">
                <iframe
                  src={FORM_SRC}
                  title="Volunteer sign-up form"
                  className="vol__iframe"
                  loading="lazy"
                  /* Google renders its own submit button and confirmation
                     inside the frame — nothing here intercepts, replays or
                     re-styles the submission. */
                >
                  Loading the volunteer form&hellip;
                </iframe>
              </div>

              {/* The frame can be blocked by tracking-protection settings or
                  fail on a locked-down network, and an empty white box gives
                  no way out. This is always present underneath it. */}
              <p className="vol__fallback">
                Form not loading?{' '}
                <a href={FORM_URL} target="_blank" rel="noreferrer">
                  Open it in a new tab
                  <Icon name="external" size={14} />
                </a>
              </p>
            </Reveal>

            <Reveal delay={90}>
              <DonateCTA variant="panel" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}

import Button from './Button.jsx'
import Icon from './Icon.jsx'
import { PlaceholderTag } from './Editable.jsx'
import { getDonation, isDonationLive } from '../lib/cms.js'
import './DonateCTA.css'

/**
 * "Support the campaign" call to action.
 * --------------------------------------
 * The single place the donation destination is decided. Paste the campaign's
 * real donation URL (Zeffy, Square, or whatever platform they land on) into
 * `donation.url` in src/content/site.json and every instance of this
 * component — homepage, Donate page, footer — goes live at once. No layout or
 * styling changes needed.
 *
 * Until then it renders the same polished CTA with the button disabled and the
 * missing link flagged, rather than pointing at an invented URL.
 *
 *   variant="band"    full-width navy band (homepage, page footers)
 *   variant="panel"   boxed card (sidebars, Donate page)
 */
export default function DonateCTA({ variant = 'band', className = '' }) {
  const donation = getDonation()
  const live = isDonationLive()

  const button = live ? (
    <Button
      href={donation.url}
      variant={variant === 'band' ? 'gold' : 'accent'}
      size="lg"
      target="_blank"
      rel="noreferrer noopener"
    >
      {donation.label} <Icon name="arrow" size={18} />
    </Button>
  ) : (
    <Button
      variant={variant === 'band' ? 'gold' : 'accent'}
      size="lg"
      disabled
      aria-describedby="donate-pending"
      title="Donation link not connected yet"
    >
      {donation.label} <Icon name="arrow" size={18} />
    </Button>
  )

  return (
    <div className={`donate-cta donate-cta--${variant} ${className}`}>
      <div className="donate-cta__copy">
        <span className={`eyebrow ${variant === 'band' ? 'eyebrow--onDark' : ''}`}>
          <span className={`tick ${variant === 'band' ? 'tick--gold' : 'tick--accent'}`} /> Chip in
        </span>
        <h2 className="donate-cta__title">{donation.headline}</h2>
        <p className="donate-cta__blurb">{donation.blurb}</p>
      </div>

      <div className="donate-cta__action">
        {button}
        {!live && (
          <p id="donate-pending" className="donate-cta__pending">
            <PlaceholderTag onDark={variant === 'band'}>Donation link pending</PlaceholderTag>
            <span>
              Add the campaign's donation URL to <code>donation.url</code> in{' '}
              <code>src/content/site.json</code> to activate this button.
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

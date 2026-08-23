import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Button from './Button.jsx'
import { getSite, hasTerms, getTerms, isPlaceholder } from '../lib/cms.js'
import './Footer.css'

const socialIcon = { Facebook: 'facebook', Instagram: 'instagram', X: 'x', YouTube: 'youtube' }

export default function Footer() {
  const site = getSite()
  const { brand, contact } = site
  const terms = getTerms()
  const year = 2026

  const emailReady = contact.email && !isPlaceholder(contact.email)
  const phoneReady = contact.phone && !isPlaceholder(contact.phone)

  return (
    <footer className="footer">
      {/* CTA band */}
      <div className="container footer__cta">
        <div>
          <h2 className="footer__cta-title">Ready to build stronger schools together?</h2>
          <p className="footer__cta-sub">
            Add your name, chip in, or lend a hand — every bit moves the ward forward.
          </p>
        </div>
        <div className="footer__cta-btns">
          <Button to="/donate" variant="gold" size="lg">Donate</Button>
          <Button to="/volunteer" variant="ghost" size="lg">Volunteer</Button>
        </div>
      </div>

      <div className="container footer__main">
        <div className="footer__brand">
          <div className="footer__lockup">
            <span className="footer__mark" aria-hidden="true"><span className="tick tick--gold" /></span>
            <div>
              <p className="footer__name">{brand.name}</p>
              <p className="footer__role">{brand.role}</p>
            </div>
          </div>
          <p className="footer__tag">{brand.tagline}</p>
          <p className="footer__script script">{brand.footerLine}</p>
        </div>

        <nav className="footer__col" aria-label="Connect">
          <h3 className="footer__h">Connect</h3>
          <Link to="/volunteer">Volunteer</Link>
          <Link to="/donate">Contribute</Link>
        </nav>

        <nav className="footer__col" aria-label="Campaign">
          <h3 className="footer__h">Campaign</h3>
          <Link to="/about">About Ketan</Link>
          <Link to="/issues">Issues</Link>
          <Link to="/media">News &amp; Media</Link>
          <Link to="/faq">FAQ</Link>
        </nav>

        <nav className="footer__col" aria-label="Legal and information">
          <h3 className="footer__h">Info</h3>
          <Link to="/privacy">Privacy Policy</Link>
          {hasTerms() && <Link to={terms.route}>Terms</Link>}
          <Link to="/accessibility">Accessibility</Link>
        </nav>

        <div className="footer__col">
          <h3 className="footer__h">Get in touch</h3>
          {phoneReady && (
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="footer__contact">
              <Icon name="phone" size={16} /> {contact.phone}
            </a>
          )}
          {emailReady ? (
            <a href={`mailto:${contact.email}`} className="footer__contact">
              <Icon name="mail" size={16} /> {contact.email}
            </a>
          ) : (
            <span className="footer__pending">Email address to be confirmed</span>
          )}

          <div className="footer__social">
            {site.social.map((s) =>
              s.href ? (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="footer__social-link"
                >
                  <Icon name={socialIcon[s.label] || 'arrow'} size={20} />
                </a>
              ) : null,
            )}
          </div>
        </div>
      </div>

      <div className="container footer__bar">
        <p>© {year} {brand.name} Campaign. Authorized by the CFO for the {brand.name} Campaign.</p>
        <p className="footer__legal">
          Individual contributions only · Ontario residents · max ${site.legal.max} per candidate.
        </p>
      </div>
    </footer>
  )
}

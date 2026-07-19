import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Button from './Button.jsx'
import { getSite } from '../lib/cms.js'
import './Footer.css'

const socialIcon = { Facebook: 'facebook', Instagram: 'instagram', X: 'x', YouTube: 'youtube' }

export default function Footer() {
  const site = getSite()
  const year = 2026

  return (
    <footer className="footer">
      <div className="container footer__cta">
        <div>
          <h2 className="footer__cta-title">Ready to build stronger schools together?</h2>
          <p className="footer__cta-sub">Add your name, chip in, or lend a hand — every bit moves Ward 12 forward.</p>
        </div>
        <div className="footer__cta-btns">
          <Button to="/donate" variant="accent" size="lg">Donate</Button>
          <Button to="/volunteer" variant="ghost" size="lg">Volunteer</Button>
        </div>
      </div>

      <div className="container footer__main">
        <div className="footer__brand">
          <div className="footer__mark"><span className="tick tick--accent" /></div>
          <div>
            <p className="footer__name">{site.brand.name}</p>
            <p className="footer__role">{site.brand.role}</p>
          </div>
          <p className="footer__tag">{site.brand.tagline}</p>
        </div>

        <nav className="footer__col" aria-label="Quick links">
          <h3 className="footer__h">Quick Links</h3>
          <Link to="/donate">Donate</Link>
          <Link to="/volunteer">Volunteer</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/issues">Issues</Link>
        </nav>

        <nav className="footer__col" aria-label="More">
          <h3 className="footer__h">Campaign</h3>
          <Link to="/about">About Ketan</Link>
          <Link to="/news">News &amp; Media</Link>
          <Link to="/pictures">Pictures</Link>
          <Link to="/groups">Groups</Link>
        </nav>

        <nav className="footer__col" aria-label="Legal">
          <h3 className="footer__h">Info</h3>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/accessibility">Accessibility</Link>
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, '')}`}>{site.contact.phone}</a>
        </nav>

        <div className="footer__col">
          <h3 className="footer__h">Follow along</h3>
          <div className="footer__social">
            {site.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer noopener" aria-label={s.label} className="footer__social-link">
                <Icon name={socialIcon[s.label] || 'arrow'} size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container footer__bar">
        <p>© {year} {site.brand.name} Campaign. Authorized by the CFO for the {site.brand.name} Campaign.</p>
        <p className="footer__legal">Individual contributions only · Ontario residents · max $1,200 per candidate.</p>
      </div>
    </footer>
  )
}

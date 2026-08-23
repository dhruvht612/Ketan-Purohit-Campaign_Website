import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import Button from './Button.jsx'
import { getSite } from '../lib/cms.js'
import './Nav.css'

/* The header, as the campaign set it out: About, Connect, Contribute, News &
   Updates, FAQ. Home leads, and the issues page hangs off About rather than
   becoming an orphan.

   Contribute is not in this list: it is the accent button at the end of the
   header, which goes to the same /donate page. Listing it twice would give the
   header two links to one destination and cost the CTA its emphasis.

   A section left holding a single child collapses to a plain link — see
   `collapse` below. Connect is one link today because Volunteer is the only
   form; News becomes a menu again the moment a social URL is filled in.

   A child with `href` instead of `to` is an outside link (the social channels)
   and opens in a new tab. One with `href: ''` — a channel whose URL the
   campaign has not supplied yet — is dropped rather than rendered dead. */
const NAV = [
  { label: 'Home', to: '/' },
  {
    label: 'About',
    children: [
      { label: 'Meet Ketan', to: '/about' },
      { label: 'Why I’m Running', to: '/about#why' },
      { label: 'My Priorities', to: '/about#priorities' },
      { label: 'The Issues', to: '/issues' },
    ],
  },
  {
    label: 'Connect',
    children: [
      { label: 'Volunteer', to: '/volunteer' },
    ],
  },
  {
    label: 'News & Updates',
    children: [
      { label: 'Media', to: '/media' },
      { label: 'Facebook', social: 'Facebook' },
      { label: 'Instagram', social: 'Instagram' },
    ],
  },
  { label: 'FAQ', to: '/faq' },
]

/** Resolve the social placeholders in NAV against site.json, dropping any
    channel whose URL has not been supplied. */
function resolveChildren(children, social) {
  return children
    .map((c) => {
      if (!c.social) return c
      const found = social.find((x) => x.label === c.social)
      return found?.href ? { label: c.label, href: found.href } : null
    })
    .filter(Boolean)
}

/** A section with one child left is that child, under the section's own name —
    a dropdown holding a single item is a menu that wastes a click. */
function collapse(item) {
  if (!item.children) return item
  if (item.children.length === 0) return null
  if (item.children.length === 1) {
    const [only] = item.children
    return { label: item.label, to: only.to, href: only.href }
  }
  return item
}

export default function Nav() {
  const site = getSite()
  const nav = NAV.map((item) =>
    item.children
      ? collapse({ ...item, children: resolveChildren(item.children, site.social || []) })
      : item,
  ).filter(Boolean)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDrop, setOpenDrop] = useState(null) // desktop hover/focus dropdown
  const [mobileExpanded, setMobileExpanded] = useState(null)
  const location = useLocation()
  const navRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setOpenDrop(null)
    setMobileExpanded(null)
  }, [location.pathname])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close desktop dropdown on outside click / Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpenDrop(null)
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenDrop(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <header ref={navRef} className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <Link to="/" className="brand" aria-label={`${site.brand.name}, home`}>
          <span className="brand__mark" aria-hidden="true">
            <Icon name="bookOpen" size={24} strokeWidth={2.1} />
          </span>
          <span className="brand__text">
            <span className="brand__name">
              <span className="brand__first">{site.brand.firstName}</span>{' '}
              <span className="brand__last">{site.brand.lastName}</span>
            </span>
            <span className="brand__sub">{site.brand.role}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="nav__desktop" aria-label="Primary">
          <ul className="nav__list">
            {nav.map((item) =>
              item.children ? (
                <li
                  key={item.label}
                  className="nav__item nav__item--drop"
                  onMouseEnter={() => setOpenDrop(item.label)}
                  onMouseLeave={() => setOpenDrop(null)}
                >
                  <button
                    className="nav__link nav__dropbtn"
                    aria-expanded={openDrop === item.label}
                    aria-haspopup="true"
                    onClick={() => setOpenDrop((v) => (v === item.label ? null : item.label))}
                    onFocus={() => setOpenDrop(item.label)}
                  >
                    {item.label}
                    <Icon name="arrow" size={15} className="nav__caret" />
                  </button>
                  <ul className={`nav__menu ${openDrop === item.label ? 'is-open' : ''}`}>
                    {item.children.map((c) =>
                      c.href ? (
                        <li key={c.href}>
                          <a
                            href={c.href}
                            className="nav__menu-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {c.label}
                            <Icon name="external" size={14} className="nav__menu-out" />
                          </a>
                        </li>
                      ) : (
                        <li key={c.to}>
                          <NavLink to={c.to} className="nav__menu-link">
                            {c.label}
                          </NavLink>
                        </li>
                      ),
                    )}
                  </ul>
                </li>
              ) : (
                <li key={item.to} className="nav__item">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
          <Button to="/donate" variant="accent" size="sm" className="nav__cta">
            Contribute
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button
          className="nav__toggle"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className={`nav__bars ${mobileOpen ? 'is-x' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {/* Mobile menu */}
      <div id="mobile-menu" className={`nav__mobile ${mobileOpen ? 'is-open' : ''}`}>
        <nav aria-label="Mobile" className="nav__mobile-inner">
          <ul>
            {nav.map((item) =>
              item.children ? (
                <li key={item.label} className="nav__m-group">
                  <button
                    className="nav__m-link nav__m-toggle"
                    aria-expanded={mobileExpanded === item.label}
                    onClick={() =>
                      setMobileExpanded((v) => (v === item.label ? null : item.label))
                    }
                  >
                    {item.label}
                    <Icon
                      name="arrow"
                      size={18}
                      className={`nav__m-caret ${mobileExpanded === item.label ? 'is-open' : ''}`}
                    />
                  </button>
                  <ul className={`nav__m-sub ${mobileExpanded === item.label ? 'is-open' : ''}`}>
                    {item.children.map((c) =>
                      c.href ? (
                        <li key={c.href}>
                          <a
                            href={c.href}
                            className="nav__m-sublink"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {c.label}
                            <Icon name="external" size={15} className="nav__menu-out" />
                          </a>
                        </li>
                      ) : (
                        <li key={c.to}>
                          <NavLink to={c.to} className="nav__m-sublink">
                            {c.label}
                          </NavLink>
                        </li>
                      ),
                    )}
                  </ul>
                </li>
              ) : (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `nav__m-link ${isActive ? 'is-active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>
          <Button to="/donate" variant="accent" size="lg" full className="nav__m-cta">
            Contribute
          </Button>
        </nav>
      </div>
    </header>
  )
}

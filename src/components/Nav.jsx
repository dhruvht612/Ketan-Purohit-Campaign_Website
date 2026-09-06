import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import Button from './Button.jsx'
import ThemeToggle from './ThemeToggle.jsx'
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

/** A section reads as current when the visitor is on any page beneath it, so
    "About" stays lit on /issues. Children carrying a hash point at the page
    they hang off, so only the pathname is compared. */
function sectionIsActive(item, pathname) {
  if (!item.children) return false
  return item.children.some((c) => c.to && c.to.split('#')[0] === pathname)
}

/* Scroll thresholds. Separate enter/exit values so a viewport parked right on
   the line cannot flicker between the two states. */
const SCROLL_ON = 16
const SCROLL_OFF = 6

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
  const toggleRef = useRef(null)
  const panelRef = useRef(null)
  const enterMenuRef = useRef(false)

  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      setScrolled((was) => {
        const y = window.scrollY
        return was ? y > SCROLL_OFF : y > SCROLL_ON
      })
    }
    const onScroll = () => {
      // One read per frame: the handler fires far more often than the bar can
      // repaint, and each read forces layout.
      if (!frame) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setOpenDrop(null)
    setMobileExpanded(null)
  }, [location.pathname, location.hash])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [mobileOpen])

  const closeMobile = useCallback((returnFocus = false) => {
    setMobileOpen(false)
    if (returnFocus) toggleRef.current?.focus()
  }, [])

  // Escape closes whichever layer is open; outside clicks close the dropdown.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (mobileOpen) closeMobile(true)
      else if (openDrop) {
        setOpenDrop(null)
        // Section labels are quoted in the selector, so no escaping is
        // needed for the ampersand in "News & Updates".
        navRef.current?.querySelector(`.nav__dropbtn[data-menu="${openDrop}"]`)?.focus()
      }
    }
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenDrop(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [mobileOpen, openDrop, closeMobile])

  // Widening past the breakpoint takes the menu button away with it, which
  // would leave an open panel with nothing left to close it.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 961px)')
    const onChange = (e) => e.matches && setMobileOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Opening the panel should land the visitor inside it. Safe to do
  // synchronously: the panel's `visibility` is stepped, not eased, so it is
  // already focusable on the frame the class lands (see Nav.css).
  useEffect(() => {
    if (!mobileOpen) return
    panelRef.current?.querySelector('a, button')?.focus({ preventScroll: true })
  }, [mobileOpen])

  // ArrowDown asked to step into the menu it just opened.
  useEffect(() => {
    if (!openDrop || !enterMenuRef.current) return
    enterMenuRef.current = false
    navRef.current?.querySelector('.nav__menu.is-open .nav__menu-link')?.focus()
  }, [openDrop])

  /** Down-arrow on a section button opens it and steps into the menu, which is
      what a disclosure is expected to do from the keyboard. The focus move
      cannot happen here — the menu is still closed until React renders — so
      the intent is flagged and the effect below acts on it. */
  const onDropKeyDown = (label) => (e) => {
    if (e.key !== 'ArrowDown') return
    e.preventDefault()
    enterMenuRef.current = true
    setOpenDrop(label)
  }

  /** Tabbing past the last item in a menu should close it behind you. */
  const onDropBlur = (label) => (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOpenDrop((v) => (v === label ? null : v))
    }
  }

  const renderChild = (c, linkClass) =>
    c.href ? (
      <li key={c.href}>
        <a href={c.href} className={linkClass} target="_blank" rel="noopener noreferrer">
          {c.label}
          <Icon name="external" size={14} className="nav__menu-out" />
        </a>
      </li>
    ) : (
      <li key={c.to}>
        <NavLink to={c.to} className={linkClass}>
          {c.label}
        </NavLink>
      </li>
    )

  return (
    <header
      ref={navRef}
      className={`nav ${scrolled ? 'nav--scrolled' : ''} ${mobileOpen ? 'nav--open' : ''}`}
    >
      {/* The flyer's navy → red hairline across the very top of the sheet. */}
      <span className="nav__rule" aria-hidden="true" />

      <div className="nav__shell">
        <div className="nav__bar">
          <Link to="/" className="brand" aria-label={`${site.brand.name}, home`}>
            <span className="brand__mark" aria-hidden="true">
              <Icon name="bookOpen" size={22} strokeWidth={2.1} />
            </span>
            <span className="brand__text">
              <span className="brand__name">
                <span className="brand__first">{site.brand.firstName}</span>{' '}
                <span className="brand__last">{site.brand.lastName}</span>
              </span>
              <span className="brand__sub">
                <span className="brand__tick" aria-hidden="true" />
                {site.brand.role}
              </span>
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
                    onBlur={onDropBlur(item.label)}
                  >
                    <button
                      type="button"
                      data-menu={item.label}
                      className={`nav__link nav__dropbtn ${
                        sectionIsActive(item, location.pathname) ? 'is-active' : ''
                      }`}
                      aria-expanded={openDrop === item.label}
                      aria-haspopup="true"
                      onClick={() => setOpenDrop((v) => (v === item.label ? null : item.label))}
                      onKeyDown={onDropKeyDown(item.label)}
                    >
                      <span className="nav__label">{item.label}</span>
                      <Icon name="chevron" size={14} strokeWidth={2.4} className="nav__caret" />
                    </button>
                    <div className={`nav__menu ${openDrop === item.label ? 'is-open' : ''}`}>
                      <ul>
                        {item.children.map((c) => renderChild(c, 'nav__menu-link'))}
                      </ul>
                    </div>
                  </li>
                ) : (
                  <li key={item.to} className="nav__item">
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
                    >
                      <span className="nav__label">{item.label}</span>
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="nav__actions">
            <ThemeToggle className="nav__theme" />
            <Button to="/donate" variant="accent" size="sm" className="nav__cta">
              Contribute
              <Icon name="arrow" size={16} strokeWidth={2.4} className="nav__cta-arrow" />
            </Button>

            {/* Mobile toggle */}
            <button
              type="button"
              ref={toggleRef}
              className="nav__toggle"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className={`nav__bars ${mobileOpen ? 'is-x' : ''}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile menu — a glass panel dropped under the bar, on the same
            gutters, rather than a separate full-screen surface. */}
        {/* Closed, the panel is `visibility: hidden` rather than `display:
            none` — it still animates out, and visibility already takes its
            links out of the tab order and the accessibility tree. */}
        <div
          id="mobile-menu"
          ref={panelRef}
          className={`nav__panel ${mobileOpen ? 'is-open' : ''}`}
        >
          <nav aria-label="Mobile" className="nav__panel-inner">
            <ul>
              {nav.map((item) =>
                item.children ? (
                  <li key={item.label} className="nav__m-group">
                    <button
                      type="button"
                      className="nav__m-link nav__m-toggle"
                      aria-expanded={mobileExpanded === item.label}
                      onClick={() =>
                        setMobileExpanded((v) => (v === item.label ? null : item.label))
                      }
                    >
                      {item.label}
                      <Icon
                        name="chevron"
                        size={18}
                        strokeWidth={2.4}
                        className={`nav__m-caret ${mobileExpanded === item.label ? 'is-open' : ''}`}
                      />
                    </button>
                    <div className={`nav__m-sub ${mobileExpanded === item.label ? 'is-open' : ''}`}>
                      <ul>
                        {item.children.map((c) => renderChild(c, 'nav__m-sublink'))}
                      </ul>
                    </div>
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
              <Icon name="arrow" size={18} strokeWidth={2.4} className="nav__cta-arrow" />
            </Button>

            {/* Only shown at the widths where the bar has to drop the switch
                to keep the lockup, the CTA and the menu button all legible.
                Both switches read the same store, so they cannot disagree. */}
            <div className="nav__m-theme">
              <span className="nav__m-theme-label">Dark mode</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>

      {/* Tapping the page behind the panel closes it. Not focusable: Escape
          and the toggle already cover the keyboard. */}
      <div className="nav__scrim" onClick={() => closeMobile()} aria-hidden="true" />
    </header>
  )
}

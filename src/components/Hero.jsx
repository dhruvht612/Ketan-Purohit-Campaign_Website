import { motion, useReducedMotion } from 'framer-motion'
import Placeholder from './Placeholder.jsx'
import Icon from './Icon.jsx'
import Button from './Button.jsx'
import { getSite, getDonation, isDonationLive } from '../lib/cms.js'
import './Hero.css'

/**
 * The ghosted schoolhouse the candidate stands in front of.
 *
 * Line art, not a watermark: an even stroke weight throughout, a wider eave
 * than the wall it caps so the roof reads as a roof, a belfry over the ridge,
 * and a low fence running off both sides to give the building a ground line
 * instead of leaving it floating. Drawn on a 240x190 field with the fence at
 * the very bottom edge, so it can be anchored to the base of the hero and sit
 * behind the portrait rather than hovering in a corner.
 */
function Schoolhouse(props) {
  return (
    <svg
      viewBox="0 0 240 190"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* flagpole and pennant over the belfry */}
      <path d="M120 6v20" />
      <path d="M120 8h20l-6 5.5 6 5.5h-20" fill="currentColor" stroke="none" />
      {/* belfry */}
      <path d="M108 44v-9a12 12 0 0 1 24 0v9" />
      {/* roof: eaves overhang the wall on both sides */}
      <path d="M52 88 120 44l68 44" />
      <path d="M46 88h148" />
      {/* wall, clock, door and windows */}
      <path d="M60 88v82h120V88" />
      <circle cx="120" cy="112" r="12" />
      <path d="M120 105v7l5 4" />
      <path d="M104 170v-32a16 16 0 0 1 32 0v32" />
      <rect x="74" y="128" width="18" height="20" rx="1.5" />
      <rect x="148" y="128" width="18" height="20" rx="1.5" />
      {/* ground line and fence */}
      <path d="M4 170h56M180 170h56" />
      <path d="M18 162v14M34 162v14M206 162v14M222 162v14" />
    </svg>
  )
}

/**
 * The flyer's painted plaque: a navy brush block with streaks trailing off its
 * left edge and a red stroke sweeping the lower boundary. Stretched to the
 * badge's box (preserveAspectRatio="none"), so the strokes stay organic at any
 * size. The red sits below the text, never behind it — gold on red would drop
 * under 4.5:1.
 */
function PaintBlock(props) {
  return (
    <svg viewBox="0 0 460 150" preserveAspectRatio="none" aria-hidden="true" {...props}>
      <g className="hero__paint-navy">
        <path d="M48 20C124 8 194 16 266 12c68-4 130 6 186-4 4 32 3 92-2 128-70 10-150-2-224 3-66 5-126-2-180 6-6-40-5-92 2-125z" />
        <path d="M48 40c-18 1-36 4-48 7 14 3 32 4 48 5z" />
        <path d="M48 76c-20 2-40 6-52 10 16 3 36 3 52 3z" />
        <path d="M49 110c-14 2-27 6-37 9 12 3 26 3 37 3z" />
      </g>
      <path
        className="hero__paint-red"
        d="M0 112c80 12 170-4 256 4 74 7 140-4 204 2v14c-66-6-130 5-208-2-86-8-172 9-252-4z"
      />
    </svg>
  )
}

export default function Hero() {
  const site = getSite()
  const { brand } = site
  const donation = getDonation()
  const donationLive = isDonationLive()
  const reduce = useReducedMotion()

  const rise = (delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: [0.22, 0.61, 0.36, 1] },
  })

  return (
    <section className="hero" aria-label="Introduction">
      {/* Background, back to front: the warm cream wash and its left-to-right
          shift, the halftone dot screen, the schoolhouse line art, then a
          soft pool of shade the candidate stands in. Every layer is CSS or
          inline SVG — no background photograph to download, and nothing that
          can out-weigh the portrait or the name lockup. */}
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__wash" />
        <span className="hero__grid" />
        <Schoolhouse className="hero__school" />
        <span className="hero__glow" />
      </div>

      <div className="container hero__inner">
        <div className="hero__copy">
          <motion.span className="hero__eyebrow" {...rise(0.05)}>
            <span className="hero__star" aria-hidden="true">★</span>
            {brand.election}
            <span className="hero__star" aria-hidden="true">★</span>
          </motion.span>

          <motion.h1 className="hero__title" {...rise(0.12)}>
            <span className="hero__title-first">{brand.firstName}</span>
            <span className="hero__title-last">{brand.lastName}</span>
          </motion.h1>

          <motion.p className="hero__for" {...rise(0.2)}>
            <Icon name="cap" size={20} strokeWidth={2} />
            For
          </motion.p>
          <motion.p className="hero__role" {...rise(0.24)}>
            {brand.role}
          </motion.p>

          <motion.p className="hero__lede" {...rise(0.32)}>
            {brand.intro}
          </motion.p>

          {/* The two things the hero is actually asking for. Donate leads —
              it is the one action with a deadline on it — and goes straight
              out to the campaign's donation platform; Volunteer stays on the
              site. Both read their destination from the CMS, so neither can
              drift from the rest of the site. */}
          <motion.div className="hero__actions" {...rise(0.4)}>
            {donationLive ? (
              <Button
                href={donation.url}
                variant="accent"
                size="lg"
                target="_blank"
                rel="noreferrer noopener"
              >
                {donation.label} <Icon name="arrow" size={18} />
              </Button>
            ) : (
              /* No donation URL set: a disabled button rather than a dead
                 link, matching how DonateCTA behaves everywhere else. */
              <Button variant="accent" size="lg" disabled title="Donation link not connected yet">
                {donation.label} <Icon name="arrow" size={18} />
              </Button>
            )}
            <Button to="/volunteer" variant="secondary" size="lg">
              Volunteer <Icon name="arrow" size={18} />
            </Button>
          </motion.div>
        </div>

        {/* Deliberately not a motion element. The portrait is composited into
            the page with mix-blend-mode (see Hero.css), and any transform or
            opacity on an ancestor would isolate the blend group and bring the
            photo's flat backdrop back as a pale rectangle. */}
        <div className="hero__media">
          {/* The source frame carries 324px (24%) of empty backdrop above
              the head. The ratio below crops most of it against the bottom
              edge — object-fit: cover on .ph-img makes the cut — so the
              candidate fills the column instead of floating in dead space,
              and none of him is lost. */}
          <div className="hero__portrait">
            <Placeholder
              src={site.images.portrait}
              monogram
              alt={`${brand.name}, candidate for ${brand.role}`}
              ratio="1152 / 1160"
              rounded="0"
              objectPosition="center bottom"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <div className="hero__badge">
            <PaintBlock className="hero__badge-paint" />
            <p className="script hero__badge-script">{brand.script}</p>
            <p className="hero__badge-line">{brand.scriptLine2}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

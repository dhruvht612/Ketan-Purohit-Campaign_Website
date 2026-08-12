/**
 * CMS access layer
 * ----------------
 * Every piece of editable content flows through here. Today it reads from
 * local JSON in /src/content. To connect a headless CMS (Sanity, Contentful,
 * Strapi, etc.) later, replace the bodies of these functions with `fetch`
 * calls — the component API stays identical, so no page needs to change.
 *
 * Placeholder convention
 * ----------------------
 * Content that is still waiting on the campaign is written in [SQUARE
 * BRACKETS]. `isPlaceholder()` detects it so the UI can flag the slot
 * visibly — this guarantees nothing unfinished is ever presented as a real
 * campaign fact. Replace the bracketed text with the final copy and the flag
 * disappears on its own; no component changes required.
 */
import site from '../content/site.json'
import quotes from '../content/quotes.json'
import about from '../content/about.json'
import issues from '../content/issues.json'
import media from '../content/media.json'
import gallery from '../content/gallery.json'
import groups from '../content/groups.json'
import wards from '../content/wards.json'
import legal from '../content/legal.json'

/** True when a value is still an unfilled `[PLACEHOLDER]` slot. */
export const isPlaceholder = (value) =>
  typeof value === 'string' && /^\s*\[.+\]\s*$/.test(value.trim())

/** True when every entry of a list is still a placeholder. */
export const allPlaceholders = (list = []) =>
  list.length > 0 && list.every((v) => isPlaceholder(typeof v === 'string' ? v : v?.text ?? ''))

export const getSite = () => site
export const getBrand = () => site.brand
export const getContact = () => site.contact
export const getDonation = () => site.donation

/** Donation link is "live" only once a real URL replaces the placeholder. */
export const isDonationLive = () => {
  const url = site.donation?.url
  return Boolean(url) && !isPlaceholder(url) && /^https?:\/\//i.test(url)
}

export const getQuotes = () => quotes
export const getQuoteCategories = () =>
  Array.from(new Set(quotes.map((q) => q.category)))

export const getAbout = () => about
export const getIssues = () => issues
export const getIssue = (id) => issues.find((i) => i.id === id) || null

export const getMedia = () => media
/** Back-compat alias — the Media page was originally called "News". */
export const getNews = () => media

export const getGallery = () => gallery.items
export const getGalleryMeta = () => gallery
export const getGalleryCategories = () => [
  'All',
  ...Array.from(new Set(gallery.items.map((g) => g.category))),
]

export const getGroups = () => groups
export const getWards = () => wards.options
export const getWardsMeta = () => wards

export const getLegal = () => legal
export const getConsentText = () => legal.smsConsent
export const getPrivacy = () => legal.privacy
export const getTerms = () => legal.terms
/** Terms only linked once the campaign supplies a real terms document. */
export const hasTerms = () => Boolean(legal.terms?.enabled)

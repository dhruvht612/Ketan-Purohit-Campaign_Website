/**
 * CMS access layer
 * ----------------
 * Every piece of editable content flows through here. Today it reads from
 * local JSON in /src/content. To connect a headless CMS (Sanity, Contentful,
 * Strapi, etc.) later, replace the bodies of these functions with `fetch`
 * calls — the component API stays identical, so no page needs to change.
 *
 * All getters are synchronous today; if you move to a remote CMS, switch them
 * to async and `await` at the call sites (pages already treat content as data).
 */
import site from '../content/site.json'
import slides from '../content/slides.json'
import about from '../content/about.json'
import issues from '../content/issues.json'
import news from '../content/news.json'
import gallery from '../content/gallery.json'
import groups from '../content/groups.json'
import wards from '../content/wards.json'

export const getSite = () => site
export const getSlides = () => slides
export const getAbout = () => about
export const getIssues = () => issues
export const getIssue = (id) => issues.find((i) => i.id === id) || null
export const getNews = () => news
export const getGallery = () => gallery
export const getGalleryCategories = () => [
  'All',
  ...Array.from(new Set(gallery.map((g) => g.category))),
]
export const getGroups = () => groups
export const getWards = () => wards

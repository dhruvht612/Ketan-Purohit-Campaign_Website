# Ketan Purohit — TDSB Ward 12 Campaign Website

A modern, accessible campaign website built with **React + Vite** (plain
JavaScript, no TypeScript). Soft-blue civic design, rounded cards, smooth
animations, mobile-first, and structured so content can move to a CMS with
minimal changes.

> Rebuild of the original static site (preserved in [`_legacy/`](./_legacy)).

## Quick start

```bash
npm install
npm run dev       # local dev at http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # preview the production build
```

> Note: `npm run dev`/`preview` serve the front-end only. The `/api/*` routes
> are Vercel serverless functions and run when deployed (or via `vercel dev`).
> In local dev the forms fall back to an optimistic success so the UX is fully
> testable without a backend.

## Tech stack

- **React 18 + Vite 5** — fast SPA, no build ceremony
- **React Router 6** — multi-page routing (`/`, `/about`, `/issues`,
  `/volunteer`, `/donate`, `/news`, `/pictures`, `/groups`, `/contact`,
  `/privacy`, `/accessibility`)
- **Framer Motion** — hero entrance, carousel fade, scroll reveals, lightbox
- **Vanilla CSS** with design tokens — see `src/styles/global.css`

## Project structure

```
campaign-website/
├── index.html                 # Vite entry + fonts + SEO meta
├── vercel.json                # SPA rewrites + build config
├── .env.example               # keys for live integrations
├── api/                       # serverless endpoints (scaffolded stubs)
│   ├── _lib/util.js           # saveRecord() + sendConfirmationEmail() hooks
│   ├── volunteer.js           # POST /api/volunteer
│   ├── contact.js             # POST /api/contact
│   └── donate.js              # POST /api/donate  (Stripe-ready)
├── public/favicon.svg
└── src/
    ├── main.jsx  App.jsx      # bootstrap + routes
    ├── content/               # ← EDITABLE CONTENT (CMS-ready JSON)
    │   ├── site.json          # brand, contact, social, legal, donation limits
    │   ├── slides.json        # 7 homepage carousel slides
    │   ├── about.json  issues.json  news.json  gallery.json  groups.json  wards.json
    ├── lib/
    │   ├── cms.js             # ← single content access layer (swap for a CMS)
    │   └── api.js             # front-end API client
    ├── components/            # Nav, Footer, Hero, Carousel, IssueCard, Field, Toast, …
    ├── pages/                 # one file per route
    └── styles/                # global.css (tokens) + pages.css
```

## Design system

Defined as CSS custom properties in [`src/styles/global.css`](./src/styles/global.css):

- **Color** — soft blue `#1e5fc4` (primary), warm amber `#f6a417` (accent /
  Donate CTA), near-navy ink, blue-tinted paper. Accessible contrast throughout.
- **Type** — Bricolage Grotesque (display) + Public Sans (civic body).
- **Signature motif** — the rounded "ballot check" tick, reused in the brand
  mark, bullet lists, and section eyebrows.
- **Base font size 17px** and generous spacing for older-voter readability.
- Respects `prefers-reduced-motion`; full keyboard focus states; skip link.

## Editing content (today → CMS later)

All copy, issues, slides, news, gallery, groups, and contact details live in
`src/content/*.json` and are read through **`src/lib/cms.js`**. To connect a
headless CMS (Sanity, Contentful, Strapi, …) later, replace the function bodies
in `cms.js` with `fetch` calls — the component API stays identical, so no page
needs to change.

Dynamic-ready content: About text, Issues, News, Gallery, Events, Volunteer
submissions.

## Going live (integration points)

Everything is scaffolded with clearly marked stubs. Copy `.env.example` to
`.env` and fill in keys, then:

| Feature | Where | To enable |
|---|---|---|
| **Donations (Stripe)** | `api/donate.js` | Set `STRIPE_SECRET_KEY`, uncomment the Stripe block. Enforces individual-only, min $5 / max $1,200. PayPal swaps into the same spot. |
| **Confirmation emails** | `api/_lib/util.js` → `sendConfirmationEmail()` | Set `EMAIL_API_KEY`, add your provider SDK (Resend/SendGrid/Postmark). |
| **Storing submissions** | `api/_lib/util.js` → `saveRecord()` | Set `DATABASE_URL`, write to your datastore (Supabase/Postgres/Airtable/Sheets). |

The volunteer, contact, and donate forms already validate input and POST clean
payloads to these endpoints.

## Add real photos

Every image renders through `src/components/Placeholder.jsx`, which currently
draws on-brand gradient placeholders with a "KP" monogram. Pass a real `src`
(from the CMS or `/public`) to swap in photography — no layout changes needed.

## Deployment

Configured for **Vercel** (`vercel.json`): `npm run build` → `dist/`, SPA
rewrites for client routing, and `/api/*` served as serverless functions.

## Accessibility

Keyboard-navigable nav + dropdowns + lightbox, visible focus rings, ARIA labels
and live regions (toasts), reduced-motion support, semantic landmarks, and a
skip-to-content link.

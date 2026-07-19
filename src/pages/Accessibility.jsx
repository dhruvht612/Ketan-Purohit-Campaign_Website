import LegalPage from './LegalPage.jsx'

const SECTIONS = [
  {
    heading: 'Our commitment',
    body: [
      'This campaign is committed to making our website usable for everyone, including people who rely on assistive technology. We aim to meet WCAG 2.1 AA standards throughout the site.',
    ],
  },
  {
    heading: 'What we’ve built in',
    body: [
      'The site supports full keyboard navigation, visible focus indicators, sufficient colour contrast, descriptive labels, and respects the “reduce motion” setting in your browser or operating system.',
    ],
  },
  {
    heading: 'Need help or found a barrier?',
    body: [
      'If you encounter any difficulty using this site, or need information in an alternative format, please contact us — we’ll work with you to provide what you need.',
    ],
  },
]

export default function Accessibility() {
  return (
    <LegalPage
      eyebrow="Accessibility"
      title="Accessibility"
      lede="We want every voter to be able to use this site with ease."
      sections={SECTIONS}
    />
  )
}

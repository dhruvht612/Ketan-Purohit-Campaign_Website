import Hero from '../components/Hero.jsx'
import QuoteCarousel from '../components/QuoteCarousel.jsx'
import AboutSection from '../components/AboutSection.jsx'
import { getQuotes } from '../lib/cms.js'

export default function Home() {
  const quotes = getQuotes()

  return (
    <>
      <Hero />

      {/* No eyebrow here: "What this campaign stands for" only restated the
          heading below it. The heading carries itself. */}
      <QuoteCarousel
        cards={quotes}
        eyebrow={null}
        title="Where Ketan stands"
        lede="Six campaign boards, one per theme. Swipe, or pick one from the strip below."
      />

      <AboutSection compact />
    </>
  )
}

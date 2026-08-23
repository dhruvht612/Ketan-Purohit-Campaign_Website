import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Issues from './pages/Issues.jsx'
import Volunteer from './pages/Volunteer.jsx'
import Faq from './pages/Faq.jsx'
import Donate from './pages/Donate.jsx'
import Media from './pages/Media.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Accessibility from './pages/Accessibility.jsx'
import NotFound from './pages/NotFound.jsx'

/**
 * Puts a new page at the top — unless the link carried a hash, in which case
 * it goes to that block instead. The About menu links straight to #why and
 * #priorities, and without this the scroll-to-top would win the race and drop
 * the visitor at the top of the page they were trying to skip past.
 *
 * The target is looked up after paint (rAF), because on a fresh route the
 * element does not exist yet when this effect first runs. `scroll-padding-top`
 * in global.css keeps the fixed header off the heading.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    const id = decodeURIComponent(hash.slice(1))
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(id)
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo({ top: 0, behavior: 'auto' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/media" element={<Media />} />
          {/* Kept so existing links to /news keep working. */}
          <Route path="/news" element={<Media />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

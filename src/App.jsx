import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Issues from './pages/Issues.jsx'
import Volunteer from './pages/Volunteer.jsx'
import Donate from './pages/Donate.jsx'
import Media from './pages/Media.jsx'
import Pictures from './pages/Pictures.jsx'
import Groups from './pages/Groups.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Accessibility from './pages/Accessibility.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
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
          <Route path="/donate" element={<Donate />} />
          <Route path="/media" element={<Media />} />
          {/* Kept so existing links to /news keep working. */}
          <Route path="/news" element={<Media />} />
          <Route path="/pictures" element={<Pictures />} />
          <Route path="/photos" element={<Pictures />} />
          <Route path="/groups" element={<Groups />} />
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

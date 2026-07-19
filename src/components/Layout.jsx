import { Outlet } from 'react-router-dom'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main" className="skip-link">Skip to content</a>
      <Nav />
      <main id="main" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

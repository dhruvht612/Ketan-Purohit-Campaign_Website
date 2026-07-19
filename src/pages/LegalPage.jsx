import PageHeader from '../components/PageHeader.jsx'

/**
 * Simple content page for Privacy Policy / Accessibility. Copy is placeholder
 * and CMS-ready — swap `sections` for content pulled from the CMS later.
 */
export default function LegalPage({ eyebrow, title, lede, sections }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lede={lede} />
      <section className="section">
        <div className="container container--narrow prose">
          {sections.map((s) => (
            <div key={s.heading} style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--blue-900)', marginBottom: '.6rem' }}>{s.heading}</h2>
              {s.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

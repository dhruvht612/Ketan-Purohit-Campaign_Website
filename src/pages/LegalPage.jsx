import PageHeader from '../components/PageHeader.jsx'
import { Paragraphs } from '../components/Editable.jsx'

/**
 * Shared layout for the policy pages (Privacy Policy, Terms, Accessibility).
 *
 * Sections are data, and each one renders its supplied paragraphs — or, while
 * the campaign's final document is still outstanding, a clearly flagged
 * placeholder naming exactly what belongs there. No policy language is ever
 * written on the campaign's behalf.
 */
export default function LegalPage({ eyebrow, title, lede, sections = [], effective, footer }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lede={lede} />

      <section className="section">
        <div className="container container--narrow">
          {effective && <p className="legal-meta">Effective: {effective}</p>}

          {/* Jump list — these documents are long once filled in. */}
          {sections.length > 3 && (
            <nav className="legal-toc" aria-label="On this page">
              <h2 className="legal-toc__title">On this page</h2>
              <ol>
                {sections.map((s) => (
                  <li key={s.id || s.heading}>
                    <a href={`#${s.id || s.heading}`}>{s.heading}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="legal-body">
            {sections.map((s) => (
              <section key={s.id || s.heading} id={s.id || s.heading} className="legal-section">
                <h2 className="legal-section__title">{s.heading}</h2>
                <Paragraphs
                  items={s.body}
                  placeholder={s.placeholder}
                  tagLabel="Awaiting supplied document"
                />
              </section>
            ))}
          </div>

          {footer}
        </div>
      </section>
    </>
  )
}

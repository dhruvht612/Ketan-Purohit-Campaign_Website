import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import Icon from '../components/Icon.jsx'
import DonateCTA from '../components/DonateCTA.jsx'
import { getFaq } from '../lib/cms.js'

/**
 * FAQ — voting dates, the voters' list, and where to read more.
 *
 * Built on <details>/<summary> rather than a hand-rolled accordion: it opens
 * and closes with no JavaScript, it is keyboard-operable and announced
 * correctly by default, and the browser's own find-in-page can reach the text
 * inside a closed answer. The first entry is open on arrival, because "when is
 * the election" is the question most people came for.
 */
export default function Faq() {
  const faq = getFaq()

  return (
    <>
      <PageHeader eyebrow={faq.eyebrow} title={faq.title} lede={faq.lede} />

      <section className="section">
        <div className="container container--narrow">
          <ul className="faq">
            {faq.items.map((item, i) => (
              <Reveal as="li" key={item.id} delay={i * 60} className="faq__item">
                <details className="faq__details" open={i === 0}>
                  <summary className="faq__q">
                    <span>{item.question}</span>
                    <Icon name="arrow" size={18} className="faq__caret" aria-hidden="true" />
                  </summary>

                  <div className="faq__a">
                    {(item.answer || []).map((p) => (
                      <p key={p}>{p}</p>
                    ))}

                    {item.items?.length > 0 && (
                      <ul className="faq__list">
                        {item.items.map((line) => (
                          <li key={line}>
                            <span className="tick tick--gold" aria-hidden="true" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {item.links?.length > 0 && (
                      <p className="faq__links">
                        {item.links.map((link) =>
                          link.to ? (
                            <Link key={link.label} to={link.to} className="faq__link">
                              {link.label} <Icon name="arrow" size={15} />
                            </Link>
                          ) : (
                            <a
                              key={link.label}
                              href={link.href}
                              className="faq__link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.label} <Icon name="external" size={15} />
                              <span className="visually-hidden"> (opens in a new tab)</span>
                            </a>
                          ),
                        )}
                      </p>
                    )}
                  </div>
                </details>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <Reveal>
            <DonateCTA variant="band" />
          </Reveal>
        </div>
      </section>
    </>
  )
}

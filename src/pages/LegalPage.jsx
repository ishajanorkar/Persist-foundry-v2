import { useEffect } from 'react'
import '../styles/legal-page.css'

/**
 * Shared legal / policy document layout.
 * Visual language aligned with application forms (.ap-*) and site Montserrat type.
 */
export default function LegalPage({ doc }) {
  useEffect(() => {
    document.body.classList.add('is-loaded')
  }, [])

  if (!doc) return null

  return (
    <div className="legal-page">
      <div className="legal-grid" aria-hidden="true" />
      <div className="legal-inner">
        <header className="legal-header">
          <p className="legal-eyebrow">{doc.eyebrow}</p>
          <h1 className="legal-title">{doc.title}</h1>
        </header>

        <article className="legal-panel">
          {doc.intro?.map((block, i) =>
            block.type === 'lead' ? (
              <p className="legal-lead" key={`intro-${i}`}>
                {block.text}
              </p>
            ) : (
              <p className="legal-p" key={`intro-${i}`}>
                {renderLinks(block.text)}
              </p>
            ),
          )}

          {doc.sections?.map((section) => (
            <section className="legal-section" key={section.title}>
              <h2 className="legal-h2">{section.title}</h2>
              {section.body?.map((para, i) => (
                <p className="legal-p" key={`${section.title}-p-${i}`}>
                  {renderLinks(para)}
                </p>
              ))}
              {section.list?.length > 0 && (
                <ul className="legal-list">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.email && (
                <p className="legal-p">
                  <a className="legal-link" href={`mailto:${section.email}`}>
                    {section.email}
                  </a>
                </p>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}

function renderLinks(text) {
  const parts = String(text).split(/(https?:\/\/[^\s]+)/g)
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        className="legal-link"
        href={part}
        target="_blank"
        rel="noopener noreferrer"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

import { useEffect, useState } from 'react'
import '../styles/application-form.css'

/* ─────────────────────────────────────────────────────────────
   CONTACT — left pitch + right form.
   Form UI matches Work With Us / application forms (.ap-*).
   Socials use the same icon marks as the footer.
───────────────────────────────────────────────────────────── */

const EMPTY = { name: '', phone: '', email: '', message: '' }

function CornerTicks({ size = 18 }) {
  const px = typeof size === 'number' ? size : parseFloat(size) || 18
  const offset = -px / 2
  const style = { width: px, height: px }
  const pos = {
    tl: { top: offset, left: offset },
    tr: { top: offset, right: offset },
    bl: { bottom: offset, left: offset },
    br: { bottom: offset, right: offset },
  }
  return (
    <span className="ab-corner-ticks" aria-hidden="true">
      <img
        className="ab-corner-ticks__tl"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.tl }}
      />
      <img
        className="ab-corner-ticks__tr"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.tr }}
      />
      <img
        className="ab-corner-ticks__bl"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.bl }}
      />
      <img
        className="ab-corner-ticks__br"
        src="/assets/plus-icon.svg"
        alt=""
        style={{ ...style, ...pos.br }}
      />
    </span>
  )
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | success | error

  useEffect(() => {
    document.body.classList.add('is-loaded')
    const els = document.querySelectorAll('.ct-reveal')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const delay = parseInt(entry.target.dataset.delay || '0', 10)
          setTimeout(() => entry.target.classList.add('is-visible'), delay)
          obs.unobserve(entry.target)
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px 8% 0px' },
    )

    els.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        const delay = parseInt(el.dataset.delay || '0', 10)
        setTimeout(() => el.classList.add('is-visible'), delay)
      } else {
        obs.observe(el)
      }
    })

    return () => obs.disconnect()
  }, [status])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error')
      return
    }
    const body = [
      `Name: ${form.name}`,
      `Phone: ${form.phone || '—'}`,
      `Email: ${form.email}`,
      '',
      form.message,
    ].join('\n')
    window.open(
      `mailto:hello@persist.org?subject=${encodeURIComponent(`Contact — ${form.name}`)}&body=${encodeURIComponent(body)}`,
      '_blank',
    )
    setStatus('success')
  }

  return (
    <div className="ct-page">
      <section className="ct-section">
        <div className="ct-grid-bg" aria-hidden="true" />
        <div className="ab-blob ab-blob-1" aria-hidden="true" />
        <div className="ab-blob ab-blob-2" aria-hidden="true" />
        <div className="ct-vignette" aria-hidden="true" />

        <div className="ct-inner">
          <div className="ct-layout">
            <div className="ct-copy">
              <div className="ct-eyebrow ct-reveal" data-delay="0">
                Contact Us
              </div>
              <h1 className="ct-headline ct-reveal" data-delay="80">
                Have an idea for us?
                <br />
                <em>Drop a line.</em>
              </h1>
              <p className="ct-sub ct-reveal" data-delay="180">
                We partner with entrepreneurs and businesses to help scale and
                grow their ideas. With employees in every sector a business can
                need, there&apos;s no better way to get a leg up.
              </p>
              <div
                className="ct-socials ct-reveal"
                data-delay="260"
                aria-label="Social links"
              >
                <a
                  className="ct-social-link"
                  href="https://www.linkedin.com/company/persist-ventures/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Persist on LinkedIn"
                >
                  <span
                    className="footer-social-icon footer-social-icon--linkedin"
                    aria-hidden="true"
                  />
                </a>
                <a
                  className="ct-social-link"
                  href="https://www.instagram.com/persistventures/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Persist on Instagram"
                >
                  <span
                    className="footer-social-icon footer-social-icon--instagram"
                    aria-hidden="true"
                  />
                </a>
                <a
                  className="ct-social-link"
                  href="https://www.youtube.com/@persistventures"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Persist on YouTube"
                >
                  <span
                    className="footer-social-icon footer-social-icon--youtube"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>

            <div className="ct-panel ap-panel ct-reveal" data-delay="160">
              <CornerTicks size={18} />

              {status === 'success' ? (
                <div className="ap-success" role="status">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="9"
                      cy="9"
                      r="8.25"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5.5 9l2.5 2.5L12.5 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <strong>Thank you!</strong>
                    <span>
                      We have received your submission and will get back to you
                      soon.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ap-again"
                    onClick={() => {
                      setForm(EMPTY)
                      setStatus('idle')
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="ap-form" onSubmit={submit} noValidate>
                  <label className="ap-field ap-field--half">
                    <span className="ap-label">Name</span>
                    <input
                      className="ap-input"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="ap-field ap-field--half">
                    <span className="ap-label">Phone</span>
                    <input
                      className="ap-input"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="Your phone"
                      autoComplete="tel"
                    />
                  </label>
                  <label className="ap-field">
                    <span className="ap-label">Email</span>
                    <input
                      className="ap-input"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label className="ap-field">
                    <span className="ap-label">Message</span>
                    <textarea
                      className="ap-input ap-input--area"
                      name="message"
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Tell us about your idea…"
                      rows={6}
                      required
                    />
                  </label>

                  {status === 'error' && (
                    <div className="ap-error" role="alert">
                      Please fill in your name, email, and message.
                    </div>
                  )}

                  <button type="submit" className="ap-submit">
                    Submit
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

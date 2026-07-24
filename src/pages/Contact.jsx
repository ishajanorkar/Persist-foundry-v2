import { useEffect, useState } from 'react'

/* ─────────────────────────────────────────────────────────────
   CONTACT — replica of persist.org/contact-us
   Left: headline + pitch. Right: Name / Phone / Email / Message.
   Styles live in index.css under the .ct-* namespace.
───────────────────────────────────────────────────────────── */

const EMPTY = { name: '', phone: '', email: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | success | error

  useEffect(() => {
    document.body.classList.add('is-loaded')
    const els = document.querySelectorAll('.ct-reveal')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const delay = parseInt(entry.target.dataset.delay || '0')
        setTimeout(() => entry.target.classList.add('is-visible'), delay)
        obs.unobserve(entry.target)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px 8% 0px' })

    els.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        const delay = parseInt(el.dataset.delay || '0')
        setTimeout(() => el.classList.add('is-visible'), delay)
      } else {
        obs.observe(el)
      }
    })

    return () => obs.disconnect()
  }, [])

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
      '_blank'
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
            {/* ── left copy ── */}
            <div className="ct-copy">
              <div className="ct-eyebrow ct-reveal" data-delay="0">
                <span className="ct-pip" />
                Contact Us
              </div>
              <h1 className="ct-headline ct-reveal" data-delay="80">
                Have an idea for us?
                <br />
                <em>Drop a line.</em>
              </h1>
              <p className="ct-sub ct-reveal" data-delay="180">
                We partner with entrepreneurs and businesses to help scale and grow their ideas.
                With employees in every sector a business can need, there&apos;s no better way to get a leg up.
              </p>
              <div className="ct-socials ct-reveal" data-delay="260">
                <a
                  href="https://www.linkedin.com/company/persist-ventures/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Persist on LinkedIn"
                >
                  LinkedIn
                </a>
                <a
                  href="https://www.instagram.com/persistventures/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Persist on Instagram"
                >
                  Instagram
                </a>
                <a
                  href="https://www.youtube.com/@persistventures"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Persist on YouTube"
                >
                  YouTube
                </a>
              </div>
            </div>

            {/* ── right form ── */}
            <div className="ct-panel ct-reveal" data-delay="160">
              {status === 'success' ? (
                <div className="ct-success" role="status">
                  <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M5.5 9l2.5 2.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <strong>Thank you!</strong>
                    <span>We have received your submission and will get back to you soon.</span>
                  </div>
                  <button
                    type="button"
                    className="ct-again"
                    onClick={() => { setForm(EMPTY); setStatus('idle') }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="ct-form" onSubmit={submit} noValidate>
                  {status === 'error' && (
                    <p className="ct-error" role="alert">
                      Oops! Please fill in your name, email, and message.
                    </p>
                  )}
                  <label className="ct-field">
                    <span>Name</span>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Name"
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="ct-field">
                    <span>Phone</span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="Phone"
                      autoComplete="tel"
                      required
                    />
                  </label>
                  <label className="ct-field ct-field--full">
                    <span>Email</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="Email"
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label className="ct-field ct-field--full">
                    <span>Message</span>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Message"
                      rows={6}
                      required
                    />
                  </label>
                  <button type="submit" className="ct-submit">
                    Submit
                    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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

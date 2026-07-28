import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CornerTicks from '../about/CornerTicks'
import {
  hasCareerSheet,
  submitCareerApplication,
} from '../lib/submitCareerApplication'

/* ─────────────────────────────────────────────────────────────
   CAREERS — replica of persist.org/careers:
   seven opportunity categories, each role with its own custom
   application form. Roles with a Google Sheet Apps Script URL
   (see submitCareerApplication.js) post there; others still use
   Make.com webhooks until wired one-by-one.
   Apply Now opens a popup modal. Styles: index.css (.cr-*)
───────────────────────────────────────────────────────────── */

const MAKE_BASE = 'https://hook.eu2.make.com'

/**
 * Each role: Make webhook (legacy) + video field name
 * (CFO uses applicant-loom-link; others use applicant-portfolio-link).
 * CFO → Google Sheet via VITE_CAREERS_CFO_SCRIPT_URL.
 */
const CATEGORIES = [
  {
    num: '01',
    name: 'Finance & Leadership',
    roles: [
      {
        id: 'careers-page-cfo',
        title: 'Chief Financial Officer (CFO)',
        desc: 'Lead financial strategy, fundraising, and growth planning.',
        webhook: `${MAKE_BASE}/19onyl3mpdoxychacal7ofjs41mdbc8s`,
        videoField: 'applicant-loom-link',
      },
      {
        id: 'careers-page-Venture-Fund-Manager',
        title: 'Venture Fund Manager',
        desc: 'Manage investments and drive returns across a diverse portfolio.',
        webhook: `${MAKE_BASE}/r999lvmky003ghb6ywpfrwvxg0d6tr4r`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'pv-accelerator-ceo',
        title: 'Persist Accelerator CEO',
        desc: 'Head our accelerator program and guide founders to success.',
        webhook: `${MAKE_BASE}/mqgsv3qshuclrr1jmabhwvi8nk4zwspf`,
        videoField: 'applicant-portfolio-link',
      },
    ],
  },
  {
    num: '02',
    name: 'Venture Builders & Founders',
    roles: [
      {
        id: 'startup-founder',
        title: 'Startup Founder',
        desc: "Launch and scale a venture with Persist's support and resources.",
        webhook: `${MAKE_BASE}/6i9fu0le9lylcxrzen9z8xsqc8wmtpt3`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'venture-studio-founder',
        title: 'Venture Studio Founder',
        desc: 'Build multiple startups within a shared venture studio model.',
        webhook: `${MAKE_BASE}/aphqymsia75xykm9q1pdtpkhcsvxrl5c`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'recruiting-company-founder',
        title: 'AI-Enabled Recruiting Company Founder',
        desc: 'Create a next-gen hiring platform powered by AI.',
        webhook: `${MAKE_BASE}/u4pwqnhkmdl4k6kse37tzvm21zbka2mv`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'token-launchpad-founder',
        title: 'Token Launchpad Founder',
        desc: 'Build and run a launchpad for emerging Web3 projects.',
        webhook: `${MAKE_BASE}/j5g09tocxdrngstcoxrnlr4kpppb9uue`,
        videoField: 'applicant-portfolio-link',
      },
    ],
  },
  {
    num: '03',
    name: 'Web3 & Emerging Tech',
    roles: [
      {
        id: 'web3-token-launching-expert',
        title: 'Web3 Token Launching Expert',
        desc: 'Design and execute token launches with impact.',
        webhook: `${MAKE_BASE}/w74d3xjybl6jc3da8mdhzcvp2jvh2554`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'web3-token-launchpad-founder',
        title: 'Token Launchpad Founder',
        desc: 'Found and grow a platform for token-based fundraising.',
        webhook: `${MAKE_BASE}/5j9r63elu68pkdybp44herzv73dk3h1x`,
        videoField: 'applicant-portfolio-link',
      },
    ],
  },
  {
    num: '04',
    name: 'Growth & Marketing',
    roles: [
      {
        id: 'growth-hacking-extraordinaire',
        title: 'Growth Hacking Extraordinaire',
        desc: 'Drive rapid growth through bold, creative strategies.',
        webhook: `${MAKE_BASE}/1rqro387bajs5tlwsy2f6sf5ow8346bw`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'influencer-venture-partner',
        title: 'Influencer Venture Partner',
        desc: 'Partner with creators to launch and scale new ventures.',
        webhook: `${MAKE_BASE}/6k7otj0uhndn4lhisbb1ok357cnxx4ox`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'sales-affiliate',
        title: 'Sales Affiliate',
        desc: 'Expand reach and revenue through sales-driven partnerships.',
        webhook: `${MAKE_BASE}/ma2qub9nteifzgbikcbopzes391l4j7p`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'marketing-affiliate',
        title: 'Marketing Affiliate',
        desc: 'Build awareness and leads with smart marketing campaigns.',
        webhook: `${MAKE_BASE}/uceyc8lrqf09zja8ufu5uufyjo7k0uos`,
        videoField: 'applicant-portfolio-link',
      },
    ],
  },
  {
    num: '05',
    name: 'Ambassadors & Partners',
    roles: [
      {
        id: 'uni-venture-amba',
        title: 'University Venture Ambassador (MIT, Stanford, Harvard)',
        desc: 'Source talent and ideas from top campuses.',
        webhook: `${MAKE_BASE}/gmkumzabhja8aw2o252sliioz6j3nn2n`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'san-fan-venture-partener',
        title: 'San Francisco Venture Partner',
        desc: 'Connect Persist Ventures with the Bay Area ecosystem.',
        webhook: `${MAKE_BASE}/rergdj6a7ntbjqkiwifcworizl65f9ak`,
        videoField: 'applicant-portfolio-link',
      },
    ],
  },
  {
    num: '06',
    name: 'Advisors & Mentors',
    roles: [
      {
        id: 'startup-advisor-mentor',
        title: 'Startup Advisor / Mentor',
        desc: 'Guide founders with hands-on expertise and insights.',
        webhook: `${MAKE_BASE}/um5oxhru7x5h17jbpvfma4ixyoymcjen`,
        videoField: 'applicant-portfolio-link',
      },
    ],
  },
  {
    num: '07',
    name: 'Purpose & Impact',
    roles: [
      {
        id: 'non-prophet-path',
        title: 'NonProphet Path',
        desc: 'Champion ventures that prioritize mission over profit.',
        webhook: `${MAKE_BASE}/wjpesnfy1fkppd9etsluwkmolkgn7yj1`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'operation-topv',
        title: 'Operation TopV',
        desc: 'Lead high-impact initiatives across ventures.',
        webhook: `${MAKE_BASE}/jo3g1ycx38n8j2pu4zqv5jimo3f1rgax`,
        videoField: 'applicant-portfolio-link',
      },
      {
        id: 'repair-the-world',
        title: 'Repair The World Maximalist',
        desc: 'Drive projects that create meaningful global change.',
        webhook: `${MAKE_BASE}/l0k3rtg69ynj7dveyfhkq3mb8eckor9k`,
        videoField: 'applicant-portfolio-link',
      },
    ],
  },
]

const ALL_ROLES = CATEGORIES.flatMap((c) => c.roles)

const EMPTY = {
  'applicant-name': '',
  'investors-email-2': '',
  linkedin: '',
  location: '',
  'salary-range': '',
  video: '',
}

/** Per-role application form — same fields as persist.org/careers,
 *  styled with shared .ap-* form language. */
function CareerRoleForm({ role }) {
  const reactId = useId()
  const iframeName = `careers-submit-${role.id}-${reactId.replace(/:/g, '')}`
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'submitting') return

    const name = form['applicant-name'].trim()
    const email = form['investors-email-2'].trim()
    const location = form.location.trim()
    const salary = form['salary-range'].trim()
    if (!name || !email || !location || !salary) {
      setErrorMsg('Please fill in name, email, location, and salary range.')
      setStatus('error')
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    // Prefer Google Sheet when this role has an Apps Script URL configured
    if (hasCareerSheet(role.id)) {
      try {
        await submitCareerApplication({
          roleId: role.id,
          roleTitle: role.title,
          fields: {
            fullName: name,
            email,
            linkedin: form.linkedin.trim(),
            location,
            salaryRange: salary,
            video: form.video.trim(),
            loomVideo: form.video.trim(),
            portfolioVideo: form.video.trim(),
            'applicant-loom-link': form.video.trim(),
            'applicant-portfolio-link': form.video.trim(),
            [role.videoField]: form.video.trim(),
          },
        })
        setStatus('success')
        setForm(EMPTY)
      } catch (err) {
        const msg =
          err instanceof Error && err.message
            ? err.message
            : 'Something went wrong submitting. Please try again.'
        setErrorMsg(msg)
        setStatus('error')
      }
      return
    }

    // Legacy: Webflow → Make via hidden iframe (avoids CORS)
    const body = new URLSearchParams()
    body.set('applicant-name', name)
    body.set('investors-email-2', email)
    if (form.linkedin.trim()) body.set('linkedin', form.linkedin.trim())
    body.set('location', location)
    body.set('salary-range', salary)
    if (form.video.trim()) body.set(role.videoField, form.video.trim())
    body.set('role-title', role.title)
    body.set('form-id', role.id)

    const iframe = document.getElementsByName(iframeName)[0]
    const ghost = document.createElement('form')
    ghost.method = 'POST'
    ghost.action = role.webhook
    ghost.target = iframeName
    ghost.style.display = 'none'
    for (const [k, v] of body.entries()) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = k
      input.value = v
      ghost.appendChild(input)
    }
    document.body.appendChild(ghost)
    ghost.submit()
    ghost.remove()

    window.setTimeout(() => {
      setStatus('success')
      setForm(EMPTY)
      if (iframe) iframe.src = 'about:blank'
    }, 700)
  }

  if (status === 'success') {
    return (
      <div className="ap-success" role="status">
        <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5.5 9l2.5 2.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <strong>Thanks for applying!</strong>
          <span>We will be in touch with you soon.</span>
        </div>
        <button type="button" className="ap-again" onClick={() => setStatus('idle')}>
          Submit another application
        </button>
      </div>
    )
  }

  return (
    <>
      <iframe
        name={iframeName}
        title=""
        className="cr-submit-frame"
        tabIndex={-1}
        aria-hidden="true"
      />
      <form className="ap-form" onSubmit={onSubmit} noValidate>
        <label className="ap-field ap-field--half">
          <span className="ap-label">Full Name</span>
          <input
            className="ap-input"
            type="text"
            name="applicant-name"
            value={form['applicant-name']}
            onChange={set('applicant-name')}
            placeholder="Enter your full Name"
            required
            maxLength={256}
            autoComplete="name"
            autoFocus
            disabled={status === 'submitting'}
          />
        </label>

        <label className="ap-field ap-field--half">
          <span className="ap-label">Email Address</span>
          <input
            className="ap-input"
            type="email"
            name="investors-email-2"
            value={form['investors-email-2']}
            onChange={set('investors-email-2')}
            placeholder="johndoe@gmail.com"
            required
            maxLength={256}
            autoComplete="email"
            disabled={status === 'submitting'}
          />
        </label>

        <label className="ap-field">
          <span className="ap-label">LinkedIn profile</span>
          <input
            className="ap-input"
            type="url"
            name="linkedin"
            value={form.linkedin}
            onChange={set('linkedin')}
            placeholder="https://www.linkedin.com/in/"
            maxLength={256}
            disabled={status === 'submitting'}
          />
        </label>

        <label className="ap-field ap-field--half">
          <span className="ap-label">Where are you currently based?</span>
          <input
            className="ap-input"
            type="text"
            name="location"
            value={form.location}
            onChange={set('location')}
            placeholder="City, Country (e.g., Toronto, Canada)"
            required
            maxLength={256}
            disabled={status === 'submitting'}
          />
        </label>

        <label className="ap-field ap-field--half">
          <span className="ap-label">What is your expected salary range?</span>
          <input
            className="ap-input"
            type="text"
            name="salary-range"
            value={form['salary-range']}
            onChange={set('salary-range')}
            placeholder="$120k–$150k per year"
            required
            maxLength={256}
            disabled={status === 'submitting'}
          />
        </label>

        <label className="ap-field">
          <span className="ap-label">
            Loom / Drive video pitch introducing yourself
          </span>
          <input
            className="ap-input"
            type="url"
            name={role.videoField}
            value={form.video}
            onChange={set('video')}
            placeholder="https://www.loom.com/share/…"
            maxLength={500}
            disabled={status === 'submitting'}
          />
          <span className="ap-help">Optional — 2–3 minutes.</span>
        </label>

        {status === 'error' && (
          <div className="ap-error" role="alert">
            {errorMsg || 'Please fill in name, email, location, and salary range.'}
          </div>
        )}

        <button
          type="submit"
          className="ap-submit"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? (
            <>
              <span className="ap-spinner" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </>
  )
}

function ApplyModal({ role, onClose }) {
  const panelRef = useRef(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div
      className="cr-modal"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="ap-panel cr-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`apply-title-${role.id}`}
        id={`apply-${role.id}`}
        ref={panelRef}
        tabIndex={-1}
      >
        <CornerTicks size={18} />
        <div className="cr-modal-head">
          <h4 className="cr-modal-title" id={`apply-title-${role.id}`}>
            Apply for {role.title}
          </h4>
          <button
            type="button"
            className="cr-modal-close"
            aria-label="Close application form"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <CareerRoleForm key={role.id} role={role} />
      </div>
    </div>,
    document.body,
  )
}

export default function Careers() {
  const [openRoleId, setOpenRoleId] = useState(null)
  const openRole = ALL_ROLES.find((r) => r.id === openRoleId) || null

  useEffect(() => {
    const els = document.querySelectorAll('.cr-reveal')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const delay = parseInt(entry.target.dataset.delay || '0', 10)
          setTimeout(() => entry.target.classList.add('is-visible'), delay)
          obs.unobserve(entry.target)
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -4% 0px' },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const closeForm = useCallback(() => setOpenRoleId(null), [])

  return (
    <div className="cr-page">
      {/* ══════════ HERO ══════════ */}
      <section className="cr-hero">
        <div className="cr-hero-grid" aria-hidden="true" />
        <div className="ab-blob ab-blob-1" aria-hidden="true" />
        <div className="ab-blob ab-blob-2" aria-hidden="true" />
        <div className="cr-hero-vignette" aria-hidden="true" />
        <div className="cr-inner cr-hero-inner">
          <div className="cr-eyebrow cr-reveal" data-delay="0">
            <span className="cr-pip" />
            Careers
          </div>
          <h1 className="cr-hero-headline cr-reveal" data-delay="100">
            Build the future <em>with Persist.</em>
          </h1>
          <p className="cr-hero-sub cr-reveal" data-delay="220">
            We&apos;re looking for ambitious leaders, builders, and innovators to join our global network.
          </p>
          <div className="cr-reveal" data-delay="320">
            <a
              className="cr-cta"
              href="#opportunities"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Explore Opportunities
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════ OPPORTUNITIES ══════════ */}
      <section className="cr-opps" id="opportunities">
        <div className="cr-inner">
          {CATEGORIES.map((cat, ci) => (
            <div className="cr-cat" key={cat.num}>
              <div className="cr-cat-head cr-reveal" data-delay="0">
                <span className="cr-cat-num">{cat.num}</span>
                <h2 className="cr-cat-name">{cat.name}</h2>
                <span className="cr-cat-count">
                  {cat.roles.length} {cat.roles.length === 1 ? 'role' : 'roles'}
                </span>
              </div>

              <div className="cr-grid">
                {cat.roles.map((role, ri) => (
                  <article
                    className="cr-role cr-reveal"
                    data-delay={String(ri * 60)}
                    key={role.id}
                    id={`role-${role.id}`}
                  >
                    <div className="cr-card">
                      <h3 className="cr-card-title">{role.title}</h3>
                      <p className="cr-card-desc">{role.desc}</p>
                      <button
                        type="button"
                        className="cr-card-apply"
                        aria-haspopup="dialog"
                        aria-expanded={openRoleId === role.id}
                        onClick={() => setOpenRoleId(role.id)}
                      >
                        Apply Now
                        <svg viewBox="0 0 16 16" fill="none" width="12" height="12" aria-hidden="true">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {ci < CATEGORIES.length - 1 && (
                <div className="cr-cat-divider" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>

      {openRole && <ApplyModal role={openRole} onClose={closeForm} />}
    </div>
  )
}

import { useEffect, useState } from 'react'

/* ─────────────────────────────────────────────────────────────
   CAREERS — replica of persist.org/careers: hero, seven numbered
   opportunity categories with role cards, and a single application
   form (role picker + the same fields the live site asks for).
   Styles live in index.css under the .cr-* namespace.
───────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    num: '01',
    name: 'Finance & Leadership',
    roles: [
      { title: 'Chief Financial Officer (CFO)', desc: 'Lead financial strategy, fundraising, and growth planning.' },
      { title: 'Venture Fund Manager', desc: 'Manage investments and drive returns across a diverse portfolio.' },
      { title: 'Persist Accelerator CEO', desc: 'Head our accelerator program and guide founders to success.' },
    ],
  },
  {
    num: '02',
    name: 'Venture Builders & Founders',
    roles: [
      { title: 'Startup Founder', desc: "Launch and scale a venture with Persist's support and resources." },
      { title: 'Venture Studio Founder', desc: 'Build multiple startups within a shared venture studio model.' },
      { title: 'AI-Enabled Recruiting Company Founder', desc: 'Create a next-gen hiring platform powered by AI.' },
      { title: 'Token Launchpad Founder', desc: 'Build and run a launchpad for emerging Web3 projects.' },
    ],
  },
  {
    num: '03',
    name: 'Web3 & Emerging Tech',
    roles: [
      { title: 'Web3 Token Launching Expert', desc: 'Design and execute token launches with impact.' },
      { title: 'Token Launchpad Founder', desc: 'Found and grow a platform for token-based fundraising.' },
    ],
  },
  {
    num: '04',
    name: 'Growth & Marketing',
    roles: [
      { title: 'Growth Hacking Extraordinaire', desc: 'Drive rapid growth through bold, creative strategies.' },
      { title: 'Influencer Venture Partner', desc: 'Partner with creators to launch and scale new ventures.' },
      { title: 'Sales Affiliate', desc: 'Expand reach and revenue through sales-driven partnerships.' },
      { title: 'Marketing Affiliate', desc: 'Build awareness and leads with smart marketing campaigns.' },
    ],
  },
  {
    num: '05',
    name: 'Ambassadors & Partners',
    roles: [
      { title: 'University Venture Ambassador (MIT, Stanford, Harvard)', desc: 'Source talent and ideas from top campuses.' },
      { title: 'San Francisco Venture Partner', desc: 'Connect Persist Ventures with the Bay Area ecosystem.' },
    ],
  },
  {
    num: '06',
    name: 'Advisors & Mentors',
    roles: [
      { title: 'Startup Advisor / Mentor', desc: 'Guide founders with hands-on expertise and insights.' },
    ],
  },
  {
    num: '07',
    name: 'Purpose & Impact',
    roles: [
      { title: 'NonProphet Path', desc: 'Champion ventures that prioritize mission over profit.' },
      { title: 'Operation TopV', desc: 'Lead high-impact initiatives across ventures.' },
      { title: 'Repair The World Maximalist', desc: 'Drive projects that create meaningful global change.' },
    ],
  },
]

const ALL_ROLES = CATEGORIES.flatMap((c) => c.roles.map((r) => `${r.title} — ${c.name}`))

const EMPTY_FORM = { role: '', name: '', email: '', linkedin: '', location: '', salary: '', video: '' }

export default function Careers() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle') // idle | success

  /* scroll reveal */
  useEffect(() => {
    const els = document.querySelectorAll('.cr-reveal')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const delay = parseInt(entry.target.dataset.delay || '0')
        setTimeout(() => entry.target.classList.add('is-visible'), delay)
        obs.unobserve(entry.target)
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' })
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const pickRole = (roleLabel) => {
    setForm((f) => ({ ...f, role: roleLabel }))
    setStatus('idle')
    document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const submit = (e) => {
    e.preventDefault()
    const body = [
      `Role: ${form.role}`,
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `LinkedIn: ${form.linkedin}`,
      `Based in: ${form.location}`,
      `Salary expectations: ${form.salary}`,
      form.video ? `Video pitch: ${form.video}` : null,
    ].filter(Boolean).join('\n')
    window.open(
      `mailto:apply@persist.foundry?subject=${encodeURIComponent(`Application — ${form.role || 'General'}`)}&body=${encodeURIComponent(body)}`,
      '_blank'
    )
    setStatus('success')
  }

  return (
    <div className="cr-page">
      {/* ══════════ HERO ══════════ */}
      <section className="cr-hero">
        <div className="cr-hero-grid" aria-hidden="true"></div>
        <div className="ab-blob ab-blob-1" aria-hidden="true"></div>
        <div className="ab-blob ab-blob-2" aria-hidden="true"></div>
        <div className="cr-hero-vignette" aria-hidden="true"></div>
        <div className="cr-inner cr-hero-inner">
          <div className="cr-eyebrow cr-reveal" data-delay="0">
            <span className="cr-pip"></span>
            Careers
          </div>
          <h1 className="cr-hero-headline cr-reveal" data-delay="100">
            Build the future <em>with Persist.</em>
          </h1>
          <p className="cr-hero-sub cr-reveal" data-delay="220">
            We're looking for ambitious leaders, builders, and innovators to join our global network.
          </p>
          <div className="cr-reveal" data-delay="320">
            <a
              className="cr-cta"
              href="#opportunities"
              onClick={(e) => { e.preventDefault(); document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Explore Opportunities
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════ OPPORTUNITY CATEGORIES ══════════ */}
      <section className="cr-opps" id="opportunities">
        <div className="cr-inner">
          {CATEGORIES.map((cat, ci) => (
            <div className="cr-cat" key={cat.num}>
              <div className="cr-cat-head cr-reveal" data-delay="0">
                <span className="cr-cat-num">{cat.num}</span>
                <h2 className="cr-cat-name">{cat.name}</h2>
                <span className="cr-cat-count">{cat.roles.length} {cat.roles.length === 1 ? 'role' : 'roles'}</span>
              </div>
              <div className="cr-grid">
                {cat.roles.map((role, ri) => (
                  <button
                    type="button"
                    className="cr-card cr-reveal"
                    data-delay={String(ri * 80)}
                    key={`${cat.num}-${role.title}`}
                    onClick={() => pickRole(`${role.title} — ${cat.name}`)}
                  >
                    <h3 className="cr-card-title">{role.title}</h3>
                    <p className="cr-card-desc">{role.desc}</p>
                    <span className="cr-card-apply">
                      Apply
                      <svg viewBox="0 0 16 16" fill="none" width="12" height="12" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
              {ci < CATEGORIES.length - 1 && <div className="cr-cat-divider" aria-hidden="true"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ APPLICATION FORM ══════════ */}
      <section className="cr-apply" id="apply-form">
        <div className="ab-blob ab-blob-cta-1" aria-hidden="true"></div>
        <div className="cr-inner cr-apply-inner">
          <div className="cr-eyebrow cr-eyebrow--center cr-reveal" data-delay="0">
            <span className="cr-pip"></span>
            Apply
          </div>
          <h2 className="cr-apply-headline cr-reveal" data-delay="80">
            Ready to <em>join us?</em>
          </h2>
          <p className="cr-apply-sub cr-reveal" data-delay="140">
            Pick a role, tell us who you are, and optionally add a 2–3 minute video pitch. We read everything.
          </p>

          {status === 'success' ? (
            <div className="cr-form-success" role="status">
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5.5 9l2.5 2.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <strong>Thanks for applying!</strong>
                <span>We will be in touch with you soon.</span>
              </div>
              <button type="button" className="cr-form-again" onClick={() => { setForm(EMPTY_FORM); setStatus('idle') }}>
                Submit another application
              </button>
            </div>
          ) : (
            <form className="cr-form cr-reveal" data-delay="200" onSubmit={submit}>
              <label className="cr-field cr-field--full">
                <span>Role</span>
                <select value={form.role} onChange={set('role')} required>
                  <option value="" disabled>Select the role you're applying for</option>
                  {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label className="cr-field">
                <span>Full Name</span>
                <input type="text" value={form.name} onChange={set('name')} placeholder="Your name" required />
              </label>
              <label className="cr-field">
                <span>Email Address</span>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
              </label>
              <label className="cr-field">
                <span>LinkedIn Profile</span>
                <input type="url" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/…" required />
              </label>
              <label className="cr-field">
                <span>Location</span>
                <input type="text" value={form.location} onChange={set('location')} placeholder="Where are you currently based?" required />
              </label>
              <label className="cr-field">
                <span>Salary Expectations</span>
                <input type="text" value={form.salary} onChange={set('salary')} placeholder="Your expectations" required />
              </label>
              <label className="cr-field">
                <span>Video Pitch <em>(optional)</em></span>
                <input type="url" value={form.video} onChange={set('video')} placeholder="Loom / Google Drive link, 2–3 minutes" />
              </label>
              <button type="submit" className="cr-cta cr-form-submit">
                Submit Application
                <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

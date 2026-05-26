import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* ── data ────────────────────────────────────────────────── */
const TOTAL = 13

const LEADERSHIP = [
  {
    idx: 1,
    name: 'Jack Jay',
    role: 'Chief Executive Officer',
    bio: 'Founded Persist in 2017 after witnessing the gap between the Thiel Fellowship\'s impact and its reach. Nine years building — still reads more pitch decks than novels.',
    x: 'jackjay',
    li: 'jack-jay-jackson-jesionowski',
    img: '/assets/jackjay.jpg',
  },
  {
    idx: 2,
    name: 'Bhavya Bansal',
    role: 'Chief Technology Officer',
    bio: 'Blends technical depth with strategic vision. Keeps Persist at the frontier of automation, engineering the infrastructure founders actually rely on.',
    x: null,
    li: 'bhavya-bansal',
    img: null,
  },
]

const ADVISORS = [
  {
    idx: 3,
    name: 'Brock Pierce',
    role: 'Advisor',
    bio: 'Crypto and futurism. Two decades of operator instinct and a philanthropic lens applied to every conversation — and every cap table.',
    x: 'brockpierce',
    li: 'brockpierce',
    img: null,
  },
  {
    idx: 4,
    name: 'Jeremy Gardner',
    role: 'Portfolio Founder & Adviser',
    bio: 'Augur. Ausum Ventures. Built and exited his first company at 22. Now helping ours find their own version of that.',
    x: 'disruptepreneur',
    li: 'jeremygardner',
    img: null,
  },
  {
    idx: 5,
    name: 'Christine Peterson',
    role: 'Advisor',
    bio: 'Co-founded the Foresight Institute. Coined the term "open source." Has been early to almost everything that matters.',
    x: 'christineapet',
    li: 'christine-peterson',
    img: null,
  },
  {
    idx: 6,
    name: 'Marvin Liao',
    role: 'Advisor',
    bio: '500 Startups partner. Yahoo lifer turned global investor. Quiet operator. Loud about founder pain.',
    x: 'marvinliao',
    li: 'marvinliao',
    img: null,
  },
  {
    idx: 7,
    name: 'Liza Mundy',
    role: 'Research',
    bio: 'Bestselling author. Joined Persist to study what conviction looks like in the first 18 months.',
    x: 'lizamundy',
    li: 'liza-mundy',
    img: null,
  },
  {
    idx: 8,
    name: 'Bruce Fenton',
    role: 'Advisor',
    bio: 'Bitcoin Foundation. Decades in capital markets. Helps founders navigate the first "no" and every one that follows.',
    x: 'brucefenton',
    li: 'brucefenton',
    img: null,
  },
  {
    idx: 9,
    name: 'Naveen Jain',
    role: 'Advisor',
    bio: 'Moon Express. Viome. Believes the only ceiling is the one founders agree to.',
    x: 'naveenjainceo',
    li: 'naveenjain',
    img: null,
  },
  {
    idx: 10,
    name: 'Chris Migliano',
    role: 'Advisor',
    bio: '20+ years in digital advertising. Launched and sold two companies to NASDAQ-listed firms. A sharp exit architect.',
    x: null,
    li: null,
    img: null,
  },
]

const OPERATIONS = [
  {
    idx: 11,
    name: 'Muskan Pandey',
    role: 'Head of Operations',
    bio: 'Combines operational excellence with an eye for emerging talent. The spine that keeps Persist moving.',
    x: null,
    li: null,
    img: null,
  },
  {
    idx: 12,
    name: 'Akash Mishra',
    role: 'Chief Design Officer',
    bio: 'Shapes the visual language defining every product under the Persist umbrella. Design as conviction.',
    x: null,
    li: null,
    img: null,
  },
  {
    idx: 13,
    name: 'Swapnil Sharma',
    role: 'Managing Director',
    bio: 'Champions technological innovation and team development across the portfolio. Builds from the inside out.',
    x: null,
    li: null,
    img: null,
  },
]

/* ── icons ───────────────────────────────────────────────── */
const LiIcon = () => (
  <svg className="tm-ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M3.4 13.6V6.2H1V13.6h2.4ZM2.2 5.2A1.4 1.4 0 1 0 2.2 2.4 1.4 1.4 0 0 0 2.2 5.2Zm12.8 8.4V9.5c0-2.3-1.2-3.4-2.9-3.4-1.3 0-1.9.7-2.3 1.3V6.2H7.4v7.4h2.4V9.5c0-.2 0-.5.1-.6.2-.5.6-1 1.4-1 1 0 1.4.7 1.4 1.8v3.9H15Z" />
  </svg>
)

const XIcon = () => (
  <svg className="tm-ico" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M9.5 6.8 14.6 1h-1.4l-4.4 5L5.3 1H1l5.4 7.7L1 15h1.4l4.7-5.4L11 15h4.4M2.8 2h2.1l9.6 12h-2.1" />
  </svg>
)

/* ── card ────────────────────────────────────────────────── */
function TeamCard({ person, revealDelay }) {
  const hasImg = !!person.img
  return (
    <div className="tm-card tm-reveal-el" data-delay={revealDelay || '0'}>
      {/* portrait */}
      <div className="tm-ph-frame">
        <div className={`tm-portrait${hasImg ? ' tm-portrait--photo' : ''}`}>
          {hasImg && (
            <img
              src={person.img}
              alt={person.name}
              className="tm-portrait-img"
            />
          )}
          <div className="tm-ph-name">{person.name.split(' ')[0]}</div>
        </div>
        {/* top-left index badge */}
        <div className="tm-idx" aria-hidden="true">
          <span className="tm-pip"></span>
          {String(person.idx).padStart(2, '0')}&thinsp;/&thinsp;{String(TOTAL).padStart(2, '0')}
        </div>
        {/* corner quote */}
        <div className="tm-corner" aria-hidden="true">&ldquo;</div>
      </div>

      {/* meta */}
      <div className="tm-meta">
        <div className="tm-role"><span className="tm-dash"></span>{person.role}</div>
        <h3 className="tm-name">{person.name}</h3>

        {/* hover-reveal bio + links */}
        <div className="tm-reveal">
          <div className="tm-reveal-inner">
            <div className="tm-rule"></div>
            <p>{person.bio}</p>
            {(person.li || person.x) && (
              <div className="tm-links">
                {person.li && (
                  <a
                    href={`https://www.linkedin.com/in/${person.li}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${person.name} on LinkedIn`}
                  >
                    <LiIcon />
                  </a>
                )}
                {person.x && (
                  <a
                    href={`https://x.com/${person.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${person.name} on X`}
                  >
                    <XIcon />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── page ────────────────────────────────────────────────── */
export default function Team() {
  const cursorRafRef = useRef(null)

  useEffect(() => {
    document.body.classList.add('is-loaded')

    /* custom cursor */
    const cursor = document.getElementById('cursor')
    let cursorX = 0, cursorY = 0, targetX = 0, targetY = 0
    const trackMouse = (e) => { targetX = e.clientX; targetY = e.clientY }
    document.addEventListener('mousemove', trackMouse)
    const tickCursor = () => {
      cursorX += (targetX - cursorX) * 0.18
      cursorY += (targetY - cursorY) * 0.18
      if (cursor) cursor.style.transform = `translate(${cursorX}px,${cursorY}px) translate(-50%,-50%)`
      cursorRafRef.current = requestAnimationFrame(tickCursor)
    }
    cursorRafRef.current = requestAnimationFrame(tickCursor)

    /* cursor hover swell */
    document.querySelectorAll('a, button, .tm-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor?.classList.add('is-hover'))
      el.addEventListener('mouseleave', () => cursor?.classList.remove('is-hover'))
    })

    /* magnetic buttons */
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect()
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.25}px)`
      })
      btn.addEventListener('mouseleave', () => { btn.style.transform = '' })
    })

    /* scroll reveal */
    const revealEls = document.querySelectorAll('.tm-reveal-el')
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const delay = parseInt(entry.target.dataset.delay || '0')
        setTimeout(() => entry.target.classList.add('is-visible'), delay)
        revealObs.unobserve(entry.target)
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
    revealEls.forEach(el => revealObs.observe(el))

    /* progress bar */
    const progressBar = document.getElementById('progress')
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (progressBar && total > 0) progressBar.style.width = (window.scrollY / total) * 100 + '%'
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    return () => {
      document.removeEventListener('mousemove', trackMouse)
      window.removeEventListener('scroll', updateProgress)
      if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current)
      revealObs.disconnect()
    }
  }, [])

  return (
    <>
      <div className="cursor" id="cursor"></div>
      <div className="progress" id="progress"></div>

      {/* ════════════════════════════════════════════
          HERO
          ════════════════════════════════════════════ */}
      <section className="tm-hero">
        <div className="tm-hero-grid-bg"></div>
        <div className="tm-blob tm-blob-1"></div>
        <div className="tm-blob tm-blob-2"></div>
        <div className="tm-hero-vignette"></div>

        <div className="tm-hero-inner">
          <div className="tm-hero-eyebrow tm-reveal-el" data-delay="0">
            <span className="tm-hero-pip"></span>
            Our Team &nbsp;·&nbsp; {String(TOTAL).padStart(2, '0')}
          </div>
          <h1 className="tm-hero-headline tm-reveal-el" data-delay="100">
            The people who<br />
            <em>said yes first.</em>
          </h1>
          <p className="tm-hero-sub tm-reveal-el" data-delay="220">
            Operators, advisors, researchers, and builders who bet on this
            ecosystem before it was obvious.
          </p>
          <div className="tm-hero-tags tm-reveal-el" data-delay="320">
            <span>Operators</span>
            <span className="tm-hero-sep">·</span>
            <b>investors</b>
            <span className="tm-hero-sep">·</span>
            <span>researchers</span>
            <span className="tm-hero-sep">·</span>
            <b>builders</b>
          </div>
        </div>

        <div className="tm-hero-scroll" aria-hidden="true">
          Scroll
          <div className="tm-hero-scroll-line"></div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          LEADERSHIP
          ════════════════════════════════════════════ */}
      <section className="tm-section">
        <div className="tm-section-inner">
          <div className="tm-head tm-reveal-el" data-delay="0">
            <div className="tm-head-left">
              <div className="tm-kicker">
                <span className="tm-kicker-dash"></span>
                <span className="tm-kicker-pip"></span>
                Leadership &nbsp;·&nbsp; {String(LEADERSHIP.length).padStart(2, '0')}
              </div>
              <h2 className="tm-head-h2">The founding vision.<br /><em>Where it all starts.</em></h2>
            </div>
            <div className="tm-head-right">
              Founders<br /><b>operators · builders</b><br />since 2017
            </div>
          </div>

          <div className="tm-grid tm-grid--2">
            {LEADERSHIP.map((p, i) => (
              <TeamCard key={p.idx} person={p} revealDelay={String(i * 110)} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ADVISORS & BOARD
          ════════════════════════════════════════════ */}
      <section className="tm-section tm-section--alt">
        <div className="tm-section-inner">
          <div className="tm-head tm-reveal-el" data-delay="0">
            <div className="tm-head-left">
              <div className="tm-kicker">
                <span className="tm-kicker-dash"></span>
                <span className="tm-kicker-pip"></span>
                Advisors &amp; Board &nbsp;·&nbsp; {String(ADVISORS.length).padStart(2, '0')}
              </div>
              <h2 className="tm-head-h2">Forged at the foundry.<br /><em>Eight quiet hands.</em></h2>
            </div>
            <div className="tm-head-right">
              Operators<br /><b>investors · researchers</b><br />writers · friends
            </div>
          </div>

          <div className="tm-grid">
            {ADVISORS.map((p, i) => (
              <TeamCard key={p.idx} person={p} revealDelay={String((i % 4) * 85)} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CORE OPERATIONS
          ════════════════════════════════════════════ */}
      <section className="tm-section">
        <div className="tm-section-inner">
          <div className="tm-head tm-reveal-el" data-delay="0">
            <div className="tm-head-left">
              <div className="tm-kicker">
                <span className="tm-kicker-dash"></span>
                <span className="tm-kicker-pip"></span>
                Core Operations &nbsp;·&nbsp; {String(OPERATIONS.length).padStart(2, '0')}
              </div>
              <h2 className="tm-head-h2">The people<br /><em>behind the scenes.</em></h2>
            </div>
            <div className="tm-head-right">
              Operations<br /><b>design · engineering</b><br />management
            </div>
          </div>

          <div className="tm-grid tm-grid--3">
            {OPERATIONS.map((p, i) => (
              <TeamCard key={p.idx} person={p} revealDelay={String(i * 90)} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          JOIN CTA
          ════════════════════════════════════════════ */}
      <section className="tm-join">
        <div className="tm-join-grid"></div>
        <div className="tm-blob tm-blob-join"></div>
        <div className="tm-join-inner">
          <div className="tm-join-eyebrow tm-reveal-el" data-delay="0">
            <span className="tm-kicker-dash"></span>
            <span className="tm-kicker-pip"></span>
            Join the team
          </div>
          <h2 className="tm-join-headline tm-reveal-el" data-delay="100">
            Think you belong<br /><em>on this list?</em>
          </h2>
          <p className="tm-join-sub tm-reveal-el" data-delay="200">
            We're always looking for operators, advisors, and founders who want
            to build something worth building.
          </p>
          <Link
            to="/#apply"
            className="tm-join-btn tm-reveal-el"
            data-delay="300"
            data-magnetic
          >
            Apply For Fellowship
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  )
}

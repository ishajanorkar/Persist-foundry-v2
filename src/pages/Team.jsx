import { useEffect } from 'react'
import { Link } from 'react-router-dom'

/* ── data (order + copy from persist.org/our-team) ─────────
   Photos live in /public/assets/team/ (B&W filter applied in CSS).
   LinkedIn slugs synced from persist.org/our-team (members without
   a LinkedIn link on that page stay null).
   ────────────────────────────────────────────────────────── */
const TEAM = [
  {
    name: 'Jack Jay',
    role: 'Chief Executive Officer',
    bio: 'The visionary behind Persist Foundry, transforms talent recruitment and entrepreneurship with his dedication to fostering innovation and driving societal progress.',
    x: 'jackjay',
    li: 'jack-jay-jackson-jesionowski',
    img: '/assets/jackjay.jpg',
  },
  {
    name: 'Jeremy Gardner',
    role: 'Portfolio Founder',
    bio: 'Adviser at Persist Foundry, enriches our strategies with his pioneering cryptocurrency insights, from founding Augur to early Bitcoin investments, guiding us toward innovative growth.',
    x: 'disruptepreneur',
    li: 'jg1578',
    img: '/assets/team/jeremy-gardner.png',
  },
  {
    name: 'Christine Peterson',
    role: 'Advisor',
    bio: 'Chief Strategy Officer at Persist Foundry, former co-founder of the Foresight Institute and originator of "open source," steering us toward innovative futures.',
    x: 'christineapet',
    li: 'christine-peterson-3b81',
    img: '/assets/team/christine-peterson.png',
  },
  {
    name: 'Chris Migliano',
    role: 'Advisor',
    bio: 'Advisor at Persist Ventures, Chris leverages over 20 years in digital advertising, having launched and sold two companies to NASDAQ-listed firms, enriching our strategies with his deep understanding of technology and brands.',
    x: null,
    li: null,
    img: '/assets/team/chris-migliano.png',
  },
  {
    name: 'Sydney Thackray',
    role: 'Advisor',
    bio: null,
    x: null,
    li: 'sydney-thackray-777291282',
    img: '/assets/team/sydney-thackray.png',
  },
  {
    name: 'Michael Beer',
    role: 'Advisor',
    bio: null,
    x: null,
    li: 'michaelwbeer',
    img: '/assets/team/michael-beer.png',
  },
  {
    name: 'Mari Ross',
    role: 'CPA',
    bio: null,
    x: null,
    li: null,
    img: '/assets/team/mari-ross.png',
  },
  {
    name: 'Court Coursey',
    role: 'Advisor',
    bio: 'Managing Partner at TomorrowVentures, LLC, focusing on strategic investments and innovation in emerging industries.',
    x: null,
    li: 'courtcoursey',
    img: '/assets/team/court-coursey.png',
  },
  {
    name: 'Bryan Pope',
    role: 'Advisor',
    bio: 'Partner at Edge Healthcare Partners, specializing in healthcare investment banking and strategic advisory services.',
    x: null,
    li: 'bryan-pope-1b08466',
    img: '/assets/team/bryan-pope.png',
  },
  {
    name: 'Craig Sellars',
    role: 'Investor',
    bio: null,
    x: null,
    li: 'craigcsellars',
    img: '/assets/team/craig-sellars.png',
  },
  {
    name: 'Thomas Hessler',
    role: 'Investor',
    bio: null,
    x: null,
    li: 'thomashessler',
    img: '/assets/team/thomas-hessler.png',
  },
  {
    name: 'Claire Jing Sui',
    role: 'Investor',
    bio: null,
    x: null,
    li: 'claire-jing-1a3162248',
    img: '/assets/team/claire-jing.png',
  },
  {
    name: 'Bhavya Bansal',
    role: 'Chief Technology Officer',
    bio: 'Bhavya, our CTO, seamlessly blends technical expertise with strategic vision, leading our tech-forward approach through innovative thinking.',
    x: null,
    li: 'bhavya-bansal98',
    img: '/assets/team/bhavya-bansal.png',
  },
  {
    name: 'Muskan Pandey',
    role: 'Head of Operations',
    bio: 'As Head of Operations, Muskan combines sharp operational skills with fresh, innovative thinking reflecting our dedication to new perspectives and the growth of young talent.',
    x: null,
    li: 'muskan-pandey-51a176245',
    img: '/assets/team/muskan-pandey.png',
  },
  {
    name: 'Yogita Gehani',
    role: 'Operations Manager',
    bio: null,
    x: null,
    li: 'yogita-gehani',
    img: '/assets/team/yogita-gehani.png',
  },
  {
    name: 'Pratham Mangla',
    role: 'Head of Project Management',
    bio: null,
    x: null,
    li: 'pratham-mangla-ba6110237',
    img: '/assets/team/pratham-mangla.png',
  },
  {
    name: 'Akash Mishra',
    role: 'Chief Design Officer',
    bio: null,
    x: 'akash1_mishra',
    li: 'akash-mishra-xd',
    img: '/assets/team/akash-mishra.png',
  },
  {
    name: 'Michael Dadzie',
    role: 'Head of Mobile Engineering',
    bio: 'Michael, leading mobile engineering at Persist Foundry for three years, blends technical expertise with innovation, driving our mobile solutions to new heights.',
    x: null,
    li: 'michaeldadzie',
    img: '/assets/team/michael-dadzie.png',
  },
  {
    name: 'Shagun Yadav',
    role: 'Assistant Project Manager',
    bio: null,
    x: null,
    li: 'shagun-yadav-00b584256',
    img: '/assets/team/shagun-yadav.png',
  },
  {
    name: 'Mohit Kumar',
    role: 'Creative Solution Manager',
    bio: null,
    x: null,
    li: 'mohitkhere',
    img: '/assets/team/mohit-kumar.png',
  },
  {
    name: 'Nayan Patil',
    role: 'CEO, Startupathon',
    bio: null,
    x: null,
    li: 'nayan-patil-496b28201',
    img: '/assets/team/nayan-patil.png',
  },
  {
    name: 'Jorge Martín Poza',
    role: 'Co-founder, Palantir For Creators',
    bio: null,
    x: null,
    li: 'jorgepoza',
    img: '/assets/team/jorge-martin-poza.png',
  },
  {
    name: 'Onirudda Islam',
    role: 'Co-founder, Meme Mates',
    bio: null,
    x: null,
    li: 'onirudda-islam',
    img: '/assets/team/onirudda-islam.png',
  },
  {
    name: 'Felicien Bamporineza',
    role: 'Co-founder, WestX',
    bio: null,
    x: null,
    li: 'felicien-bamporineza-cfa-54b437186',
    img: '/assets/team/felicien-bamporineza.png',
  },
  {
    name: 'Kejun (Albert) Ying',
    role: 'Co-founder, Real Estate AI',
    bio: null,
    x: null,
    li: 'kejun-albert-ying',
    img: '/assets/team/kejun-ying.png',
  },
  {
    name: 'Ravikiran G',
    role: 'Senior Video Editor',
    bio: null,
    x: null,
    li: 'ravikiranrk',
    img: '/assets/team/ravikiran.png',
  },
  {
    name: 'Mohd Adil Sameer',
    role: 'CTO of Facesearch AI',
    bio: null,
    x: null,
    li: 'adilsameer',
    img: '/assets/team/adil-sameer.png',
  },
  {
    name: 'Naman Jain',
    role: 'Senior Backend & Web3 Engineer',
    bio: null,
    x: null,
    li: 'naman-jain-444a3b266',
    img: '/assets/team/naman-jain.png',
  },
  {
    name: 'Shahdab Malik',
    role: 'Full Stack Developer',
    bio: 'Shahdab, a standout Lead Full Stack Developer, merges technical expertise with forward-looking strategies, showcasing our commitment to innovation and nurturing emerging talent.',
    x: null,
    li: 'shahdab-malik',
    img: '/assets/team/shahdab-malik.png',
  },
  {
    name: 'Harjobandeep Singh',
    role: 'Co-founder, GIF Studios',
    bio: null,
    x: null,
    li: 'harjobandeep-singh',
    img: '/assets/team/harjobandeep-singh.png',
  },
  {
    name: 'Akash Laha',
    role: 'Co-Founder, FaceSearch AI',
    bio: null,
    x: null,
    li: 'akash-laha-dev',
    img: '/assets/team/akash-laha.png',
  },
  {
    name: 'Haseeb Zaki',
    role: 'Co-founder, Shorts-lol',
    bio: null,
    x: null,
    li: 'haseebzaki',
    img: '/assets/team/haseeb-zaki.png',
  },
  {
    name: 'Vishesh Gupta',
    role: 'Co-founder, Game of Creators',
    bio: null,
    x: null,
    li: 'vishesh-gupta-a34111209',
    img: '/assets/team/vishesh-gupta.png',
  },
  {
    name: 'Jatin Sharma',
    role: 'Co-founder, Career Accelerator',
    bio: null,
    x: null,
    li: 'jatinn-sharmaa',
    img: '/assets/team/jatin-sharma.png',
  },
  {
    name: 'Ankit Sahal',
    role: 'Co-founder, Career Accelerator',
    bio: null,
    x: null,
    li: 'ankit-sahal',
    img: '/assets/team/ankit-sahal.png',
  },
  {
    name: 'Raghavendra Reddy N',
    role: 'Co-Founder, Meme Mates',
    bio: null,
    x: null,
    li: 'raghavendra-reddy-n-319690221',
    img: '/assets/team/raghavendra-reddy.png',
  },
  {
    name: 'Nilesh Kumar',
    role: 'Co-founder, Deepvid ai',
    bio: null,
    x: null,
    li: 'aiwithnilesh',
    img: '/assets/team/nilesh-kumar.png',
  },
  {
    name: 'Shubham Pawar',
    role: 'Software developer',
    bio: null,
    x: null,
    li: null,
    img: '/assets/team/shubham-pawar.png',
  },
  {
    name: 'Isha Janorkar',
    role: 'Web Developer',
    bio: null,
    x: null,
    li: 'isha-janorkar-b72500231',
    img: '/assets/team/isha-janorkar.png',
  },
  {
    name: 'Mian Bilal',
    role: 'Web Developer',
    bio: null,
    x: null,
    li: 'main-bilal',
    img: '/assets/team/mian-bilal.png',
  },
  {
    name: 'Mary Rose Fabillar',
    role: 'Webflow Developer',
    bio: null,
    x: null,
    li: 'mary-rose-fabillar',
    img: '/assets/team/mary-rose-fabillar.png',
  },
  {
    name: 'Lalit Choudhary',
    role: 'Web Developer',
    bio: null,
    x: null,
    li: 'lalit-choudhary-7b6653205',
    img: '/assets/team/lalit-choudhary.png',
  },
  {
    name: 'Mahesh Jadhav',
    role: 'Web Developer',
    bio: null,
    x: null,
    li: null,
    img: '/assets/team/mahesh-jadhav.png',
  },
  {
    name: 'Prashasti Randive',
    role: 'Full-stack Developer',
    bio: null,
    x: null,
    li: 'prashasti-randive-43b269207',
    img: '/assets/team/prashasti-randive.png',
  },
  {
    name: 'Naval Thanik',
    role: 'Graphic Designer',
    bio: null,
    x: null,
    li: 'navalthanik',
    img: '/assets/team/naval-thanik.png',
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
  const hasBio = !!person.bio
  const hasSocials = !!(person.li || person.x)
  return (
    <div className="tm-card tm-reveal-el" data-delay={revealDelay || '0'}>

      {/* full-bleed portrait */}
      <div className={`tm-portrait${hasImg ? ' tm-portrait--photo' : ''}`}>
        {hasImg && (
          <img
            src={person.img}
            alt={person.name}
            className="tm-portrait-img"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="tm-ph-name">{person.name.split(' ')[0]}</div>
      </div>

      {/* gradient scrim */}
      <div className="tm-scrim" aria-hidden="true"></div>

      {/* Bottom stack: Name → role → (hover) bio → socials */}
      <div className="tm-content">
        <h3 className="tm-name">{person.name}</h3>
        <div className="tm-role">{person.role}</div>
        <div className="tm-hover">
          <div className="tm-hairline" aria-hidden="true"></div>
          {hasBio && <p className="tm-bio">{person.bio}</p>}
          {hasSocials && (
            <div className="tm-socials">
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
  )
}

/* ── page ────────────────────────────────────────────────── */
export default function Team() {
  useEffect(() => {
    document.body.classList.add('is-loaded')

    /* magnetic buttons */
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect()
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.25}px)`
      })
      btn.addEventListener('mouseleave', () => { btn.style.transform = '' })
    })

    /* scroll reveal */
    /* scroll-reveal — observe + immediately reveal anything already on-screen */
    const revealEls = document.querySelectorAll('.tm-reveal-el')
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const delay = parseInt(entry.target.dataset.delay || '0')
        setTimeout(() => entry.target.classList.add('is-visible'), delay)
        revealObs.unobserve(entry.target)
      })
    }, { threshold: 0.05, rootMargin: '0px 0px 10% 0px' })
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.95 && rect.bottom > 0
      if (inView) {
        const delay = parseInt(el.dataset.delay || '0')
        setTimeout(() => el.classList.add('is-visible'), delay)
      } else {
        revealObs.observe(el)
      }
    })

    /* progress bar */
    const progressBar = document.getElementById('progress')
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (progressBar && total > 0) progressBar.style.width = (window.scrollY / total) * 100 + '%'
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener('scroll', updateProgress)
      revealObs.disconnect()
    }
  }, [])

  return (
    <>
      <div className="progress" id="progress"></div>

      {/* ════════════════════════════════════════════
          ALL MEMBERS — single unified grid
          ════════════════════════════════════════════ */}
      <section className="tm-section tm-section--first">
        <div className="tm-section-inner">

          {/* page header */}
          <div className="tm-page-head tm-reveal-el" data-delay="0">
            <div className="tm-page-kicker">
              <span className="tm-kicker-dash"></span>
              <span className="tm-kicker-pip"></span>
              Our Team
            </div>
            <h1 className="tm-page-headline">Team Persist</h1>
            <p className="tm-page-sub">
              Operators, advisors, and builders. The quiet hands behind every bet we make.
            </p>
          </div>

          <div className="tm-grid">
            {TEAM.map((p, i) => (
              <TeamCard key={p.name} person={p} revealDelay={String((i % 4) * 70)} />
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
            to="/fellowship-program-application"
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

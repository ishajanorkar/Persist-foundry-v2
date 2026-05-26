import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const METHOD_CARDS = [
  {
    num: '01',
    title: 'Customized Learning',
    desc: 'Tailoring education to fit each individual\'s unique goals and circumstances.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Diverse Goals Support',
    desc: 'Resources and expertise for everything from startups to skill acquisition.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/>
        <circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/>
        <path d="M6 7l4 3M18 7l-4 3M6 17l4-3M18 17l-4-3"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Broad Support Network',
    desc: 'Access to mentors, funding, and hands-on experience.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="9" cy="8" r="4"/><circle cx="17" cy="10" r="3"/>
        <path d="M3 20v-1.5a4 4 0 014-4h4a4 4 0 014 4V20M22 20v-1a3 3 0 00-2-2.83"/>
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Enhanced Education',
    desc: 'Tools and resources to elevate your learning journey.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M4 4h13a3 3 0 013 3v13M4 4v16h16M4 4l8 8 4-4 4 4"/>
      </svg>
    ),
  },
]

const HOW_STEPS = [
  {
    num: '01',
    title: 'Select Your Startup Idea',
    desc: 'Start with a curated list of startup ideas, choose your top three, or pitch an original idea inspired by or beyond the list for a personalized journey.',
  },
  {
    num: '02',
    title: 'Idea Approval and Course Material',
    desc: "After selecting or pitching your idea, receive team's approval, then get comprehensive course materials to navigate your entrepreneurial journey effectively.",
  },
  {
    num: '03',
    title: 'Progress Updates and Community Engagement',
    desc: 'Document your entrepreneurial venture with daily videos, sharing your progress, obstacles, and breakthroughs. This practice cultivates a supportive community atmosphere, encouraging feedback and insights from peers and mentors.',
  },
]

export default function About() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Mark body as loaded (no loader on this page)
    document.body.classList.add('is-loaded')

    /* ── CUSTOM CURSOR ─────────────────────────────────── */
    const cursor = document.getElementById('cursor')
    let cursorX = 0, cursorY = 0, targetX = 0, targetY = 0
    const onMouseMove = (e) => { targetX = e.clientX; targetY = e.clientY }
    document.addEventListener('mousemove', onMouseMove)
    function animateCursor() {
      cursorX += (targetX - cursorX) * 0.18
      cursorY += (targetY - cursorY) * 0.18
      if (cursor) cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`
      requestAnimationFrame(animateCursor)
    }
    animateCursor()
    document.querySelectorAll('a, button, .ab-method-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor?.classList.add('is-hover'))
      el.addEventListener('mouseleave', () => cursor?.classList.remove('is-hover'))
    })

    /* ── MAGNETIC BUTTONS ──────────────────────────────── */
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`
      })
      btn.addEventListener('mouseleave', () => { btn.style.transform = '' })
    })

    /* ── SCROLL REVEAL ─────────────────────────────────── */
    const revealEls = document.querySelectorAll('.ab-reveal')
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0')
          setTimeout(() => entry.target.classList.add('is-visible'), delay)
          revealObs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' })
    revealEls.forEach(el => revealObs.observe(el))

    /* ── PROGRESS BAR ──────────────────────────────────── */
    const progressBar = document.getElementById('progress')
    function updateProgress() {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (progressBar) progressBar.style.width = (window.scrollY / totalScroll) * 100 + '%'
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', updateProgress)
    }
  }, [])

  return (
    <>
      <div className="cursor" id="cursor"></div>
      <div className="progress" id="progress"></div>

      {/* ── HERO ── */}
      <section className="ab-hero">
        <div className="ab-hero-grid-bg"></div>
        <div className="ab-hero-glow"></div>
        <div className="ab-hero-vignette"></div>

        <div className="ab-hero-inner">
          <div className="ab-hero-eyebrow ab-reveal" data-delay="0">
            <span className="ab-hero-pip"></span>
            About Us
          </div>
          <h1 className="ab-hero-headline ab-reveal" data-delay="100">
            We help convert startup visions into{' '}
            <em>constructed, deployed,<br className="ab-hero-br" />and funded actualities.</em>
          </h1>
          <p className="ab-hero-sub ab-reveal" data-delay="230">
            Persist Ventures is a conglomerate with teams and services that efficiently
            meet business needs from A to Z.
          </p>
          <div className="ab-hero-actions ab-reveal" data-delay="340">
            <Link to="/#apply" className="ab-hero-cta" data-magnetic>
              Apply For Fellowship
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>

        <div className="ab-hero-scroll">
          Scroll
          <div className="ab-hero-scroll-line"></div>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="ab-about">
        <div className="ab-about-inner">
          <div className="ab-about-left">
            <div className="ab-eyebrow ab-reveal" data-delay="0">01 / Who we are</div>
            <h2 className="ab-about-headline ab-reveal" data-delay="80">
              Built for founders<br />who refuse to stop.
            </h2>
          </div>
          <div className="ab-about-right">
            <p className="ab-about-body ab-reveal" data-delay="0">
              Persist Ventures is a conglomerate with teams and services that efficiently
              meet business needs from A to Z. We search for great founder potential and
              give salaries to kickstart founding teams, form strategic partnerships with
              existing companies, and convert ideas into realties.
            </p>
            <p className="ab-about-body ab-reveal" data-delay="80">
              We facilitate the journey of entrepreneurs from initial ideas to fully developed,
              launched, funded, profitable, and exited companies. Our program is designed to
              suit various ambitions, from launching startups to learning new skills. With
              access to mentors, advisors, funding, designers, builders, recruiters, internal
              software, and loads of practical experience, we offer extensive resources and
              support to elevate the journey of our portfolio's success, ensuring they have
              what it takes to succeed.
            </p>
            <p className="ab-about-bold ab-reveal" data-delay="160">
              We help convert startup visions into constructed, deployed, and funded actualities.
            </p>
            <p className="ab-about-body ab-reveal" data-delay="200">
              We're dedicated to a flexible, personalized education, understanding each
              person's unique goals and needs. With access to mentors, advisors, funding,
              and practical experience, we offer extensive resources and support to elevate
              your educational journey, ensuring you have what it takes to succeed.
            </p>
          </div>
        </div>
      </section>

      {/* ── OUR PURPOSE ── */}
      <section className="ab-purpose">
        <div className="ab-purpose-inner">
          <div className="ab-eyebrow ab-eyebrow--center ab-reveal" data-delay="0">02 / Our Purpose</div>
          <h2 className="ab-purpose-headline ab-reveal" data-delay="100">
            To make launching and succeeding<br />
            in startups achievable for everyone.
          </h2>
          <p className="ab-purpose-subline ab-reveal" data-delay="180">
            Because startups are meant for all.
          </p>
          <div className="ab-purpose-body">
            <p className="ab-reveal" data-delay="0">
              Persist Ventures is revolutionizing the startup ecosystem by challenging
              traditional success paradigms. Dedicated to supporting the overlooked and
              credential-less, we offer an inclusive platform that democratizes access to
              resources and support for all, regardless of background or social standing.
            </p>
            <p className="ab-reveal" data-delay="60">
              Rejecting the notion that startup success is reserved for the Silicon Valley
              elite or those born into affluence, we cater to a diverse audience, from
              hardworking individuals across America to eager young professionals starting
              their journey. Our mission is to dismantle barriers to innovation by
              empowering every aspiring entrepreneur with the tools to succeed.
            </p>
            <p className="ab-reveal" data-delay="120">
              By nurturing potential and fostering talent without discrimination, Persist
              Ventures aims to create a new model for success that values determination and
              innovation over pedigree. We stand as a beacon of hope, proving that with the
              right support, anyone can turn their vision into a thriving, funded reality,
              making a real difference in the world.
            </p>
          </div>
        </div>
      </section>

      {/* ── OUR METHODOLOGY ── */}
      <section className="ab-method">
        <div className="ab-method-inner">
          <div className="ab-method-header">
            <div className="ab-eyebrow ab-reveal" data-delay="0">03 / Our Methodology</div>
            <h2 className="ab-method-headline ab-reveal" data-delay="80">
              An incubator tailored<br /><em>to your needs.</em>
            </h2>
            <p className="ab-method-sub ab-reveal" data-delay="140">
              Create your startup according to your own rules.
            </p>
          </div>
          <p className="ab-method-body ab-reveal" data-delay="0">
            We're dedicated to a flexible, personalized education, understanding each
            student's unique goals and needs. Our program is designed to suit various
            ambitions, from launching startups to learning new skills. With access to
            mentors, advisors, funding, and practical experience, we offer extensive
            resources and support to elevate your educational journey, ensuring you have
            what it takes to succeed.
          </p>
          <div className="ab-method-grid">
            {METHOD_CARDS.map((card, i) => (
              <div className="ab-method-card ab-reveal" key={card.num} data-delay={String(i * 90)}>
                <div className="ab-method-card-top">
                  <div className="ab-method-card-num">{card.num}</div>
                  <div className="ab-method-card-icon">{card.icon}</div>
                </div>
                <h3 className="ab-method-card-title">{card.title}</h3>
                <p className="ab-method-card-desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="ab-how">
        <div className="ab-how-inner">
          <div className="ab-how-header">
            <div className="ab-eyebrow ab-reveal" data-delay="0">04 / How It Works</div>
            <h2 className="ab-how-headline ab-reveal" data-delay="80">
              Fueling Ambitious Startups:<br />
              <em>The Roadmap to Attracting Venture Capital</em>
            </h2>
            <p className="ab-how-sub ab-reveal" data-delay="140">Turning Bold Ideas into Fundable Ventures</p>
            <p className="ab-how-body ab-reveal" data-delay="200">
              With the right connections, a great amount of focus and drive, and a venture
              back-able idea. A venture back-able idea is a specific idea venture capitalists
              want to back. Not every business we put will necessarily be venture back-able,
              but if your goal is to dream really big, that is the best path.
            </p>
          </div>
          <div className="ab-how-steps">
            {HOW_STEPS.map((step, i) => (
              <div className="ab-how-step ab-reveal" key={step.num} data-delay={String(i * 120)}>
                <div className="ab-how-step-num">{step.num}</div>
                <div className="ab-how-step-body">
                  <h3 className="ab-how-step-title">{step.title}</h3>
                  <p className="ab-how-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="ab-story">
        <div className="ab-story-inner">
          <div className="ab-story-header">
            <div className="ab-eyebrow ab-reveal" data-delay="0">05 / Our Story</div>
            <h2 className="ab-story-headline ab-reveal" data-delay="80">
              The journey<br /><em>behind Persist.</em>
            </h2>
          </div>

          <div className="ab-story-body">
            <p className="ab-reveal" data-delay="0">
              The original idea for Persist originated in 2017 after witnessing the success
              of the non-profit Thiel Fellowship who gave 100k to the best college kids if
              they dropped out to work on their idea. While many applicants applied and
              would have added to the enormous success, only 20 people a year are selected.
            </p>

            <blockquote className="ab-story-quote ab-reveal" data-delay="60">
              "Peter Thiel's fellowship program has birthed power players worth more than
              $220 billion collectively, including design soft"
              <cite>— Business Insider, 2022</cite>
            </blockquote>

            <p className="ab-reveal" data-delay="0">
              With 220 people at 100k grants, a total of 22 million dollars generated $220
              Billion dollars of portfolio value. Yet given its a charity, they do not profit
              from the service and thus do not accept the tens of thousands of extra
              applicants hungry to prove their worth. Many of which would have been great to
              have been selected...
            </p>

            <p className="ab-story-question ab-reveal" data-delay="60">
              How do I know this?
            </p>

            <p className="ab-reveal" data-delay="0">
              My names Jack Jay, I'm the founder of Persist Ventures and I was not accepted
              into Thiel Fellowship. Yet the ultimate the idea originated as I was applying
              while a freshman year of college in 2017 and already saw the lack of this
              business model being widespread with talent recruiting not even being close to
              the much smaller capitalized football industry. I originally began applying
              with the idea to build a Paypal to Ethereum exchange as none existed at the
              time. Now I actually added this exact idea Persist is doing now, of turning
              the college dropout model into a paid salary basis at the time.
            </p>

            <p className="ab-reveal" data-delay="0">
              I remember during high school years dreaming really big about projects I could
              do to escape the need to go to college. At this time I was the scholar athlete
              of my school, had coaches from across the country scouting me to play football
              at their schools. My coach wanted that, but I wanted to take the Elon Musk
              path. So consider me completely confused and thinking the dogma of the
              entrepreneurship path was more risky than just getting a job when access to
              programs like Thiel Fellowship seemed like a hunger games luck of the draw.
            </p>

            <p className="ab-reveal" data-delay="0">
              From 1st principles, I thought. Ok if there was economic value that made it
              worth paying me minimum wage to work on any of my big visions even if I owned
              1% of it that would be a better offer than any other job I could get at the time.
            </p>

            <ul className="ab-story-list ab-reveal" data-delay="60">
              <li><span className="ab-list-num">1.</span>I get to be my own boss and work on something awesome.</li>
              <li><span className="ab-list-num">2.</span>I the same, or better direct salary working as the boss.</li>
              <li><span className="ab-list-num">3.</span>I have ownership in the thing which I am building</li>
              <li><span className="ab-list-num">4.</span>I get to work on something I am interested in, on the frontier of potential for impact.</li>
            </ul>

            <p className="ab-reveal" data-delay="0">
              From Thiel Fellowship's numbers, it becomes clear that there is massive value
              to be made from offering this to someone like myself. With 220B total value
              generated, each year of labor was worth an average of 166,666,667, divided by
              a full years worth of working hours (2,080) it averages each student at
              generating $80,128 per hour.
            </p>

            <blockquote className="ab-story-quote ab-story-quote--warm ab-reveal" data-delay="60">
              So clearly even if 10% of the value creation was owned by the funder of this
              life path, then based on the success and performance of Thiel Fellows it would
              be worth it. Yet Thiel Fellowship had no such option, in fact none existed.
              This very calculation is what created the idea, it solved a major problem in
              my own life and ultimately a grand one in general.
            </blockquote>

            <p className="ab-reveal" data-delay="0">
              I was not selected for Thiel Fellowship, and while my heart knew what I
              wanted to run I also knew I needed to become a proof case of the Thiel failure
              mode. I went ahead that year and built the PayPal to Ethereum exchange, within
              the first 4 months of launching I had done over $500,000 in transactions, at
              a 20% profit margin as the only provider in the market in 2017. I had a
              Succesful, organic, 0 marketing crypto exchange in 2017.
            </p>

            <p className="ab-reveal" data-delay="0">
              Yet this is where the value of an overarching organization really became clear
              to me. I was figuring everything out myself, and even though I copied the same
              de-risking format as Coinbase in regards to KYC and AML acts, asking for a
              photo, government ID, and hand written note photo for verification it only
              took 1 massive fraudster to wipe out all my profit and cause me to not have
              any money to continue the venture.
            </p>

            <p className="ab-reveal" data-delay="0">
              An ecosystem like Thiel Fellowship would have recognized my early product
              market fit, capabilities as a founder, I would have raised millions and
              decreased the buy limit scaling that I had, ultimately leading to continue to
              rise in success in the web3 and crypto exchange space. Yet because I lacked
              that ecosystem to recognize the path I was on and help facilitate the
              connections which I had 0 access to, I instead had to support myself and
              started arbitraging my devs capabilities to help new projects get built.
            </p>

            <p className="ab-reveal" data-delay="0">
              The capabilities of a head organization to help is immeasurable, from
              automation, to mentors, to courses, guidance, recruiting, and so on. Through
              all my ventures and in the future I had this path in mind of where I was
              ultimately heading towards. I built my practices and processes from finding
              real world success which has made us unique in our operations.
            </p>

            <div className="ab-story-stat ab-reveal" data-delay="80">
              <span className="ab-story-stat-num">1,000<span>+</span></span>
              <span className="ab-story-stat-label">
                Persist Ventures is now home to a team of over 1,000 talented individuals worldwide.
              </span>
            </div>

            <p className="ab-reveal" data-delay="0">
              Here we are very mission driven. We believe in consistent learning and
              iteration, and are on the frontier of automation of business processes. We
              believe in working smart, and hard to attain our grand goals.
            </p>

            <p className="ab-reveal" data-delay="0">
              We chose the name Persist not just because its the most important asset for a
              founding team to have in their spirit, but it represents the deeper mission
              behind building this ecosystem in the first place.
            </p>

            <p className="ab-reveal" data-delay="0">
              As we may often forget, but should try to hold close to our hearts in this
              life, life itself is the only thing we know that can experience the beauty and
              share it with another soul. In response to the threat of our species we face
              on this planet we respect Jeff Bezos is building Blue Origin and Elon Musk
              building SpaceX, but we are all in on making sure that their goal of expanding
              planets as a backup for humanity does not serve its purpose.
            </p>

            <p className="ab-reveal" data-delay="0">
              We are on an adventure of ventures which are all adding up to a story that's
              truly helping this planet and humanity itself Persist towards infinity.
            </p>

            <p className="ab-story-closing ab-reveal" data-delay="80">
              After all, we are the Last Humans Left.
            </p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="ab-cta">
        <div className="ab-cta-grid"></div>
        <div className="ab-cta-glow"></div>
        <div className="ab-cta-noise"></div>
        <div className="ab-cta-inner">
          <div className="ab-eyebrow ab-eyebrow--center ab-reveal" data-delay="0">Join Us</div>
          <h2 className="ab-cta-headline ab-reveal" data-delay="100">
            Ready to build<br /><em>something extraordinary?</em>
          </h2>
          <p className="ab-cta-sub ab-reveal" data-delay="200">
            Partner with a team that turns bold ideas into meaningful ventures. Whether
            you're launching a startup, scaling a product, or redefining your brand, we're
            here to help you bring your vision to life with clarity, creativity, and purpose.
          </p>
          <button
            className="ab-cta-btn ab-reveal"
            data-delay="300"
            data-magnetic
            onClick={() => window.open('mailto:apply@persist.foundry?subject=Foundry%20Cohort%202026', '_blank')}
          >
            Apply For Fellowship
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </section>
    </>
  )
}

import { useState } from "react";
import { Link } from "react-router-dom";

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

const EXPLORE_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Our Team", to: "/team" },
  {
    label: "Blog",
    href: "https://ww.persist.org/free-courses",
    external: true,
  },
];

const OPPORTUNITY_LINKS = [
  { label: "Job Application", to: "/apply-for-a-full-time-position" },
  { label: "Co-Founder Application", to: "/apply-to-cofoundathon" },
  { label: "Investor Application", to: "/investor-application" },
  { label: "Careers", to: "/careers" },
  { label: "Contact Us", to: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  {
    label: "Decentralized Intelligence Agency",
    href: "https://dia.wiki/",
    external: true,
  },
];

function IconLinkedIn() {
  return (
    <span
      className="footer-social-icon footer-social-icon--linkedin"
      aria-hidden="true"
    />
  );
}

function IconInstagram() {
  return (
    <span
      className="footer-social-icon footer-social-icon--instagram"
      aria-hidden="true"
    />
  );
}

function IconYouTube() {
  return (
    <span
      className="footer-social-icon footer-social-icon--youtube"
      aria-hidden="true"
    />
  );
}

function NavLink({ link }) {
  if (link.external) {
    return (
      <a
        href={link.href}
        className="footer-nav-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.label}
      </a>
    );
  }
  return (
    <Link to={link.to} className="footer-nav-link">
      {link.label}
    </Link>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  async function handleSubscribe(e) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    if (!SCRIPT_URL) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ email: value }),
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="footer">
      <div className="footer-top">
        {/* Brand + newsletter + socials */}
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            <img src="/pv-favicon.png" alt="" />
            <span className="footer-logo-name">Persist</span>
          </Link>

          <div className="footer-newsletter-wrap">
            {status !== "success" && status !== "error" && (
              <p className="footer-newsletter-label">
                Subscribe to our newsletter
              </p>
            )}

            <form
              className={`footer-newsletter${
                status === "success" || status === "error" ? " is-gone" : ""
              }`}
              onSubmit={handleSubscribe}
            >
              <input
                className="footer-newsletter-input"
                type="email"
                placeholder="Your email"
                aria-label="Subscribe to our newsletter"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                required
              />
              <button
                className="footer-newsletter-btn"
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <span className="footer-newsletter-spinner" aria-hidden="true" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>

            {status === "success" && (
              <div className="footer-newsletter-card is-success" role="status">
                <span className="fnc-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="8.25" stroke="currentColor" strokeWidth="1.3" />
                    <path
                      d="M5.5 9l2.5 2.5L12.5 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="fnc-text">
                  <strong>Subscribed</strong>
                  <span>You&apos;re on the list.</span>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="footer-newsletter-card is-error" role="alert">
                <div className="fnc-text">
                  <strong>Something went wrong</strong>
                  <span>Please try again.</span>
                </div>
                <button
                  type="button"
                  className="fnc-retry"
                  onClick={() => setStatus("idle")}
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <div className="footer-socials" aria-label="Social links">
            <a
              className="footer-social-link"
              href="https://www.linkedin.com/company/persist-ventures/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <IconLinkedIn />
            </a>
            <a
              className="footer-social-link"
              href="https://www.instagram.com/persistventures/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <IconInstagram />
            </a>
            <a
              className="footer-social-link"
              href="https://www.youtube.com/@persistventures"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <IconYouTube />
            </a>
          </div>
        </div>

        <div className="footer-nav-cols">
          {/* Explore */}
          <div className="footer-nav-col">
            <div className="footer-nav-heading">Explore</div>
            <nav className="footer-nav-links" aria-label="Explore">
              {EXPLORE_LINKS.map((link) => (
                <NavLink key={link.label} link={link} />
              ))}
            </nav>
          </div>

          {/* Opportunities */}
          <div className="footer-nav-col">
            <div className="footer-nav-heading">Opportunities</div>
            <nav className="footer-nav-links" aria-label="Opportunities">
              {OPPORTUNITY_LINKS.map((link) => (
                <NavLink key={link.label} link={link} />
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="footer-nav-col">
            <div className="footer-nav-heading">Legal</div>
            <nav className="footer-nav-links" aria-label="Legal">
              {LEGAL_LINKS.map((link) => (
                <NavLink key={link.label} link={link} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Persist Foundry · All rights reserved</span>
      </div>
    </footer>
  );
}

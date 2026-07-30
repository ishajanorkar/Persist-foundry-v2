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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0-2.16C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden="true"
    >
      {/* Same outer square as LinkedIn — identical height; play is a cutout */}
      <path d="M22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0ZM9.5 6.75v10.5L18.25 12 9.5 6.75Z" />
    </svg>
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

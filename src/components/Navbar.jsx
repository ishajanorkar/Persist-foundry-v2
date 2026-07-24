import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { WORK_WITH_US_LINKS } from "../data/applicationForms";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Our Team", to: "/team" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Careers", to: "/careers" },
  { label: "Work With Us", dropdown: true, children: WORK_WITH_US_LINKS },
  { label: "Blog", href: "https://ww.persist.org/free-courses", external: true },
  { label: "Contact Us", to: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      // Foundry P-dock glide: only force-show once the mark is moving to the nav
      const forceVisible = !!(
        typeof window !== "undefined" && window.PF?._forceNavVisible
      );
      if (y < 120 || forceVisible) {
        setHidden(false);
      } else {
        setHidden(y > lastY);
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile Work With Us submenu when menu closes / route changes
  useEffect(() => {
    setWorkOpen(false);
  }, [location.pathname, mobileOpen]);

  const go = (id) => {
    setMobileOpen(false);
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#" + id;
    }
  };

  const isActive = (link) => {
    if (link.to) return location.pathname === link.to;
    if (link.dropdown && link.children) {
      return link.children.some((c) => location.pathname === c.to);
    }
    return false;
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav
        className={`nav${scrolled ? " is-scrolled" : ""}${hidden && !mobileOpen ? " is-hidden" : ""}`}
        id="nav"
      >
        {/* LOGO */}
        <Link
          className={`nav-logo${isHome ? " nav-logo--foundry" : ""}`}
          to="/"
          onClick={closeMobile}
        >
          {/* Dock target for the cinematic Persist mark (home).
              On other pages the static favicon fills this role. */}
          <span
            className="nav-logo-mark"
            id="navBrandSlot"
            aria-hidden="true"
          />
          {!isHome && <img src="/pv-favicon.png" alt="" />}
          <span className="nav-logo-word">Persist</span>
        </Link>

        {/* CENTER PILL ΓÇö desktop only */}
        <div className="nav-pill" aria-label="Navigation">
          {LINKS.map((link) => {
            const { label, id, href, to, dropdown, children, external } = link;
            const active = isActive(link);

            if (dropdown && children) {
              return (
                <div
                  key={label}
                  className={`nav-dropdown${active ? " is-active" : ""}`}
                >
                  <button
                    type="button"
                    className={`nav-pill-link nav-dropdown-trigger${active ? " is-active" : ""}`}
                    aria-haspopup="menu"
                  >
                    {label}
                    <svg
                      className="nav-pill-chevron"
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 3.5l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="nav-dropdown-panel" role="menu">
                    {children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        role="menuitem"
                        className={`nav-dropdown-link${location.pathname === child.to ? " is-active" : ""}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            if (to) {
              return (
                <Link
                  key={label}
                  to={to}
                  className={`nav-pill-link${active ? " is-active" : ""}`}
                  onClick={closeMobile}
                >
                  {label}
                </Link>
              );
            }
            return (
              <a
                key={label}
                href={id ? (isHome ? `#${id}` : `/#${id}`) : href}
                className={`nav-pill-link${active ? " is-active" : ""}`}
                onClick={
                  id
                    ? (e) => {
                        e.preventDefault();
                        go(id);
                      }
                    : undefined
                }
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* RIGHT SIDE */}
        <div className="nav-right">
          <button className="nav-cta" data-magnetic onClick={() => go("apply")}>
            Apply For Fellowship
            <svg
              className="nav-cta-arrow"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            className={`nav-hamburger${mobileOpen ? " is-open" : ""}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* MOBILE FULLSCREEN MENU */}
      <div
        className={`nav-mobile${mobileOpen ? " is-open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div className="nav-mobile-head">
          <Link className="nav-logo" to="/" onClick={closeMobile}>
            <img src="/pv-favicon.png" alt="" />
            <span className="nav-logo-word">Persist</span>
          </Link>
          <button
            className="nav-hamburger is-open"
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <nav className="nav-mobile-links">
          {LINKS.map((link, i) => {
            const { label, id, href, to, dropdown, children, external } = link;
            const delay = mobileOpen ? `${80 + i * 55}ms` : "0ms";

            if (dropdown && children) {
              return (
                <div
                  key={label}
                  className={`nav-mobile-group${mobileOpen ? " is-visible" : ""}${workOpen ? " is-expanded" : ""}`}
                  style={{ transitionDelay: delay }}
                >
                  <button
                    type="button"
                    className="nav-mobile-link nav-mobile-toggle"
                    aria-expanded={workOpen}
                    onClick={() => setWorkOpen((v) => !v)}
                  >
                    <span className="nav-mobile-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {label}
                    <svg
                      className="nav-mobile-chevron"
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 3.5l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="nav-mobile-sub" hidden={!workOpen}>
                    {children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className="nav-mobile-sublink"
                        onClick={closeMobile}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            if (to) {
              return (
                <Link
                  key={label}
                  to={to}
                  className={`nav-mobile-link${mobileOpen ? " is-visible" : ""}`}
                  style={{ transitionDelay: delay }}
                  onClick={closeMobile}
                >
                  <span className="nav-mobile-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {label}
                </Link>
              );
            }
            return (
              <a
                key={label}
                href={id ? (isHome ? `#${id}` : `/#${id}`) : href}
                className={`nav-mobile-link${mobileOpen ? " is-visible" : ""}`}
                style={{ transitionDelay: delay }}
                onClick={() => {
                  if (id) go(id);
                  else closeMobile();
                }}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="nav-mobile-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </a>
            );
          })}
        </nav>

        <button
          className={`nav-mobile-cta${mobileOpen ? " is-visible" : ""}`}
          style={{ transitionDelay: mobileOpen ? "360ms" : "0ms" }}
          onClick={() => go("apply")}
        >
          Apply For Fellowship
          <svg
            viewBox="0 0 16 16"
            fill="none"
            width="15"
            height="15"
            aria-hidden="true"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {mobileOpen && <div className="nav-backdrop" onClick={closeMobile} />}
    </>
  );
}

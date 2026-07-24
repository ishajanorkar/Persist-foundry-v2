import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { APPLICATION_FORMS, emptyFormState } from "../data/applicationForms";
import { submitApplication } from "../lib/submitApplication";

const EYEBROW_BY_KEY = {
  fullTime: "Job Application",
  cofoundathon: "Co-Foundathon",
  investor: "Investor Application",
};

function CornerTicks({ size = 22 }) {
  const px = typeof size === "number" ? size : parseFloat(size) || 22;
  const offset = -px / 2;
  const style = { width: px, height: px };
  const pos = {
    tl: { top: offset, left: offset },
    tr: { top: offset, right: offset },
    bl: { bottom: offset, left: offset },
    br: { bottom: offset, right: offset },
  };
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
  );
}

/**
 * Shared application form page driven by formKey config.
 * Routes: fullTime | cofoundathon | investor
 * Visual language matches About (.ab-*).
 */
export default function ApplicationForm({ formKey }) {
  const def = APPLICATION_FORMS[formKey];
  const [form, setForm] = useState(() => emptyFormState(formKey));
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setForm(emptyFormState(formKey));
    setStatus("idle");
    setErrorMsg("");
  }, [formKey]);

  useEffect(() => {
    const els = document.querySelectorAll(".ap-reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = parseInt(entry.target.dataset.delay || "0", 10);
          setTimeout(() => entry.target.classList.add("is-visible"), delay);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [formKey, status]);

  if (!def) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;

    for (const field of def.fields) {
      if (field.required && !String(form[field.name] || "").trim()) {
        setStatus("error");
        setErrorMsg(`Please fill in: ${field.label}`);
        return;
      }
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      await submitApplication({ formType: def.formType, fields: form });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    }
  };

  const reset = () => {
    setForm(emptyFormState(formKey));
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <div className="ap-page">
      <div className="ap-grid" aria-hidden="true" />

      <div className="ap-inner">
        <header className="ap-header ap-reveal" data-delay="0">
          <p className="ap-eyebrow">
            {EYEBROW_BY_KEY[formKey] || "Work With Us"}
          </p>
          <h1 className="ap-title">{def.title}</h1>
          {def.subtitle && <p className="ap-subtitle">{def.subtitle}</p>}
        </header>

        <div className="ap-panel ap-reveal" data-delay="120">
          <CornerTicks size={18} />

          {status === "success" ? (
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
                <strong>Thanks for applying!</strong>
                <span>We will be in touch with you soon.</span>
              </div>
              <button type="button" className="ap-again" onClick={reset}>
                Submit another application
              </button>
            </div>
          ) : (
            <form className="ap-form" onSubmit={onSubmit} noValidate>
              {def.fields.map((field) => (
                <label className="ap-field" key={field.name}>
                  <span className="ap-label">{field.label}</span>
                  <input
                    className="ap-input"
                    type={field.type}
                    name={field.name}
                    value={form[field.name] || ""}
                    onChange={set(field.name)}
                    placeholder={field.placeholder || undefined}
                    required={field.required}
                    disabled={status === "loading"}
                    autoComplete={
                      field.name === "email"
                        ? "email"
                        : field.name === "fullName"
                          ? "name"
                          : field.name === "phone"
                            ? "tel"
                            : "off"
                    }
                  />
                  {field.help && <span className="ap-help">{field.help}</span>}
                </label>
              ))}

              {status === "error" && errorMsg && (
                <div className="ap-error" role="alert">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="ap-submit"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <span className="ap-spinner" aria-hidden="true" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Application
                    {/* <span aria-hidden="true">↗</span> */}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from "react";

/**
 * Hard-navigates to an absolute URL (for off-site redirects like /startupathon).
 * Prefer Vercel redirects in production; this covers SPA / local fallbacks.
 */
export default function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div
      aria-busy="true"
      aria-label="Redirecting"
      style={{
        minHeight: "40vh",
        background: "#07050f",
      }}
    />
  );
}

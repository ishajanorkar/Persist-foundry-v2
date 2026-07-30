/**
 * POST an application payload to the Google Apps Script web app.
 * Uses text/plain to avoid a CORS preflight with Apps Script.
 *
 * Env:
 *   VITE_FELLOWSHIP_SCRIPT_URL  — Fellowship form (preferred when formType is Fellowship)
 *   VITE_APPLICATIONS_SCRIPT_URL — fallback / other application forms
 */
export async function submitApplication({ formType, fields }) {
  const fellowshipUrl = import.meta.env.VITE_FELLOWSHIP_SCRIPT_URL?.trim()
  const applicationsUrl = import.meta.env.VITE_APPLICATIONS_SCRIPT_URL?.trim()

  const SCRIPT_URL =
    (formType === 'Fellowship' && fellowshipUrl) ||
    applicationsUrl ||
    fellowshipUrl

  if (!SCRIPT_URL) {
    const needed =
      formType === 'Fellowship'
        ? 'VITE_FELLOWSHIP_SCRIPT_URL'
        : 'VITE_APPLICATIONS_SCRIPT_URL'
    console.warn(
      `No applications script URL set for ${formType}. Deploy google-apps-script/${
        formType === 'Fellowship' ? 'fellowship' : 'applications'
      }.gs and add ${needed} to .env / Vercel env, then redeploy.`,
    )
    throw new Error('Applications script URL is not configured')
  }

  const payload = JSON.stringify({
    formType,
    submittedAt: new Date().toISOString(),
    ...fields,
  })

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body: payload,
    })

    let json = null
    try {
      json = await res.json()
    } catch {
      // Apps Script sometimes returns opaque/redirected bodies; treat HTTP OK as success
      if (res.ok || res.type === 'opaque') return { success: true }
      throw new Error('Invalid response from applications script')
    }

    if (!json?.success) {
      throw new Error(json?.error || 'Submission failed')
    }
    return json
  } catch (err) {
    // CORS edge-case: retry as no-cors (cannot read body → optimistic success)
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
      })
      return { success: true }
    } catch {
      throw err instanceof Error
        ? err
        : new Error('Submission failed')
    }
  }
}

/**
 * POST an application payload to the Google Apps Script web app.
 * Uses text/plain to avoid a CORS preflight with Apps Script.
 *
 * Env: VITE_APPLICATIONS_SCRIPT_URL
 */
export async function submitApplication({ formType, fields }) {
  const SCRIPT_URL = import.meta.env.VITE_APPLICATIONS_SCRIPT_URL?.trim()
  if (!SCRIPT_URL) {
    console.warn('VITE_APPLICATIONS_SCRIPT_URL not set')
    throw new Error('Applications script URL is not configured')
  }

  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      formType,
      submittedAt: new Date().toISOString(),
      ...fields,
    }),
  })

  let json = null
  try {
    json = await res.json()
  } catch {
    // Apps Script sometimes returns opaque responses; treat HTTP OK as success
    if (res.ok) return { success: true }
    throw new Error('Invalid response from applications script')
  }

  if (!json?.success) {
    throw new Error(json?.error || 'Submission failed')
  }
  return json
}

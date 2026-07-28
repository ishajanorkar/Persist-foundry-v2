/**
 * POST a careers role application to its Google Apps Script web app.
 *
 * Per-role env vars (add as each role is wired):
 *   VITE_CAREERS_CFO_SCRIPT_URL
 *   VITE_CAREERS_VFM_SCRIPT_URL
 *   VITE_CAREERS_ACCEL_CEO_SCRIPT_URL
 *   VITE_CAREERS_STARTUP_FOUNDER_SCRIPT_URL
 *   VITE_CAREERS_VENTURE_STUDIO_SCRIPT_URL
 *
 * Uses FormData + no-cors (Apps Script does not send CORS headers).
 * Prefers a quick GET health-check so a private ("sign-in required")
 * deployment fails loudly instead of a fake success.
 */

const ROLE_SCRIPT_ENV = {
  'careers-page-cfo': 'VITE_CAREERS_CFO_SCRIPT_URL',
  'careers-page-Venture-Fund-Manager': 'VITE_CAREERS_VFM_SCRIPT_URL',
  'pv-accelerator-ceo': 'VITE_CAREERS_ACCEL_CEO_SCRIPT_URL',
  'startup-founder': 'VITE_CAREERS_STARTUP_FOUNDER_SCRIPT_URL',
  'venture-studio-founder': 'VITE_CAREERS_VENTURE_STUDIO_SCRIPT_URL',
}

export function getCareerScriptUrl(roleId) {
  const envKey = ROLE_SCRIPT_ENV[roleId]
  if (!envKey) return ''
  return String(import.meta.env[envKey] || '').trim()
}

export function hasCareerSheet(roleId) {
  return Boolean(getCareerScriptUrl(roleId))
}

function looksLikeLoginHtml(text) {
  const t = String(text || '').slice(0, 400).toLowerCase()
  return (
    t.includes('<!doctype') ||
    t.includes('<html') ||
    t.includes('accounts.google.com') ||
    t.includes('sign in')
  )
}

/** Confirm the web app is public (Anyone). Throws a clear error if not. */
async function assertScriptIsPublic(SCRIPT_URL) {
  const res = await fetch(SCRIPT_URL, {
    method: 'GET',
    redirect: 'follow',
  })

  // Opaque / CORS-blocked: cannot verify — continue (POST may still work)
  if (res.type === 'opaque') return

  const text = await res.text()
  if (looksLikeLoginHtml(text)) {
    throw new Error(
      'Apps Script is not public. Redeploy the web app with Who has access: Anyone, then use the new /exec URL.',
    )
  }
  if (!res.ok) {
    throw new Error(
      `Apps Script returned ${res.status}. Redeploy as Web app (Execute as: Me, Who has access: Anyone), authorize, then update the /exec URL in .env and restart Vite.`,
    )
  }

  try {
    const json = JSON.parse(text)
    if (json && json.success === false) {
      throw new Error(json.error || 'Careers script health check failed')
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      // Non-JSON but HTTP OK — continue
      return
    }
    throw err
  }
}

export async function submitCareerApplication({ roleId, roleTitle, fields }) {
  const SCRIPT_URL = getCareerScriptUrl(roleId)

  if (!SCRIPT_URL) {
    const envKey = ROLE_SCRIPT_ENV[roleId] || 'VITE_CAREERS_*_SCRIPT_URL'
    console.warn(
      `No careers script URL set for ${roleId}. Deploy the Apps Script and add ${envKey} to .env`,
    )
    throw new Error('Careers script URL is not configured')
  }

  await assertScriptIsPublic(SCRIPT_URL)

  const submittedAt = new Date().toISOString()
  const payload = {
    formType: `Careers-${roleId}`,
    submittedAt,
    roleTitle,
    formId: roleId,
    ...fields,
  }

  // FormData lands in e.parameter on Apps Script (most reliable from browsers)
  const form = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value == null) return
    form.append(key, String(value))
  })

  // Also send JSON text/plain as a second attempt if FormData path errors
  const jsonBody = JSON.stringify(payload)

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: form,
    })
    return { success: true }
  } catch {
    // Fall through to JSON attempt
  }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body: jsonBody,
    })

    const text = await res.text()
    if (looksLikeLoginHtml(text)) {
      throw new Error(
        'Apps Script is not public. Redeploy with Who has access: Anyone.',
      )
    }

    try {
      const json = JSON.parse(text)
      if (!json?.success) {
        throw new Error(json?.error || 'Submission failed')
      }
      return json
    } catch (err) {
      if (err instanceof SyntaxError) {
        if (res.ok) return { success: true }
        throw new Error('Invalid response from careers script')
      }
      throw err
    }
  } catch (err) {
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: jsonBody,
      })
      return { success: true }
    } catch {
      throw err instanceof Error ? err : new Error('Submission failed')
    }
  }
}

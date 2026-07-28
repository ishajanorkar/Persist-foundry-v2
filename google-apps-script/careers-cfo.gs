/**
 * Persist Foundry — Careers: CFO Application → Google Sheet
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/19VqzIw_XMGrPmKkv40O_muOKVH_S05ta4YIHNVevnxo/
 *
 * SETUP (one-time, ~2 min):
 * 1. Open the spreadsheet above (must be logged into an editor account).
 * 2. Extensions → Apps Script
 * 3. Delete any placeholder code and paste THIS entire file.
 * 4. Save (Ctrl/Cmd+S).
 * 5. Deploy → New deployment → Type: Web app
 *      - Description: Careers CFO
 *      - Execute as: Me
 *      - Who has access: Anyone   ← MUST be Anyone (not "Anyone with Google account")
 * 6. Deploy → Authorize → Copy the Web app URL (.../macros/s/XXXX/exec)
 * 7. Open that URL in an incognito window — you should see JSON like
 *      {"success":true,"service":"Persist Foundry Careers — CFO",...}
 *    If you see a Google login page, access is still wrong — edit the
 *    deployment and set Who has access to Anyone, then New version.
 * 8. In the project `.env`:
 *      VITE_CAREERS_CFO_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
 * 9. Restart the Vite dev server (`npm run dev`).
 *
 * Sheet columns (created on first submit if the sheet is empty):
 *   A Full Name | B Email | C LinkedIn | D Location | E Salary Range
 *   F Loom Video | G Role | H Form ID | I Timestamp  ← date last
 */

var SHEET_ID = '19VqzIw_XMGrPmKkv40O_muOKVH_S05ta4YIHNVevnxo';
var HEADERS = [
  'Full Name',
  'Email',
  'LinkedIn',
  'Location',
  'Salary Range',
  'Loom Video',
  'Role',
  'Form ID',
  'Timestamp',
];

function doGet(e) {
  // Allow GET test + query-string submits (same fields as form POST)
  if (e && e.parameter && (e.parameter.fullName || e.parameter.email)) {
    return respond(handleApplication(e.parameter));
  }
  return respond({
    success: true,
    service: 'Persist Foundry Careers — CFO',
    hint: 'POST JSON or form fields to this URL. If you see this JSON in an incognito window, access is configured correctly.',
  });
}

function doPost(e) {
  try {
    var data = parseBody(e);
    if (!data) {
      return respond({ success: false, error: 'Empty or invalid body' });
    }
    return respond(handleApplication(data));
  } catch (err) {
    return respond({
      success: false,
      error: String(err && err.message ? err.message : err),
    });
  }
}

function handleApplication(data) {
  var fullName = String(data.fullName || data['applicant-name'] || '').trim();
  var email = String(data.email || data['investors-email-2'] || '')
    .trim()
    .toLowerCase();

  if (!fullName) {
    return { success: false, error: 'Full name is required' };
  }
  if (!email || email.indexOf('@') === -1) {
    return { success: false, error: 'Valid email is required' };
  }

  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  ensureHeaders(sheet);

  sheet.appendRow([
    fullName,
    email,
    String(data.linkedin || '').trim(),
    String(data.location || '').trim(),
    String(data.salaryRange || data['salary-range'] || '').trim(),
    String(
      data.loomVideo || data['applicant-loom-link'] || data.video || '',
    ).trim(),
    String(
      data.roleTitle ||
        data['role-title'] ||
        'Chief Financial Officer (CFO)',
    ).trim(),
    String(data.formId || data['form-id'] || 'careers-page-cfo').trim(),
    data.submittedAt || new Date().toISOString(), // last column — Timestamp
  ]);

  return { success: true };
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    return;
  }
  var existing = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  var empty = existing.every(function (cell) {
    return !String(cell || '').trim();
  });
  if (empty) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function parseBody(e) {
  // Form-urlencoded / multipart → e.parameter
  if (e && e.parameter && (e.parameter.fullName || e.parameter.email || e.parameter['applicant-name'])) {
    return e.parameter;
  }
  // JSON / text/plain body
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      return null;
    }
  }
  return null;
}

function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** Run once from the editor to verify sheet access (does not need web deploy). */
function testAppend() {
  Logger.log(
    JSON.stringify(
      handleApplication({
        formType: 'Careers-CFO',
        submittedAt: new Date().toISOString(),
        fullName: 'Test Applicant',
        email: 'test@persist.org',
        linkedin: 'https://linkedin.com/in/test',
        location: 'Toronto, Canada',
        salaryRange: '$120k–$150k',
        loomVideo: 'https://www.loom.com/',
        roleTitle: 'Chief Financial Officer (CFO)',
        formId: 'careers-page-cfo',
      }),
    ),
  );
}

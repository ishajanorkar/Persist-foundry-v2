/**
 * Persist Foundry — Fellowship Application → Google Sheet
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1pEIV8J9axQO8iAkbMDzvVjMlwHt95N01xdVAMl-OqaY/
 *
 * Existing sheet columns (do not rename):
 *   A Column 1 (name) | B Email | C Linkedin | D Idea DESC
 *   E Prototype link(if any) | F Additional Docs | G Team Info
 *   H 3 day Chall | I Where they | J Intro Loom | K Status | L date
 *
 * UPDATE existing deployment:
 * 1. Open the spreadsheet → Extensions → Apps Script
 * 2. Replace ALL code with this file → Save
 * 3. Deploy → Manage deployments → pencil (Edit)
 *      → Version: New version → Deploy
 * 4. Keep the same /exec URL in .env (no site change needed)
 */

var SHEET_ID = '1pEIV8J9axQO8iAkbMDzvVjMlwHt95N01xdVAMl-OqaY';

function doGet() {
  return respond({
    success: true,
    service: 'Persist Foundry Fellowship',
    hint: 'POST JSON application payloads to this URL',
  });
}

function doPost(e) {
  try {
    var data = parseBody(e);
    if (!data) {
      return respond({ success: false, error: 'Empty or invalid body' });
    }

    var email = String(data.email || '').trim();
    var fullName = String(data.fullName || '').trim();
    if (!fullName) {
      return respond({ success: false, error: 'Full name is required' });
    }
    if (!email || email.indexOf('@') === -1) {
      return respond({ success: false, error: 'Valid email is required' });
    }

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];

    // Match existing headers — date (timestamp) is last (col L); Status left blank
    sheet.appendRow([
      fullName, // A — Column 1 (name)
      email, // B — Email
      String(data.portfolio || '').trim(), // C — Linkedin
      String(data.idea || '').trim(), // D — Idea DESC
      String(data.prototype || '').trim(), // E — Prototype link(if any)
      String(data.additionalFiles || '').trim(), // F — Additional Docs
      String(data.team || '').trim(), // G — Team Info
      String(data.cityChallenge || '').trim(), // H — 3 day Chall
      String(data.howFoundUs || '').trim(), // I — Where they
      String(data.loomVideo || '').trim(), // J — Intro Loom
      '', // K — Status (manual)
      data.submittedAt || new Date().toISOString(), // L — date
    ]);

    return respond({ success: true });
  } catch (err) {
    return respond({
      success: false,
      error: String(err && err.message ? err.message : err),
    });
  }
}

function parseBody(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return null;
  }
}

function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** Run once from the editor to verify column alignment. */
function testAppend() {
  Logger.log(
    doPost({
      postData: {
        contents: JSON.stringify({
          formType: 'Fellowship',
          submittedAt: new Date().toISOString(),
          fullName: 'Test Applicant',
          email: 'test@persist.org',
          portfolio: 'https://linkedin.com/in/test',
          idea: 'Test idea',
          prototype: '',
          additionalFiles: '',
          team: 'Solo',
          cityChallenge: 'Sell something',
          howFoundUs: 'Internal test',
          loomVideo: 'https://www.loom.com/',
        }),
      },
    }).getContent(),
  );
}

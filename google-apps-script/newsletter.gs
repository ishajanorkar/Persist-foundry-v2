/**
 * Persist Foundry — Newsletter → Google Sheet
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1aofCQs714UzKmY2lgbXj80OM59cRHoZPW5y2IhJkoFI/
 *
 * SETUP (one-time, ~2 min):
 * 1. Open the spreadsheet above (must be logged into the owner/editor account).
 * 2. Extensions → Apps Script
 * 3. Delete any placeholder code and paste THIS entire file.
 * 4. Save (Ctrl/Cmd+S).
 * 5. Deploy → New deployment → Type: Web app
 *      - Description: Newsletter
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 6. Deploy → Authorize → Copy the Web app URL (.../macros/s/XXXX/exec)
 * 7. In the project root create/update `.env`:
 *      VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
 * 8. Restart the Vite dev server (`npm run dev`).
 *
 * Sheet columns (auto-created on first submit if empty):
 *   A: Timestamp | B: Email
 */

var SHEET_ID = '1aofCQs714UzKmY2lgbXj80OM59cRHoZPW5y2IhJkoFI';
var SHEET_GID = 0; // first tab (gid=0)

function doGet(e) {
  return respond(handleEmail(e && e.parameter && e.parameter.email));
}

function doPost(e) {
  var email = '';
  if (e && e.parameter && e.parameter.email) {
    email = e.parameter.email;
  } else if (e && e.postData && e.postData.contents) {
    try {
      var parsed = JSON.parse(e.postData.contents);
      email = parsed.email || '';
    } catch (err) {
      email = '';
    }
  }
  return respond(handleEmail(email));
}

function handleEmail(raw) {
  var email = String(raw || '').trim().toLowerCase();
  if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    return { success: false, error: 'Invalid email' };
  }

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheets()[SHEET_GID] || ss.getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Email']);
  } else {
    var header = sheet.getRange(1, 1, 1, 2).getValues()[0];
    if (!header[0] && !header[1]) {
      sheet.getRange(1, 1, 1, 2).setValues([['Timestamp', 'Email']]);
    }
  }

  // Skip exact duplicate of the most recent email (simple de-dupe)
  var last = sheet.getLastRow();
  if (last >= 2) {
    var prev = String(sheet.getRange(last, 2).getValue() || '')
      .trim()
      .toLowerCase();
    if (prev === email) {
      return { success: true, duplicate: true };
    }
  }

  sheet.appendRow([new Date(), email]);
  return { success: true };
}

function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** Run once from the editor to verify sheet access. */
function testAppend() {
  Logger.log(handleEmail('test@persist.org'));
}

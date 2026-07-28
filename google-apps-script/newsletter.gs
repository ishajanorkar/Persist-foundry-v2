/**
 * Persist Foundry — Newsletter → Google Sheet
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1aofCQs714UzKmY2lgbXj80OM59cRHoZPW5y2IhJkoFI/
 *
 * Columns: A Timestamp | B Email
 *
 * SETUP:
 * 1. Open the spreadsheet → Extensions → Apps Script
 * 2. Paste THIS entire file → Save
 * 3. Deploy → New deployment → Web app
 *      Execute as: Me | Who has access: Anyone
 * 4. Copy /exec URL into .env (and Vercel env):
 *      VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
 * 5. Redeploy the site / restart Vite
 *
 * Verify: open the /exec URL in an incognito window — you should see
 * {"success":false,"error":"Invalid email"} (proves the app is public).
 */

var SHEET_ID = '1aofCQs714UzKmY2lgbXj80OM59cRHoZPW5y2IhJkoFI';
var SHEET_GID = 0;

function doGet(e) {
  return respond(handleEmail(e && e.parameter && e.parameter.email));
}

function doPost(e) {
  return respond(handleEmail(extractEmail(e)));
}

function extractEmail(e) {
  if (e && e.parameter && e.parameter.email) {
    return e.parameter.email;
  }
  if (e && e.postData && e.postData.contents) {
    var raw = String(e.postData.contents || '');
    // JSON body
    try {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.email) return parsed.email;
    } catch (err) {
      /* not JSON */
    }
    // urlencoded: email=...
    var m = raw.match(/(?:^|&)email=([^&]*)/);
    if (m) {
      try {
        return decodeURIComponent(m[1].replace(/\+/g, ' '));
      } catch (err2) {
        return m[1];
      }
    }
  }
  return '';
}

function getTargetSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === SHEET_GID) return sheets[i];
  }
  return sheets[0] || ss.getActiveSheet();
}

function handleEmail(raw) {
  var email = String(raw || '')
    .trim()
    .toLowerCase();
  if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
    return { success: false, error: 'Invalid email' };
  }

  var sheet = getTargetSheet();

  // Ensure header row
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Email']);
  } else {
    var header = sheet.getRange(1, 1, 1, 2).getValues()[0];
    if (!String(header[0] || '').trim() && !String(header[1] || '').trim()) {
      sheet.getRange(1, 1, 1, 2).setValues([['Timestamp', 'Email']]);
    }
  }

  // Skip exact duplicate of the most recent email
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

/** Run once from the editor to verify sheet access (no web deploy needed). */
function testAppend() {
  Logger.log(JSON.stringify(handleEmail('apps-script-test@persist.org')));
}

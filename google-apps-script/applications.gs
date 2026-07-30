/**
 * Persist Foundry — Work With Us applications → Google Sheet
 * Handles: FullTime | Cofoundathon | Investor
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/18R9lvKnPERw3C4DtReiITau3BUyfwwFSmESTHjhZ4R8/
 *
 * Used by:
 *   /apply-for-a-full-time-position
 *   /apply-to-cofoundathon
 *   /investor-application
 *
 * SETUP:
 * 1. Open the spreadsheet → Extensions → Apps Script
 * 2. Delete any placeholder code and paste THIS entire file → Save
 * 3. Deploy → New deployment → Type: Web app
 *      - Description: Work With Us applications
 *      - Execute as: Me
 *      - Who has access: Anyone   ← MUST be Anyone
 * 4. Deploy → Authorize → Copy the Web app URL (.../macros/s/XXXX/exec)
 * 5. Open that URL in an incognito window — you should see JSON success
 * 6. Add to `.env` AND Vercel → Settings → Environment Variables:
 *      VITE_APPLICATIONS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
 * 7. Redeploy Vercel (Vite bakes env vars at build time)
 */

var SHEET_ID = '18R9lvKnPERw3C4DtReiITau3BUyfwwFSmESTHjhZ4R8';

var TAB_HEADERS = {
  FullTime: [
    'Full Name',
    'Email',
    'Skill Overview',
    'Roles',
    'LinkedIn',
    'Portfolio / Resume',
    'Form Type',
    'Timestamp',
  ],
  Cofoundathon: [
    'Full Name',
    'Email',
    'Phone',
    'LinkedIn',
    'Loom Video',
    'Form Type',
    'Timestamp',
  ],
  Investor: [
    'Invest Target',
    'Investor Class',
    'Full Name',
    'Email',
    'LinkedIn',
    'Phone',
    'How Found Us',
    'Form Type',
    'Timestamp',
  ],
};

function doGet() {
  return respond({
    success: true,
    service: 'Persist Foundry — Work With Us Applications',
    forms: Object.keys(TAB_HEADERS),
    hint: 'POST JSON with formType: FullTime | Cofoundathon | Investor',
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
  var formType = String(data.formType || 'FullTime').trim();
  if (!TAB_HEADERS[formType]) {
    return {
      success: false,
      error: 'Unknown formType: ' + formType,
    };
  }

  var email = String(data.email || '')
    .trim()
    .toLowerCase();
  var fullName = String(data.fullName || '').trim();

  if (!fullName) {
    return { success: false, error: 'Full name is required' };
  }
  if (!email || email.indexOf('@') === -1) {
    return { success: false, error: 'Valid email is required' };
  }

  var sheet = getOrCreateTab(formType);
  ensureHeaders(sheet, TAB_HEADERS[formType]);

  var ts = data.submittedAt || new Date().toISOString();
  var row;

  if (formType === 'FullTime') {
    row = [
      fullName,
      email,
      String(data.skillOverview || '').trim(),
      String(data.roles || '').trim(),
      String(data.linkedin || '').trim(),
      String(data.portfolio || '').trim(),
      formType,
      ts,
    ];
  } else if (formType === 'Cofoundathon') {
    row = [
      fullName,
      email,
      String(data.phone || '').trim(),
      String(data.linkedin || '').trim(),
      String(data.loomVideo || '').trim(),
      formType,
      ts,
    ];
  } else {
    // Investor
    row = [
      String(data.investTarget || '').trim(),
      String(data.investorClass || '').trim(),
      fullName,
      email,
      String(data.linkedin || '').trim(),
      String(data.phone || '').trim(),
      String(data.howFoundUs || '').trim(),
      formType,
      ts,
    ];
  }

  sheet.appendRow(row);
  return { success: true, formType: formType };
}

function getOrCreateTab(name) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    return;
  }
  var first = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var empty = first.every(function (c) {
    return String(c || '').trim() === '';
  });
  if (empty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
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

/** Run once from the editor to verify FullTime append. */
function testAppendFullTime() {
  Logger.log(
    doPost({
      postData: {
        contents: JSON.stringify({
          formType: 'FullTime',
          submittedAt: new Date().toISOString(),
          fullName: 'Test Applicant',
          email: 'test@persist.org',
          skillOverview: 'Engineering',
          roles: 'Full-stack',
          linkedin: 'https://www.linkedin.com/in/test',
          portfolio: 'https://example.com',
        }),
      },
    }).getContent(),
  );
}

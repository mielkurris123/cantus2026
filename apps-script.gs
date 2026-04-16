// ========================================================================
// Google Apps Script — backend voor Cantus Afsnee inschrijvingen
// ========================================================================
// Stappen:
// 1. Maak een nieuwe Google Spreadsheet (bv. "Cantus Afsnee 2026").
// 2. Extensies > Apps Script > plak deze volledige file erin (Code.gs).
// 3. Pas SHEET_ID aan naar de ID van je spreadsheet
//    (staat in de URL: docs.google.com/spreadsheets/d/SHEET_ID/edit).
// 4. Deployeer > Nieuwe implementatie > Type: Webapp
//       - Uitvoeren als: ikzelf
//       - Wie heeft toegang: Iedereen
//    Kopieer de webapp-URL (eindigt op /exec) naar API_URL in index.html.
// 5. Bij elke code-aanpassing: Deployeer > Implementatie beheren >
//    bestaande implementatie bewerken > versie: Nieuwe versie > Implementeren.
// ========================================================================

const SHEET_ID = '1IanuBu3atzWAx4BcaDjqwJW2qjWs6ujRDjlNT97iUC0';
const SHEET_NAME = 'Inschrijvingen';
const MAX_PLACES = 35;

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Tijdstip', 'Naam', 'E-mail', 'Gedoopt', 'Auto', 'Blijft slapen', 'Opmerking', 'In praesidium gezeten', 'Praesidiumfunctie']);
    sh.getRange(1, 1, 1, 9).setFontWeight('bold');
  }
  return sh;
}

function doGet(e) {
  const sh = getSheet_();
  const count = Math.max(0, sh.getLastRow() - 1);
  return ContentService
    .createTextOutput(JSON.stringify({ count: count, max: MAX_PLACES }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = (data.name || '').toString().trim();
    const email = (data.email || '').toString().trim();

    // Honeypot — bots vullen dit doorgaans in; mensen zien het veld niet.
    if ((data.website || '').toString().trim() !== '') {
      return json_({ ok: true }); // stil "geslaagd" antwoord voor de bot
    }

    if (!name || !email) {
      return json_({ ok: false, error: 'Naam en e-mail zijn verplicht.' });
    }

    const sh = getSheet_();
    const rows = sh.getDataRange().getValues();
    // index 2 = e-mail kolom (0=tijdstip,1=naam,2=email)
    for (let i = 1; i < rows.length; i++) {
      if ((rows[i][2] || '').toString().toLowerCase() === email.toLowerCase()) {
        return json_({ ok: false, error: 'Dit e-mailadres is al ingeschreven.' });
      }
    }
    if (rows.length - 1 >= MAX_PLACES) {
      return json_({ ok: false, error: 'Helaas, de cantus is volzet (35 plaatsen).' });
    }

    sh.appendRow([
      new Date(),
      name,
      email,
      data.gedoopt ? 'ja' : 'nee',
      data.auto ? 'ja' : 'nee',
      data.blijfSlapen ? 'ja' : 'nee',
      (data.opmerking || '').toString().trim(),
      data.gedoopt && data.praesidium ? 'ja' : 'nee',
      data.gedoopt && data.praesidium ? (data.praesidiumFunctie || '').toString().trim() : ''
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'Serverfout: ' + err.message });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

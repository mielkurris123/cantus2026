# Cantus Afsnee 2026

Uitnodigingssite + inschrijfformulier voor de cantus van 4 juli 2026.

**Live:** https://mielkurris123.github.io/cantus-afsnee-2026/

## Stack
- Statische site (HTML/CSS/JS) — gehost op GitHub Pages
- Backend: Google Apps Script dat inschrijvingen in een Google Sheet schrijft

## Setup Google Sheet + Apps Script

1. Maak een nieuwe Google Spreadsheet aan (naam bv. "Cantus Afsnee 2026").
2. Kopieer de sheet-ID uit de URL: `docs.google.com/spreadsheets/d/<SHEET_ID>/edit`.
3. Open **Extensies → Apps Script** in die sheet.
4. Plak de volledige inhoud van `apps-script.gs` in `Code.gs`.
5. Vervang `VERVANG_DOOR_JE_SHEET_ID` door de ID uit stap 2.
6. **Deployeer → Nieuwe implementatie → Type: Webapp**
   - Uitvoeren als: *ikzelf*
   - Wie heeft toegang: *Iedereen*
7. Kopieer de webapp-URL (eindigt op `/exec`).
8. Vervang `PASTE_YOUR_APPS_SCRIPT_URL_HERE` in `index.html` door die URL, commit & push.

## Lokaal bekijken
Gewoon `index.html` openen in de browser, of `python -m http.server` in deze map.

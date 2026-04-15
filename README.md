# Cantus Afsnee 2026

Uitnodigingssite + inschrijfformulier voor de cantus van **4 juli 2026** in Afsnee.

**Live:** https://mieline.be/cantus2026/

## Architectuur

Volledig statische site (HTML/CSS/JS) gehost op GitHub Pages. Inschrijvingen gaan via een Google Apps Script webhook die in een Google Sheet schrijft. Geen server, geen database, geen onderhoud.

```
Bezoeker  ──►  GitHub Pages (statische site)
                    │
                    │  fetch (GET stats / POST subscribe)
                    ▼
              Google Apps Script (webapp)
                    │
                    ▼
              Google Sheet (Inschrijvingen tab)
```

## Hoe de inschrijvingen werken

### Frontend
`index.html` bevat het formulier. Bij submit stuurt het via `fetch()` een JSON-payload naar de Apps Script URL (`API_URL` bovenaan het script-blok).

Velden:
- `name`, `email` — verplicht
- `gedoopt`, `auto`, `blijfSlapen` — booleans
- `opmerking` — vrije tekst
- `akkoord` — client-side required, wordt niet naar de backend gestuurd (enkel een UX-check)

De request gebruikt `Content-Type: text/plain` om Apps Script's CORS-preflight te vermijden.

### Backend (Apps Script)
Zie `apps-script.gs`. Twee endpoints op dezelfde URL:

**`GET ?action=stats`** → returned JSON `{ "count": <aantal>, "max": 35 }`. Gebruikt door de teller op de site.

**`POST`** met JSON body → voegt een rij toe aan de Google Sheet "Inschrijvingen". Validaties:
- Naam + e-mail verplicht
- Duplicaat-check op e-mail
- Stop bij 35 inschrijvingen

Response: `{ "ok": true }` of `{ "ok": false, "error": "..." }`.

### Polling (teller op de site)
De teller wordt **éénmaal bij pageload** opgehaald en opnieuw **na een succesvolle inschrijving**. Er is geen continue polling — dat zou onnodig quota van Apps Script opbranden. Wie de teller wil zien bewegen refresht gewoon de pagina.

Wil je wél polling (bv. elke 30s verversen), voeg dan onderaan `index.html` toe:
```js
setInterval(loadStats, 30000);
```

### Data bekijken
De inschrijvingen staan in de Google Sheet (tab "Inschrijvingen"). Eerst tabblad wordt automatisch aangemaakt met kolommen: Tijdstip, Naam, E-mail, Gedoopt, Auto, Blijft slapen, Opmerking.

## Setup Google Sheet + Apps Script (enkel bij nieuwe sheet)

1. Maak een Google Spreadsheet aan.
2. Kopieer de sheet-ID uit de URL: `docs.google.com/spreadsheets/d/<SHEET_ID>/edit`.
3. **Extensies → Apps Script** → plak `apps-script.gs` in `Code.gs`.
4. Vervang `SHEET_ID` bovenaan.
5. **Deployeer → Nieuwe implementatie → Webapp**
   - Uitvoeren als: *ikzelf*
   - Wie heeft toegang: **Anyone** (niet "Anyone with Google account")
6. Kopieer de `/exec`-URL en vervang `API_URL` in `index.html`.
7. Bij code-wijzigingen in Apps Script: **Deployeer → Implementatie beheren → potloodje → Versie: Nieuwe versie → Implementeren** (URL blijft dezelfde).

## Hosting / domein

Deze repo is een GitHub Pages project-site. Het domein `mieline.be` wordt beheerd door de root repo [`mielkurris123.github.io`](https://github.com/mielkurris123/mielkurris123.github.io) — zie daar voor DNS-details.

Elke repo onder `mielkurris123` wordt automatisch als submap geserveerd:
- `cantus2026` → https://mieline.be/cantus2026/

## Lokaal draaien

```bash
python -m http.server 8000
# open http://localhost:8000
```

Of gewoon `index.html` dubbelklikken (werkt, alleen CORS-fetches naar Apps Script werken dan via `file://` soms niet).

## Stack
- HTML + vanilla JS (geen build-step)
- Google Apps Script + Google Sheets als backend
- GitHub Pages voor hosting
- Combell voor DNS (domein `mieline.be`)

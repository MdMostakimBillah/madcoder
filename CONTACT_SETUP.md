# Contact form → Google Sheets (5-minute setup)

The site's **“Send me a message”** popup posts each message to a Google
Apps Script web app, which appends it as a row in your spreadsheet. The
whole connection is one URL.

## 1. Open the script editor

Open the Google Sheet that should store the messages →
**Extensions → Apps Script**.

## 2. Paste this code

Delete whatever is in `Code.gs` and paste:

```javascript
/**
 * Contact form endpoint for the portfolio site.
 * Appends each message as a row on the "Messages" sheet
 * (created automatically, with a header row, if missing).
 */
const SHEET_NAME = "Messages";
const HEADERS = ["Timestamp", "Email", "Subject", "Description", "Message"];

function doPost(e) {
  const p = (e && e.parameter) || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // one writer at a time
  try {
    const sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      p.email || "",
      p.subject || "",
      p.description || "",
      p.message || "",
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: "contact" });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
```

**Save** (Ctrl+S).

## 3. Deploy it as a web app

1. **Deploy → New deployment**
2. Click the gear icon → **Web app**
3. Description: `contact form`
4. **Execute as: Me**
5. **Who has access: Anyone**
6. **Deploy** → authorise when asked (the script only touches this
   spreadsheet)
7. Copy the **Web app URL** — it ends in `/exec`

## 4. Hand over the URL

Paste the URL here (or into `CONTACT_ENDPOINT` in `src/data/site.js`).
It gets one config line, the site rebuilds, and messages start landing
in the sheet.

## Updating the script later

After any edit: **Deploy → Manage deployments → ✏️ → Version: New
version → Deploy.** Google does *not* pick up script edits on the old
deployment — forgetting this is the #1 reason a form "stops working".

## How the site talks to it

`src/components/ContactPopup.jsx` POSTs the four fields
(`email`, `subject`, `description`, `message`) as a URL-encoded body.
Apps Script's redirect chain sends no CORS headers, so the request runs
in `no-cors` mode: it is a *simple* request — no preflight, nothing for
Google to reject — and delivery only fails if the network itself never
took it, which is the one error the dialog shows.

A hidden **honeypot** field (`company`) catches dumb bots: filled → the
dialog reports success without sending anything.

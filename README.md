# AI Workshop · DONE-FOR-YOU

Lead intake page for the AI Workshop (AIW) Done-For-You service. A visitor fills in a short form, the lead is saved to a Google Sheet, and the AIW team is alerted in Slack so a call can be booked.

![Static site](https://img.shields.io/badge/site-static%20HTML-22c55e) ![Automation](https://img.shields.io/badge/automation-n8n-16a34a)

## How it works

```
Visitor ──► index.html (form)
              │  POST JSON
              ▼
        n8n webhook ──► validate & clean ──► Google Sheet (Leads)
                                          └─► Slack alert (team books the call)
```

1. The visitor submits the form on `index.html`.
2. The n8n workflow checks the lead (name, valid email, consent).
3. The lead is appended to the **AIW Leads – Get Started form** Google Sheet.
4. A message is posted in Slack. If Slack fails, the lead is still saved.
5. The form shows a success message.

## Repository structure

| Path | What it is |
| --- | --- |
| `index.html` | The whole front end: page, styles, starfield and click effects, and form logic. No build step. |
| `n8n/aiw-lead-intake.n8n.json` | Importable n8n workflow (webhook → format → Google Sheets → Slack → reply). |
| `logo.png` *(optional, not included)* | If added next to `index.html`, it replaces the "AIW" text in the header. |

## Form fields

| Field | Required |
| --- | --- |
| Name | Yes |
| Email | Yes |
| Phone | No |
| Service needed | Yes |
| Budget (USD) | Yes |
| Market | No |
| Location / city | No |
| Project details | No |
| Consent to be contacted | Yes |

Each lead is also stored with a **Source**, a timestamp and a **Status** (`New`).

## Setup

### 1. n8n
1. Import `n8n/aiw-lead-intake.n8n.json` into n8n.
2. Select your Google Sheets and Slack credentials on the nodes.
3. In the **Notify team in Slack** node, replace `PASTE_SLACK_CHANNEL_ID` with your channel ID.
4. Activate the workflow and copy the **Production** webhook URL.

### 2. Front end
Open `index.html` and fill in the config near the top of the script:

```js
const CONFIG = { WEBHOOK_URL: "", BOOKING_URL: "" };
```

- `WEBHOOK_URL`: the n8n Production webhook URL.
- `BOOKING_URL`: optional booking link shown after a successful submit.

### 3. Hosting (Render static site)
- **Build command:** *(none)*
- **Publish directory:** `.`
- Auto-deploys on every push to `main`.
- Add a custom domain under **Settings → Custom Domains**.

## Tracking where leads come from

Add `?src=` to the link you share. It is saved in the **Source** column and shown in Slack.

| Where you share it | Link |
| --- | --- |
| AIW Lite (free community) | `https://YOUR-DOMAIN/?src=aiw-lite` |
| AIW Pro (paid community) | `https://YOUR-DOMAIN/?src=aiw-pro` |

Add `?demo` to preview the full flow without sending anything.

## Notes

- Spam protection: a hidden honeypot field plus validation on the form and in the workflow.
- Motion effects respect the visitor's "reduce motion" setting.
- Validated for syntax and logic; test end to end with a real submission after connecting n8n.

---
Built for the AI Workshop team.

# Crisis Detection Prototype

Lightweight Node/Express prototype for the Crisis Detection ingest and rule-based detector.

Quick start:

```bash
cd mind-sync-now/server
npm install
npm start
# in another shell:
npm test
```

Files:
- `index.js` — Express server with `/ingest` endpoint
- `detector.js` — simple rule-based risk detector
- `alerts.js` — mock alert logger (writes `alerts.log`)
- `test/send_sample.js` — script to POST sample payloads
Next steps: integrate real alerting (email/SMS/webhooks), persist events to DB, and expand detector.

Environment variables (see `.env.example`):
- `WEBHOOK_URL` — optional webhook to receive POSTs of alert events
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `TWILIO_TO` — optional Twilio SMS creds

When enabled the prototype will persist alerts to `alerts.log` and events to `events.jsonl`, and will attempt delivery to the configured webhook and/or Twilio.

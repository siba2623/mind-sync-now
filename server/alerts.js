const fs = require('fs')
const path = require('path')
const axios = require('axios')
const db = require('./db')

const ALERT_LOG = path.resolve(__dirname, 'alerts.log')
const EVENT_LOG = path.resolve(__dirname, 'events.jsonl')

function appendLog(file, obj) {
  try {
    fs.appendFileSync(file, JSON.stringify(obj) + '\n')
  } catch (e) {
    console.error('Failed to write log', file, e.message)
  }
}

async function trySendWebhook(url, payload) {
  try {
    await axios.post(url, payload, { timeout: 5000 })
    console.log('Webhook delivered')
  } catch (e) {
    console.warn('Webhook failed:', e.message)
  }
}

async function trySendTwilio(payload) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM
  const to = process.env.TWILIO_TO
  if (!sid || !token || !from || !to) return

  const body = `${payload.result.riskLevel.toUpperCase()} risk detected: ${payload.result.reasons ? payload.result.reasons.join(', ') : ''}`
  try {
    await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      new URLSearchParams({ From: from, To: to, Body: body }).toString(),
      {
        auth: { username: sid, password: token },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000
      }
    )
    console.log('Twilio SMS sent')
  } catch (e) {
    console.warn('Twilio send failed:', e.message)
  }
}

async function sendMockAlert(result, payload) {
  const entry = { ts: new Date().toISOString(), result, payload }
  appendLog(ALERT_LOG, entry)
  appendLog(EVENT_LOG, { ts: entry.ts, type: 'alert', result, payload })
  console.log('Alert persisted:', result.riskLevel)

  // persist to DB
  try {
    db.insertAlert({ ts: entry.ts, result, payload, status: 'open' })
  } catch (e) {
    console.error('DB insert failed', e.message)
  }

  // deliver to configured webhook (if any)
  const webhook = process.env.WEBHOOK_URL
  if (webhook) await trySendWebhook(webhook, entry)

  // deliver via Twilio if configured
  await trySendTwilio(entry)
}

module.exports = { sendMockAlert }

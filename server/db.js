const fs = require('fs')
const path = require('path')

const DB_FILE = path.resolve(__dirname, 'alerts.json')

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = { alerts: [], seq: 1 }
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2))
      return init
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('readDB failed', e.message)
    return { alerts: [], seq: 1 }
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('writeDB failed', e.message)
  }
}

function now() { return new Date().toISOString() }

function insertAlert({ ts, result, payload, status = 'open' }) {
  const db = readDB()
  const id = db.seq++
  const rec = {
    id,
    ts,
    riskLevel: result.riskLevel,
    score: result.score,
    reasons: result.reasons || [],
    payload: payload || {},
    status,
    acknowledgedAt: null
  }
  db.alerts.push(rec)
  writeDB(db)
  return id
}

function getAlerts(opts = {}) {
  const db = readDB()
  let items = db.alerts.slice()

  // filters
  if (opts.riskLevel) {
    items = items.filter(i => i.riskLevel === opts.riskLevel)
  }
  if (opts.status) {
    items = items.filter(i => i.status === opts.status)
  }
  if (opts.q) {
    const q = String(opts.q).toLowerCase()
    items = items.filter(i => (i.payload && i.payload.text || '').toLowerCase().includes(q) || (i.reasons||[]).join(' ').toLowerCase().includes(q))
  }

  // sort newest first
  items = items.slice().reverse()

  // pagination
  const page = Math.max(1, Number(opts.page) || 1)
  const limit = Math.max(1, Math.min(100, Number(opts.limit) || 25))
  const start = (page - 1) * limit
  const paged = items.slice(start, start + limit)

  return {
    total: items.length,
    page,
    limit,
    items: paged
  }
}

function acknowledgeAlert(id) {
  const db = readDB()
  const rec = db.alerts.find(a => a.id === Number(id))
  if (!rec) return false
  rec.status = 'acknowledged'
  rec.acknowledgedAt = now()
  writeDB(db)
  return true
}

module.exports = { insertAlert, getAlerts, acknowledgeAlert }

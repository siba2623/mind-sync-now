const path = require('path')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(__dirname, 'alerts.sqlite')

function ensureDb() {
  const exists = fs.existsSync(DB_PATH)
  const db = new sqlite3.Database(DB_PATH)
  if (!exists) {
    db.serialize(() => {
      db.run(`CREATE TABLE alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT NOT NULL,
        riskLevel TEXT,
        score INTEGER,
        reasons TEXT,
        payload TEXT,
        status TEXT DEFAULT 'open',
        acknowledgedAt TEXT
      )`)
    })
  }
  return db
}

function serializeReasons(reasons) {
  try { return JSON.stringify(reasons || []) } catch (e) { return '[]' }
}

function serializePayload(payload) {
  try { return JSON.stringify(payload || {}) } catch (e) { return '{}' }
}

function insertAlert({ ts, result, payload }) {
  const db = ensureDb()
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO alerts (ts, riskLevel, score, reasons, payload) VALUES (?, ?, ?, ?, ?)')
    stmt.run(ts, result.riskLevel, result.score, serializeReasons(result.reasons), serializePayload(payload), function (err) {
      stmt.finalize()
      db.close()
      if (err) return reject(err)
      resolve({ id: this.lastID })
    })
  })
}

function getAlerts(opts = {}) {
  const db = ensureDb()
  const page = Number(opts.page) || 1
  const limit = Math.min(Number(opts.limit) || 25, 100)
  const offset = (page - 1) * limit

  let where = []
  let params = []
  if (opts.riskLevel) { where.push('riskLevel = ?'); params.push(opts.riskLevel) }
  if (opts.status) { where.push('status = ?'); params.push(opts.status) }
  if (opts.q) { where.push("payload LIKE ?"); params.push('%' + opts.q + '%') }
  const whereClause = where.length ? ('WHERE ' + where.join(' AND ')) : ''

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(`SELECT COUNT(*) as total FROM alerts ${whereClause}`, params, (err, row) => {
        if (err) { db.close(); return reject(err) }
        const total = row ? row.total : 0
        db.all(`SELECT * FROM alerts ${whereClause} ORDER BY ts DESC LIMIT ? OFFSET ?`, params.concat([limit, offset]), (err2, rows) => {
          db.close()
          if (err2) return reject(err2)
          const items = rows.map(r => ({
            id: r.id,
            ts: r.ts,
            riskLevel: r.riskLevel,
            score: r.score,
            reasons: JSON.parse(r.reasons || '[]'),
            payload: JSON.parse(r.payload || '{}'),
            status: r.status,
            acknowledgedAt: r.acknowledgedAt || null
          }))
          resolve({ total, page, limit, items })
        })
      })
    })
  })
}

function acknowledgeAlert(id) {
  const db = ensureDb()
  const now = new Date().toISOString()
  return new Promise((resolve, reject) => {
    db.run('UPDATE alerts SET status = ?, acknowledgedAt = ? WHERE id = ?', ['acknowledged', now, id], function (err) {
      db.close()
      if (err) return reject(err)
      resolve(this.changes > 0)
    })
  })
}

module.exports = { insertAlert, getAlerts, acknowledgeAlert, DB_PATH }

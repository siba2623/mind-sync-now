const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const detector = require('./detector')
const alerts = require('./alerts')
// Use SQLite adapter when available, fallback to JSON DB
let db
try {
  db = require('./sqlite-db')
  console.log('Using sqlite-db adapter, DB path:', db.DB_PATH)
} catch (e) {
  db = require('./db')
  console.log('Using json-file db adapter')
}

const app = express()
// Allow Authorization header for admin validation and enable preflight responses
app.use(cors({
  origin: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}))
app.use(bodyParser.json())
app.use(cookieParser())

// Simple admin auth middleware for alert endpoints
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_TOKEN || 'dev-jwt-secret'

function adminAuth(req, res, next) {
  // If no ADMIN_TOKEN configured, skip auth (dev mode)
  if (!process.env.ADMIN_TOKEN) return next()

  const authHeader = req.headers.authorization || ''
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const tokenFromCookie = req.cookies && req.cookies.admin_jwt
  const token = tokenFromHeader || tokenFromCookie

  if (!token) return res.status(401).json({ error: 'unauthorized' })

  try {
    jwt.verify(token, JWT_SECRET)
    return next()
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' })
  }
}

// Admin login: exchange raw admin token for a short-lived JWT stored in an HttpOnly cookie
app.post('/admin/login', (req, res) => {
  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'missing token' })
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'unauthorized' })

  const signed = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' })
  const cookieOpts = { httpOnly: true, sameSite: 'lax' }
  if (process.env.NODE_ENV === 'production') cookieOpts.secure = true
  res.cookie('admin_jwt', signed, cookieOpts)
  res.json({ ok: true })
})

app.post('/admin/logout', (req, res) => {
  res.clearCookie('admin_jwt')
  res.json({ ok: true })
})

app.post('/ingest', async (req, res) => {
  const payload = req.body || {}
  const result = detector.analyze(payload)
  if (result.riskLevel !== 'low') {
    await alerts.sendMockAlert(result, payload)
  }
  res.json(result)
})

app.get('/alerts', adminAuth, async (req, res) => {
  try {
    const opts = {
      page: req.query.page,
      limit: req.query.limit,
      riskLevel: req.query.riskLevel,
      status: req.query.status,
      q: req.query.q
    }
    const rows = await db.getAlerts(opts)
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/alerts/:id/acknowledge', adminAuth, async (req, res) => {
  const id = Number(req.params.id)
  if (!id) return res.status(400).json({ error: 'invalid id' })
  try {
    const ok = await db.acknowledgeAlert(id)
    if (!ok) return res.status(404).json({ error: 'not found' })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/', (req, res) => {
  // Return JSON status to avoid serving a bare HTML/text document
  res.json({ status: 'ok', service: 'crisis-prototype' })
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Crisis prototype listening on ${port}`))

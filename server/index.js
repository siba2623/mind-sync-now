const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const detector = require('./detector')
const alerts = require('./alerts')
const db = require('./db')

const app = express()
// Allow Authorization header for admin validation and enable preflight responses
app.use(cors({
  origin: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'OPTIONS']
}))
app.use(bodyParser.json())

// Simple admin auth middleware for alert endpoints
function adminAuth(req, res, next) {
  const token = process.env.ADMIN_TOKEN
  if (!token) return next()
  const auth = req.headers.authorization || ''
  if (auth === `Bearer ${token}`) return next()
  return res.status(401).json({ error: 'unauthorized' })
}

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

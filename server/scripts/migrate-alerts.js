const fs = require('fs')
const path = require('path')

const DB = require('../sqlite-db')

const ROOT = path.resolve(__dirname, '..')
const ALERTS_JSON = path.join(ROOT, 'alerts.json')

async function alreadyMigrated() {
  try {
    const rows = await DB.getAlerts()
    return (rows && rows.total && rows.total > 0)
  } catch (e) {
    return false
  }
}

async function run() {
  if (!fs.existsSync(ALERTS_JSON)) {
    console.log('No alerts.json found — nothing to migrate')
    return
  }

  if (await alreadyMigrated()) {
    console.log('Alerts DB already contains records — migration skipped')
    return
  }

  const raw = fs.readFileSync(ALERTS_JSON, 'utf8')
  let data
  try { data = JSON.parse(raw) } catch (e) { console.error('Failed to parse alerts.json', e); process.exit(1) }

  const items = data.alerts || []
  console.log(`Migrating ${items.length} alerts into SQLite DB at ${DB.DB_PATH}`)

  for (const a of items) {
    const ts = a.ts || new Date().toISOString()
    const result = { riskLevel: a.riskLevel, score: a.score, reasons: a.reasons }
    const payload = a.payload || {}
    try {
      await DB.insertAlert({ ts, result, payload })
    } catch (e) {
      console.error('Failed to insert alert', a.id, e)
    }
  }

  const migratedName = `alerts.json.migrated.${Date.now()}`
  const migratedPath = path.join(ROOT, migratedName)
  fs.renameSync(ALERTS_JSON, migratedPath)
  console.log(`Migration complete — original file moved to ${migratedName}`)
}

run().catch(err => { console.error(err); process.exit(1) })

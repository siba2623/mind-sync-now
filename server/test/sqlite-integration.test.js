const path = require('path')
const fs = require('fs')

// Use a dedicated test DB so we don't touch the real data
process.env.SQLITE_DB_PATH = path.resolve(__dirname, '..', 'alerts_test.sqlite')
const db = require('../sqlite-db')

async function run() {
  // ensure clean start
  try { fs.unlinkSync(process.env.SQLITE_DB_PATH) } catch (e) {}

  // insert a few alerts
  const now = new Date().toISOString()
  const a1 = await db.insertAlert({ ts: now, result: { riskLevel: 'high', score: 21, reasons: ['keyword:test'] }, payload: { text: 'I want to test' } })
  const a2 = await db.insertAlert({ ts: now, result: { riskLevel: 'low', score: 0, reasons: [] }, payload: { text: 'All good' } })

  if (!a1 || !a1.id) throw new Error('insertAlert did not return id for a1')
  if (!a2 || !a2.id) throw new Error('insertAlert did not return id for a2')

  const list = await db.getAlerts()
  if (!list || !Array.isArray(list.items)) throw new Error('getAlerts returned invalid shape')
  if (list.total < 2) throw new Error('expected at least 2 alerts after inserts')

  // acknowledge first alert
  const ok = await db.acknowledgeAlert(a1.id)
  if (!ok) throw new Error('acknowledgeAlert returned false')

  const acked = await db.getAlerts({ status: 'acknowledged' })
  if (!acked.items.find(i => i.id === a1.id)) throw new Error('acknowledged alert not found')

  console.log('SQLite integration test: SUCCESS')

  // cleanup
  try { fs.unlinkSync(process.env.SQLITE_DB_PATH) } catch (e) {}
}

run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1) })

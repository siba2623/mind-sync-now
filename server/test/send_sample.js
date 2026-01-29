const axios = require('axios')

async function run() {
  const samples = [
    { text: 'I want to die and I will kill myself', phq9: 22 },
    { text: 'I am feeling a bit down but okay', phq9: 4 },
    { text: 'I feel hopeless and alone and want to give up', phq9: 16 }
  ]

  const port = process.env.PORT || 3001
  for (const s of samples) {
    try {
      const r = await axios.post(`http://localhost:${port}/ingest`, s, { timeout: 5000 })
      console.log('Input:', s)
      console.log('Response:', r.data)
    } catch (e) {
      console.error('Error sending sample:', e && (e.message || e.code || String(e)))
      if (e && e.response) {
        console.error('Response status:', e.response.status)
        console.error('Response data:', e.response.data)
      }
      if (e && e.stack) console.error(e.stack)
    }
    console.log('---')
  }
}

run()

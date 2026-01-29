function findMatches(text, patterns) {
  const found = []
  if (!text) return found
  const t = text.toLowerCase()
  for (const p of patterns) {
    if (t.includes(p)) found.push(p)
  }
  return found
}

function analyze(payload) {
  const text = (payload.text || '')
  const phq9 = typeof payload.phq9 === 'number' ? payload.phq9 : null

  const keywordPatterns = [
    'suicide',
    "kill myself",
    'end my life',
    'hurt myself',
    'want to die',
    "can't go on",
    'no reason to live',
    'want to die'
  ]

  const heuristicPatterns = ['hopeless', 'worthless', 'alone', 'nobody', 'give up']

  const keywordMatches = findMatches(text, keywordPatterns)
  const heuristicMatches = findMatches(text, heuristicPatterns)

  let score = 0
  const reasons = []

  if (keywordMatches.length) {
    score += keywordMatches.length * 5
    reasons.push(...keywordMatches.map(k => `keyword:${k}`))
  }

  if (heuristicMatches.length) {
    score += heuristicMatches.length * 2
    reasons.push(...heuristicMatches.map(h => `heuristic:${h}`))
  }

  if (phq9 !== null) {
    if (phq9 >= 20) {
      score += 6
      reasons.push('phq9:severe')
    } else if (phq9 >= 15) {
      score += 4
      reasons.push('phq9:moderately_severe')
    } else if (phq9 >= 10) {
      score += 2
      reasons.push('phq9:moderate')
    }
  }

  const riskLevel = score >= 8 ? 'high' : score >= 4 ? 'medium' : 'low'

  return { riskLevel, score, reasons }
}

module.exports = { analyze }

// Vercel serverless function — generic Claude prompt → reply endpoint that
// powers all the "AI suggest" buttons across the Hub (movie picks, meal ideas,
// chore rotations, trip plans, weekend activity ideas, etc.).
//
// Same shape as the Kitchen app's /api/* routes: reads ANTHROPIC_API_KEY from
// env, calls the Messages API, returns { reply: "..." }.

const MODEL = 'claude-sonnet-4-5'

const SYSTEM_PROMPT =
  "You are the AI assistant for the Vallente family's home dashboard. " +
  "The family lives in Fairfield, CA (Solano County, between San Francisco and Sacramento). There are four adult members: Dave and Krista (parents) and David and Kailee (their adult kids, both in their 20s). " +
  "Keep replies short and useful — the app shows them in a small dialog. Aim for 6–10 lines unless asked for more. " +
  "When listing items, use plain text with one item per line (no markdown tables or code fences). " +
  "When suggesting activities, weight toward the Solano County and immediate-drive area: Fairfield, Suisun, Vacaville, Napa Valley (~30 min north), Lake Berryessa, and the Bay/Sacramento short-drive radius. Call out approximate cost and drive time. " +
  "When suggesting meals, default to family-friendly recipes that work on a typical weeknight."

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'POST only' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing ANTHROPIC_API_KEY' })
  }

  const { prompt } = req.body || {}
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Missing prompt' })
  }
  if (prompt.length > 2000) {
    return res.status(400).json({ error: 'Prompt too long (max 2000 chars)' })
  }

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt.trim() }],
      }),
    })

    if (!apiRes.ok) {
      const body = await apiRes.text()
      return res.status(502).json({ error: `Claude API ${apiRes.status}: ${body.slice(0, 200)}` })
    }

    const json = await apiRes.json()
    const reply = (json.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()

    if (!reply) {
      return res.status(502).json({ error: 'Claude returned an empty reply' })
    }

    return res.status(200).json({ reply })
  } catch (err) {
    return res.status(502).json({ error: `Failed to call Claude: ${err.message}` })
  }
}

import { useCallback, useState } from 'react'

// Calls the /api/ai-chat serverless function with a free-form prompt and
// returns the assistant's reply. The Hub's "AI suggest" buttons all funnel
// through this — each page passes a prompt tailored to its context.
export function useAiChat() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ask = useCallback(async (prompt) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`AI ${res.status}: ${body.slice(0, 200)}`)
      }
      const data = await res.json()
      return data.reply ?? ''
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { ask, loading, error }
}

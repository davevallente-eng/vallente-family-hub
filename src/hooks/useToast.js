import { useCallback, useEffect, useState } from 'react'

export function useToast() {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => setMessage(null), 2500)
    return () => clearTimeout(id)
  }, [message])

  const show = useCallback((msg) => setMessage(msg), [])

  return { message, show }
}

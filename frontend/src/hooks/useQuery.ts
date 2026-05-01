import { useState } from 'react'
import { queryRepo } from '../api/client'
import type { Message } from '../types'

export function useQuery() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ask = async (question: string) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: question }])
    setLoading(true)
    setError(null)
    try {
      const data = await queryRepo(question)
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.answer }])
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMessages([])
    setError(null)
  }

  return { messages, ask, loading, error, reset }
}

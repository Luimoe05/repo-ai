import { useState } from 'react'
import { queryRepo } from '../api/client'
import { describeQueryError } from '../api/errors'
import type { Exchange } from '../types'

export function useQuery() {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [pending, setPending] = useState(false)

  const run = async (id: string, question: string) => {
    setPending(true)
    try {
      const { answer } = await queryRepo(question)
      setExchanges(prev => prev.map(x => (x.id === id ? { ...x, answer, error: null } : x)))
    } catch (e) {
      const error = describeQueryError(e)
      setExchanges(prev => prev.map(x => (x.id === id ? { ...x, error } : x)))
    } finally {
      setPending(false)
    }
  }

  /* A failed question keeps its section and its number. The document stays
     intact, and the reader can retry in place instead of retyping. */
  const ask = async (question: string) => {
    const id = crypto.randomUUID()
    setExchanges(prev => [...prev, { id, n: prev.length + 1, question, answer: null, error: null }])
    await run(id, question)
  }

  const retry = async (id: string) => {
    const target = exchanges.find(x => x.id === id)
    if (!target) return
    setExchanges(prev => prev.map(x => (x.id === id ? { ...x, error: null } : x)))
    await run(id, target.question)
  }

  return { exchanges, ask, retry, pending }
}

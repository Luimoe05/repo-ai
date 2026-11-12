import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { queryRepo } from '../api/client'
import { describeQueryError } from '../api/errors'
import type { Exchange } from '../types'

export function useQuery() {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [pending, setPending] = useState(false)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  const run = async (id: string, question: string) => {
    const request = new AbortController()
    controller.current = request
    setPending(true)
    try {
      const { answer } = await queryRepo(question, undefined, request.signal)
      setExchanges(prev => prev.map(x => (x.id === id ? { ...x, answer, error: null } : x)))
    } catch (e) {
      if (axios.isCancel(e)) return
      const error = describeQueryError(e)
      setExchanges(prev => prev.map(x => (x.id === id ? { ...x, error } : x)))
    } finally {
      if (controller.current === request) {
        controller.current = null
        setPending(false)
      }
    }
  }

  const ask = async (question: string) => {
    if (controller.current || !question.trim()) return
    const id = crypto.randomUUID()
    const trimmed = question.trim()
    setExchanges(prev => [...prev, { id, n: prev.length + 1, question: trimmed, answer: null, error: null }])
    await run(id, trimmed)
  }

  const retry = async (id: string) => {
    if (controller.current) return
    const target = exchanges.find(x => x.id === id)
    if (!target || target.answer) return
    setExchanges(prev => prev.map(x => (x.id === id ? { ...x, error: null } : x)))
    await run(id, target.question)
  }

  return { exchanges, ask, retry, pending }
}

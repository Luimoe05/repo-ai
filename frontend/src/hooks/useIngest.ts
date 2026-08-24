import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { ingestRepo } from '../api/client'
import { describeIngestError } from '../api/errors'
import type { IngestResponse } from '../types'

export function useIngest() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  /* Held so the UI can offer a way forward when a long ingest drops: the
     server may well have finished even though the connection did not. */
  const [failedAfter, setFailedAfter] = useState(0)
  const controller = useRef<AbortController | null>(null)

  /* Elapsed time is the only progress figure we actually have — the backend
     clones, parses, and embeds in a single request. Better an honest clock
     than a progress bar that invents its own percentages. */
  useEffect(() => {
    if (!pending) return
    const started = Date.now()
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(tick)
  }, [pending])

  useEffect(() => () => controller.current?.abort(), [])

  const ingest = async (url: string): Promise<IngestResponse | null> => {
    controller.current?.abort()
    controller.current = new AbortController()
    const started = Date.now()

    setElapsed(0)
    setFailedAfter(0)
    setPending(true)
    setError(null)
    try {
      return await ingestRepo(url, controller.current.signal)
    } catch (e) {
      if (axios.isCancel(e)) return null
      setFailedAfter(Math.floor((Date.now() - started) / 1000))
      setError(describeIngestError(e))
      return null
    } finally {
      setPending(false)
    }
  }

  const cancel = () => controller.current?.abort()

  return { ingest, cancel, pending, error, elapsed, failedAfter }
}

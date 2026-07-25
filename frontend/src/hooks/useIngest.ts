import { useEffect, useState } from 'react'
import { ingestRepo } from '../api/client'
import { describeIngestError } from '../api/errors'
import type { IngestResponse } from '../types'

export function useIngest() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)

  /* Elapsed time is the only progress figure we actually have — the backend
     clones, parses, and embeds in a single request. Better an honest clock
     than a progress bar that invents its own percentages. */
  useEffect(() => {
    if (!pending) return
    const started = Date.now()
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000)
    return () => clearInterval(tick)
  }, [pending])

  const ingest = async (url: string): Promise<IngestResponse | null> => {
    setElapsed(0)
    setPending(true)
    setError(null)
    try {
      return await ingestRepo(url)
    } catch (e) {
      setError(describeIngestError(e))
      return null
    } finally {
      setPending(false)
    }
  }

  return { ingest, pending, error, elapsed }
}

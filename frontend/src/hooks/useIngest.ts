import { useState } from 'react'
import { ingestRepo } from '../api/client'
import type { IngestResponse } from '../types'

export function useIngest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ingest = async (url: string): Promise<IngestResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      return await ingestRepo(url)
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Failed to ingest repository. Check the URL and try again.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { ingest, loading, error }
}

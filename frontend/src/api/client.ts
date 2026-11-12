import axios from 'axios'
import type { IngestResponse, QueryResponse } from '../types'

/** Chunks retrieved per answer. Mirrors the backend default so the interface
 *  can state its own provenance honestly. */
export const TOP_K = 5

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  // Without this the client falls back to relative URLs, every POST hits the
  // Vercel origin, and the HTML that comes back fails to parse as JSON.
  console.error('VITE_API_URL is not set — API requests will not reach the backend.')
}

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

/** Ingestion clones, parses and embeds in one request, so it needs a long
 *  ceiling — but not axios's default of no timeout at all, which leaves a
 *  dropped connection pending forever. */
const INGEST_TIMEOUT_MS = 6 * 60_000
const QUERY_TIMEOUT_MS = 60_000

export const ingestRepo = async (url: string, signal?: AbortSignal): Promise<IngestResponse> => {
  const { data } = await client.post<IngestResponse>(
    '/ingest',
    { url },
    { signal, timeout: INGEST_TIMEOUT_MS },
  )
  return data
}

export const queryRepo = async (
  question: string,
  top_k = TOP_K,
  signal?: AbortSignal,
): Promise<QueryResponse> => {
  const { data } = await client.post<QueryResponse>(
    '/query',
    { question, top_k },
    { signal, timeout: QUERY_TIMEOUT_MS },
  )
  return data
}

/** Wakes a sleeping free-tier instance and warms DNS/TLS before the user's
 *  first real request. Failure is not interesting — it just means the ping
 *  raced the cold start. */
export const warmBackend = async (): Promise<boolean> => {
  try {
    await client.get('/health', { timeout: 90_000 })
    return true
  } catch {
    return false
  }
}

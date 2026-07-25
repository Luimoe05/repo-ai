import axios from 'axios'
import type { IngestResponse, QueryResponse } from '../types'

/** Chunks retrieved per answer. Mirrors the backend default so the interface
 *  can state its own provenance honestly. */
export const TOP_K = 5

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const ingestRepo = async (url: string): Promise<IngestResponse> => {
  const { data } = await client.post<IngestResponse>('/ingest', { url })
  return data
}

export const queryRepo = async (question: string, top_k = TOP_K): Promise<QueryResponse> => {
  const { data } = await client.post<QueryResponse>('/query', { question, top_k })
  return data
}

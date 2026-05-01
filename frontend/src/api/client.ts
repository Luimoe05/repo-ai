import axios from 'axios'
import type { IngestResponse, QueryResponse } from '../types'

const client = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

export const ingestRepo = async (url: string): Promise<IngestResponse> => {
  const { data } = await client.post<IngestResponse>('/ingest', { url })
  return data
}

export const queryRepo = async (question: string, top_k = 5): Promise<QueryResponse> => {
  const { data } = await client.post<QueryResponse>('/query', { question, top_k })
  return data
}

export interface IngestResponse {
  message: string
  chunks_stored: number
}

export interface QueryResponse {
  answer: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

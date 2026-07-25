export interface IngestResponse {
  message: string
  chunks_stored: number
}

export interface QueryResponse {
  answer: string
}

/** One numbered section of the document: a question and what came back. */
export interface Exchange {
  id: string
  n: number
  question: string
  answer: string | null
  error: string | null
}

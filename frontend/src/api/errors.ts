/** Turn an axios failure into something that tells the reader what happened
 *  and what to do next. The backend rate-limits ingestion to 3/hour and
 *  queries to 30/minute, and slowapi reports those as 429 with an `error`
 *  key rather than FastAPI's `detail` — so 429 is handled on its own. */
interface ApiError {
  response?: {
    status?: number
    data?: { detail?: string | { msg?: string }[]; error?: string }
    headers?: Record<string, string>
  }
  code?: string
}

/** FastAPI returns a string `detail` for HTTPException and an array of
 *  objects for 422 validation errors. The array carries the message the URL
 *  validator raised, which is the one worth showing. */
const detailOf = (e: ApiError): string | undefined => {
  const detail = e.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const msg = detail[0]?.msg
    // Pydantic prefixes validator messages with "Value error, ".
    return msg?.replace(/^Value error,\s*/, '')
  }
  return undefined
}

const retryAfter = (e: ApiError): string => {
  const secs = Number(e.response?.headers?.['retry-after'])
  if (!Number.isFinite(secs) || secs <= 0) return 'Try again later'
  if (secs < 90) return `Try again in ${Math.ceil(secs)} seconds`
  return `Try again in ${Math.ceil(secs / 60)} minutes`
}

/** A timeout and a genuinely unreachable server need different advice, and
 *  neither should be reported as the other. */
const isTimeout = (e: ApiError) => e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT'

export function describeIngestError(e: unknown): string {
  const err = e as ApiError
  if (err.response?.status === 429) {
    return `Rate limit reached. RepoAI indexes 3 repositories an hour. ${retryAfter(err)}, or query the repo already indexed.`
  }
  if (isTimeout(err)) {
    return 'That repository took longer than six minutes to index. It may be too large — try a smaller one.'
  }
  if (!err.response) {
    return 'Lost contact with the RepoAI server. It may still be indexing, or it may have been asleep — wait a moment and try again.'
  }
  return detailOf(err) ?? 'Could not index that repository. Check that the URL points to a public GitHub repo.'
}

export function describeQueryError(e: unknown): string {
  const err = e as ApiError
  if (err.response?.status === 429) {
    return `Rate limit reached — 30 questions a minute. ${retryAfter(err)}.`
  }
  if (isTimeout(err)) {
    return 'That question took too long to answer. Ask again.'
  }
  if (!err.response) {
    return 'Could not reach the RepoAI server. Check your connection and ask again.'
  }
  return detailOf(err) ?? 'The index did not answer. Ask again.'
}

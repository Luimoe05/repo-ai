/** Turn an axios failure into something that tells the reader what happened
 *  and what to do next. The backend rate-limits ingestion to 3/hour and
 *  queries to 30/minute, and slowapi reports those as 429 with an `error`
 *  key rather than FastAPI's `detail` — so 429 is handled on its own. */
interface ApiError {
  response?: {
    status?: number
    data?: { detail?: string; error?: string }
  }
  code?: string
}

const detailOf = (e: ApiError) => e.response?.data?.detail

export function describeIngestError(e: unknown): string {
  const err = e as ApiError
  if (err.response?.status === 429) {
    return 'Rate limit reached. RepoAI indexes 3 repositories an hour. Try again later, or query the repo already indexed.'
  }
  if (!err.response) {
    return 'Could not reach the RepoAI server. Check your connection and try again.'
  }
  return detailOf(err) ?? 'Could not index that repository. Check that the URL points to a public GitHub repo.'
}

export function describeQueryError(e: unknown): string {
  const err = e as ApiError
  if (err.response?.status === 429) {
    return 'Rate limit reached — 30 questions a minute. Wait a moment, then ask again.'
  }
  if (!err.response) {
    return 'Could not reach the RepoAI server. Check your connection and ask again.'
  }
  return detailOf(err) ?? 'The index did not answer. Ask again.'
}

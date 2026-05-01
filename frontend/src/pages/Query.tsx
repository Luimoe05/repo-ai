import Navbar from '../components/Navbar'
import ResponseDisplay from '../components/ResponseDisplay'
import QueryInput from '../components/QueryInput'
import { useQuery } from '../hooks/useQuery'

interface QueryProps {
  repoUrl: string
  chunksStored: number
  onReset: () => void
}

export default function Query({ repoUrl, chunksStored, onReset }: QueryProps) {
  const { messages, ask, loading, error } = useQuery()

  return (
    <div className="query-page fade-in">
      <Navbar repoUrl={repoUrl} onReset={onReset} />
      <main className="query-body">
        <div className="query-meta fade-up">
          <span className="chunks-badge" aria-label={`${chunksStored.toLocaleString()} code chunks indexed`}>
            {chunksStored.toLocaleString()} chunks indexed
          </span>
        </div>
        <ResponseDisplay messages={messages} loading={loading} />
        {error && <p className="error-msg error-msg-query" role="alert">{error}</p>}
      </main>
      <div className="query-footer">
        <QueryInput onSubmit={ask} loading={loading} />
      </div>
    </div>
  )
}

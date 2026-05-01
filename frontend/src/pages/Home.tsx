import RepoInput from '../components/RepoInput'
import { useIngest } from '../hooks/useIngest'

interface HomeProps {
  onSuccess: (url: string, chunks: number) => void
}

export default function Home({ onSuccess }: HomeProps) {
  const { ingest, loading, error } = useIngest()

  const handleSubmit = async (url: string) => {
    const result = await ingest(url)
    if (result) onSuccess(url, result.chunks_stored)
  }

  return (
    <main className="home">
      <div className="home-content fade-up">
        <p className="home-badge">Powered by OpenAI · Pinecone</p>
        <h1 className="home-title">
          Ask your codebase<br />
          <span className="title-accent">anything.</span>
        </h1>
        <p className="home-subtitle">
          Paste a GitHub repo URL and start asking questions about the code in plain English.
        </p>
        <RepoInput onSubmit={handleSubmit} loading={loading} error={error} />
        {loading && (
          <p className="loading-status fade-in" aria-live="polite">
            Cloning and analyzing repository — this may take a minute...
          </p>
        )}
      </div>
    </main>
  )
}

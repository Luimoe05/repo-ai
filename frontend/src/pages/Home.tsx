import RepoInput from '../components/RepoInput'
import ThemeToggle from '../components/ThemeToggle'
import { useIngest } from '../hooks/useIngest'

interface HomeProps {
  onSuccess: (url: string, chunks: number) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function Home({ onSuccess, theme, onToggleTheme }: HomeProps) {
  const { ingest, loading, error } = useIngest()

  const handleSubmit = async (url: string) => {
    const result = await ingest(url)
    if (result) onSuccess(url, result.chunks_stored)
  }

  return (
    <main className="home">
      <ThemeToggle theme={theme} onToggle={onToggleTheme} className="home-theme-toggle" />
      <div className="home-content">
        <p className="home-badge anim-in">Powered by OpenAI · Pinecone</p>
        <h1 className="home-title anim-in anim-d1">
          Ask your codebase
          <span className="title-accent">anything.</span>
        </h1>
        <p className="home-subtitle anim-in anim-d2">
          Paste a GitHub repo URL and start asking questions about the code in plain English.
        </p>
        <div className="anim-in anim-d3">
          <RepoInput onSubmit={handleSubmit} loading={loading} error={error} />
        </div>
        {loading && (
          <p className="loading-status fade-in" aria-live="polite">
            Cloning and analyzing repository — this may take a minute...
          </p>
        )}
      </div>
    </main>
  )
}

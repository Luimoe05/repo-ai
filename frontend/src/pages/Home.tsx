import { useRef } from 'react'
import RepoInput from '../components/RepoInput'
import ThemeToggle from '../components/ThemeToggle'
import { useIngest } from '../hooks/useIngest'

interface HomeProps {
  onIndexed: (url: string, chunks: number) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

/** The real mechanics, stated plainly. This is the pitch — no feature cards. */
const SPEC: [string, string][] = [
  ['Parse', 'tree-sitter · functions & classes · py js ts jsx tsx'],
  ['Index', 'text-embedding-3-small · 1536-d · cosine'],
  ['Answer', 'gpt-4o-mini · top 5 chunks'],
]

export default function Home({ onIndexed, theme, onToggleTheme }: HomeProps) {
  const { ingest, pending, error, elapsed, failedAfter } = useIngest()

  const lastUrl = useRef('')

  const handleSubmit = async (url: string) => {
    lastUrl.current = url
    const result = await ingest(url)
    if (result) onIndexed(url, result.chunks_stored)
  }

  return (
    <main className="tp">
      <header className="tp-head">
        <span className="wordmark">Repo<span className="wordmark-ai">AI</span></span>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </header>

      <span className="rule" aria-hidden="true" />

      <div className="tp-main">
        <h1 className="tp-lede">
          <span className="tp-lede-line">You’ve been handed a repo</span>
          <span className="tp-lede-line">you’ve never read.</span>
          <span className="tp-lede-turn">Ask it questions instead.</span>
        </h1>

        <p className="tp-sub">
          Paste a GitHub URL. RepoAI reads the source and answers in plain English,
          building the reference the repository never shipped with.
        </p>

        <RepoInput
          onSubmit={handleSubmit}
          pending={pending}
          error={error}
          elapsed={elapsed}
          failedAfter={failedAfter}
          /* The connection dropped, but the server may have finished. Let the
             visitor through to the query view rather than stranding them. */
          onRecover={() => onIndexed(lastUrl.current, 0)}
        />

        <dl className="spec">
          {SPEC.map(([key, value]) => (
            <div key={key} style={{ display: 'contents' }}>
              <dt className="label spec-key">{key}</dt>
              <dd className="spec-val">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className="tp-foot">
        <p className="tp-credit">
          Built by{' '}
          <a className="tp-credit-link" href="https://www.luismoreno.space" target="_blank" rel="noopener noreferrer">
            Luis-Angel Moreno
          </a>
        </p>
      </footer>
    </main>
  )
}

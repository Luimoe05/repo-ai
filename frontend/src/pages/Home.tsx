import { useRef } from 'react'
import RepoInput from '../components/RepoInput'
import ThemeToggle from '../components/ThemeToggle'
import Brand from '../components/Brand'
import { useIngest } from '../hooks/useIngest'

interface HomeProps {
  onIndexed: (url: string, chunks: number) => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function Home({ onIndexed, theme, onToggleTheme }: HomeProps) {
  const { ingest, pending, error, elapsed, failedAfter } = useIngest()
  const lastUrl = useRef('')
  const handleSubmit = async (url: string) => {
    lastUrl.current = url
    const result = await ingest(url)
    if (result) onIndexed(url, result.chunks_stored)
  }

  return (
    <div className="home">
      <a className="skip-link" href="#workspace">Skip to repository input</a>
      <header className="home-head">
        <Brand />
        <div className="header-actions">
          <a href="https://github.com/Luimoe05/repo-ai" target="_blank" rel="noopener noreferrer">Source code <span aria-hidden="true">↗</span></a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>
      <main className="home-layout" id="workspace" tabIndex={-1}>
        <div className="home-intro">
          <h1>Make yourself at home<br />in any codebase.</h1>
          <p className="intro-note">Bring a GitHub repo. Ask a question.<br className="mobile-break" /> Get to the part that matters.</p>
        </div>
        <section className="home-workspace" aria-label="Open a repository">
          <RepoInput onSubmit={handleSubmit} pending={pending} error={error} elapsed={elapsed} failedAfter={failedAfter} onRecover={() => onIndexed(lastUrl.current, 0)} />
        </section>
        <section className="question-preview" aria-labelledby="questions-title">
          <div className="question-preview-intro">
            <h2 id="questions-title">Less searching.<br /> More understanding.</h2>
            <p>From the big picture to the little details, follow your curiosity through the source.</p>
          </div>
          <ul className="preview-questions">
            <li><span aria-hidden="true">01</span>What does this project do?</li>
            <li><span aria-hidden="true">02</span>Where does execution start?</li>
            <li><span aria-hidden="true">03</span>How is the code organized?</li>
          </ul>
          <p className="supported-languages">Works with Python, JavaScript, and TypeScript.</p>
        </section>
      </main>
      <footer className="home-foot"><p>Built by <a href="https://www.luismoreno.space" target="_blank" rel="noopener noreferrer">Luis-Angel Moreno <span aria-hidden="true">↗</span></a></p><a href="https://github.com/Luimoe05/repo-ai" target="_blank" rel="noopener noreferrer">Made for curious developers <span aria-hidden="true">↗</span></a></footer>
    </div>
  )
}

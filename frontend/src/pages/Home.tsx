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
        <span className="header-context">Codebase explorer</span>
        <div className="header-actions">
          <a href="https://github.com/Luimoe05/repo-ai" target="_blank" rel="noopener noreferrer">Source code <span aria-hidden="true">↗</span></a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>
      <main className="home-layout" id="workspace" tabIndex={-1}>
        <aside className="home-intro">
          <p className="eyebrow">From unfamiliar to understood</p>
          <h1>A shorter path<br /> into the code.</h1>
          <p className="intro-note">Ask questions about a GitHub repository. Get answers grounded in its source.</p>
          <ol className="workflow">
            <li><span className="workflow-number">1</span><div><h2>Bring a repository</h2><p>Start with a public GitHub URL.</p></div></li>
            <li><span className="workflow-number">2</span><div><h2>Let us read the source</h2><p>We index the code so you don’t have to.</p></div></li>
            <li><span className="workflow-number">3</span><div><h2>Follow your questions</h2><p>Explore the architecture, entry points, and decisions.</p></div></li>
          </ol>
          <div className="intro-bottom"><span className="language-mark" aria-hidden="true">{ '{ }' }</span><p>Reads Python, JavaScript,<br />and TypeScript source files.</p></div>
        </aside>
        <section className="home-workspace" aria-labelledby="open-title">
          <div className="workspace-heading"><span className="section-kicker">Start exploring</span><h2 id="open-title">Open a repository</h2><p>Which codebase would you like to understand?</p></div>
          <RepoInput onSubmit={handleSubmit} pending={pending} error={error} elapsed={elapsed} failedAfter={failedAfter} onRecover={() => onIndexed(lastUrl.current, 0)} />
          <div className="question-preview"><h3>A few places to start</h3><p>“Where does execution start?”</p><p>“How is the code organized?”</p><p>“What happens when a request comes in?”</p></div>
        </section>
      </main>
      <footer className="home-foot"><p>Built by <a href="https://www.luismoreno.space" target="_blank" rel="noopener noreferrer">Luis-Angel Moreno <span aria-hidden="true">↗</span></a></p><span>Read less. Understand more.</span></footer>
    </div>
  )
}

import Brand from './Brand'
import ThemeToggle from './ThemeToggle'

interface DocHeaderProps {
  repoUrl: string
  chunks: number
  onReset: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function DocHeader({ repoUrl, chunks, onReset, theme, onToggleTheme }: DocHeaderProps) {
  const repoName = repoUrl.replace(/\.git$/, '').split('/').slice(-2).join('/')

  return (
    <header className="doc-head">
      <Brand />
      <div className="doc-repo">
        <span className="doc-repo-name" title={repoName}>{repoName}</span>
        {/* Recovery after a dropped connection reaches this view without a
            count. "0 source passages indexed" would be a lie; say nothing instead. */}
        <span className="doc-chunks">
          {chunks > 0 ? `${chunks.toLocaleString()} source passages indexed` : 'Ready to explore'}
        </span>
      </div>
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      <button className="doc-reset" onClick={onReset}>Switch repo</button>
    </header>
  )
}

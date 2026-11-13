import { useRef, useState, type FormEvent } from 'react'
import { repositoryUrl } from '../utils/repositoryUrl'

interface RepoInputProps {
  onSubmit: (url: string) => void
  pending: boolean
  error: string | null
  elapsed: number
  /** Seconds the last failed attempt ran for. A failure after a long wait is
   *  usually a dropped connection rather than a rejected repo — the server may
   *  have finished indexing regardless. */
  failedAfter: number
  onRecover: () => void
}

/** Repos that index quickly, so a first-time visitor doesn't have to bring
 *  their own. The first one is this app's own source. */
const SEEDS = [
  { label: 'Luimoe05/repo-ai', url: 'https://github.com/Luimoe05/repo-ai', description: 'Explore the source behind this tool', language: 'TypeScript' },
  { label: 'sindresorhus/p-map', url: 'https://github.com/sindresorhus/p-map', description: 'Concurrent mapping for promises', language: 'JavaScript' },
  { label: 'psf/requests', url: 'https://github.com/psf/requests', description: 'A familiar HTTP library for Python', language: 'Python' },
]

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** Name the stage actually running. A single static sentence promising "about
 *  a minute" reads as broken once the clock passes it. */
const phase = (s: number): string => {
  if (s < 75) return 'Reading and indexing the repository…'
  return 'Still indexing. Large repositories can take a few minutes.'
}

export default function RepoInput({
  onSubmit,
  pending,
  error,
  elapsed,
  failedAfter,
  onRecover,
}: RepoInputProps) {
  const [url, setUrl] = useState('')
  const [validation, setValidation] = useState<string | null>(null)
  const [submittedUrl, setSubmittedUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = SEEDS.find(seed => seed.url === url.trim())
  const visibleError = validation || (url === submittedUrl ? error : null)

  const selectExample = (value: string) => {
    setUrl(value)
    setValidation(null)
    inputRef.current?.focus({ preventScroll: true })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (pending) return
    const normalized = repositoryUrl(url)
    if (!normalized) {
      setValidation('Enter a GitHub repository, like github.com/owner/repo.')
      inputRef.current?.focus({ preventScroll: true })
      return
    }
    setValidation(null)
    setSubmittedUrl(url)
    onSubmit(normalized)
  }

  return (
    <form className="tp-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="repo-url" className="input-label sr-only">GitHub repository URL</label>
      <div className="field">
        <span className="field-mark" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </span>
        <input
          ref={inputRef}
          id="repo-url"
          className="field-input"
          type="text"
          inputMode="url"
          placeholder="https://github.com/owner/repo"
          value={url}
          onChange={e => { setUrl(e.target.value); setValidation(null) }}
          disabled={pending}
          aria-describedby={visibleError ? 'repo-help repo-error' : 'repo-help'}
          aria-invalid={!!visibleError}
          required
          title="Enter a public repository URL, such as https://github.com/owner/repo"
          autoComplete="url"
          spellCheck={false}
        />
        <button className="action" type="submit" disabled={pending || !url.trim()}>
          {pending && <span className="busy-indicator" aria-hidden="true" />}
          {pending ? 'Indexing…' : 'Explore repository'}
          {!pending && <span aria-hidden="true">→</span>}
        </button>
      </div>

      <p className="input-help" id="repo-help">Public GitHub repositories · Indexing may take a few minutes.</p>
      {visibleError && (
        <p className="notice" id="repo-error" role="alert">
          <span className="notice-tag">Failed</span>
          <span className="notice-body">
            {visibleError}
            {!validation && failedAfter > 25 && (
              <>
                {' '}
                <button type="button" className="notice-action" onClick={onRecover}>
                  Try asking anyway
                </button>
              </>
            )}
          </span>
        </p>
      )}
      <div className="seeds">
        <p className="seeds-label">Try a repository</p>
        <ul className="repo-examples">
          {SEEDS.map(seed => (
            <li key={seed.url}>
              <button type="button" className="repo-example" aria-pressed={selected?.url === seed.url} onClick={() => selectExample(seed.url)} disabled={pending} title={seed.description} aria-label={`Use ${seed.label}`}>
                <span className="repo-example-name">{seed.label}</span>
                <span className="repo-example-arrow" aria-hidden="true">{selected?.url === seed.url ? '✓' : '→'}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="repo-feedback" aria-live="polite" aria-atomic="true">
        {pending ? (
          <div className="tp-progress">
            <p className="tp-progress-row"><span>{phase(elapsed)}</span><span className="tp-elapsed" aria-hidden="true">{clock(elapsed)}</span></p>
            <span className="scanline" aria-hidden="true" />
          </div>
        ) : <p className="selection-note">{selected ? <><span aria-hidden="true">✓</span> {selected.label} selected. Ready to explore.</> : ''}</p>}
      </div>
    </form>
  )
}

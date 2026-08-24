import { useState, type FormEvent } from 'react'

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
  { label: 'Luimoe05/repo-ai', url: 'https://github.com/Luimoe05/repo-ai', self: true },
  { label: 'sindresorhus/p-map', url: 'https://github.com/sindresorhus/p-map', self: false },
  { label: 'psf/requests', url: 'https://github.com/psf/requests', self: false },
]

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** Name the stage actually running. A single static sentence promising "about
 *  a minute" reads as broken once the clock passes it. */
const phase = (s: number): string => {
  if (s < 8) return 'Cloning the repository…'
  if (s < 25) return 'Parsing with tree-sitter…'
  if (s < 75) return 'Embedding chunks. This is the slow part.'
  return 'Still going — large repositories can take two or three minutes.'
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (url.trim() && !pending) onSubmit(url.trim())
  }

  return (
    <form className="tp-form" onSubmit={handleSubmit}>
      <label htmlFor="repo-url" className="sr-only">GitHub repository URL</label>
      <div className="field">
        <span className="field-mark" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </span>
        <input
          id="repo-url"
          className="field-input"
          type="url"
          inputMode="url"
          placeholder="https://github.com/owner/repo"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={pending}
          autoFocus
          autoComplete="url"
          spellCheck={false}
        />
        <button className="action" type="submit" disabled={pending || !url.trim()}>
          {pending ? 'Indexing' : 'Index'}
        </button>
      </div>

      <div className="seeds">
        <span className="label seeds-label">Or try</span>
        {SEEDS.map(seed => (
          <button
            key={seed.url}
            type="button"
            className={seed.self ? 'seed seed-self' : 'seed'}
            onClick={() => setUrl(seed.url)}
            disabled={pending}
            aria-label={
              seed.self
                ? `Use ${seed.label} — the source of this app`
                : `Use ${seed.label}`
            }
          >
            {seed.label}
          </button>
        ))}
      </div>

      {pending && (
        <div className="tp-progress" aria-live="polite">
          <p className="tp-progress-row">
            <span className="tp-progress-note">{phase(elapsed)}</span>
            <span className="tp-elapsed">{clock(elapsed)}</span>
          </p>
          <span className="scanline" aria-hidden="true" />
        </div>
      )}

      {error && (
        <p className="notice" role="alert">
          <span className="notice-tag">Failed</span>
          <span className="notice-body">
            {error}
            {failedAfter > 25 && (
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
    </form>
  )
}

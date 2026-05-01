import { useState, type FormEvent } from 'react'

interface RepoInputProps {
  onSubmit: (url: string) => void
  loading: boolean
  error: string | null
}

export default function RepoInput({ onSubmit, loading, error }: RepoInputProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (url.trim()) onSubmit(url.trim())
  }

  return (
    <form className="repo-form" onSubmit={handleSubmit}>
      <label htmlFor="repo-url" className="sr-only">GitHub repository URL</label>
      <div className="input-wrapper">
        <span className="input-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </span>
        <input
          id="repo-url"
          className="repo-input"
          type="url"
          placeholder="https://github.com/user/repo"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={loading}
          autoFocus
          autoComplete="url"
        />
        <button
          className="submit-btn"
          type="submit"
          disabled={loading || !url.trim()}
          aria-label="Analyze repository"
        >
          {loading ? <span className="spinner" aria-hidden="true" /> : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="error-msg" role="alert">{error}</p>}
    </form>
  )
}

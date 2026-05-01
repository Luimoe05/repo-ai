import { useState, type FormEvent, type KeyboardEvent } from 'react'

interface QueryInputProps {
  onSubmit: (question: string) => void
  loading: boolean
}

export default function QueryInput({ onSubmit, loading }: QueryInputProps) {
  const [question, setQuestion] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (question.trim() && !loading) {
      onSubmit(question.trim())
      setQuestion('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (question.trim() && !loading) {
        onSubmit(question.trim())
        setQuestion('')
      }
    }
  }

  return (
    <form className="query-form" onSubmit={handleSubmit}>
      <label htmlFor="query-input" className="sr-only">Ask a question about the codebase</label>
      <div className="query-input-wrapper">
        <textarea
          id="query-input"
          className="query-input"
          placeholder="Ask anything about the codebase..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
          autoFocus
        />
        <button
          className="send-btn"
          type="submit"
          disabled={loading || !question.trim()}
          aria-label="Send question"
        >
          {loading ? <span className="spinner" aria-hidden="true" /> : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      <p className="query-hint" aria-live="polite">Enter to send · Shift+Enter for new line</p>
    </form>
  )
}

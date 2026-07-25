import { useState, type FormEvent, type KeyboardEvent } from 'react'

interface ComposerProps {
  onSubmit: (question: string) => void
  pending: boolean
}

export default function Composer({ onSubmit, pending }: ComposerProps) {
  const [question, setQuestion] = useState('')

  const send = () => {
    const trimmed = question.trim()
    if (!trimmed || pending) return
    onSubmit(trimmed)
    setQuestion('')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    send()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="composer">
      <form className="composer-inner" onSubmit={handleSubmit}>
        <label htmlFor="question" className="sr-only">Ask a question about this repository</label>
        <div className="field">
          <textarea
            id="question"
            className="composer-input"
            placeholder="Ask about this repo…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={pending}
            rows={1}
            autoFocus
          />
          <button className="action" type="submit" disabled={pending || !question.trim()}>
            {pending ? 'Reading' : 'Ask'}
            {!pending && (
              <span className="action-glyph" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 3v4a3 3 0 0 1-3 3H3" />
                  <path d="M6 7 3 10l3 3" />
                </svg>
              </span>
            )}
          </button>
        </div>
        <p className="label composer-hint">Enter to ask · Shift + Enter for a new line</p>
      </form>
    </div>
  )
}

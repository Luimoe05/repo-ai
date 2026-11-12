import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

interface ComposerProps {
  onSubmit: (question: string) => void
  pending: boolean
}

export default function Composer({ onSubmit, pending }: ComposerProps) {
  const [question, setQuestion] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 180)}px`
  }, [question])

  const send = () => {
    const trimmed = question.trim()
    if (!trimmed || pending) return
    onSubmit(trimmed)
    setQuestion('')
    inputRef.current?.focus({ preventScroll: true })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    send()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
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
            ref={inputRef}
            id="question"
            className="composer-input"
            placeholder="Ask about this repo…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            aria-describedby="composer-hint"
          />
          <button className="action" type="submit" disabled={pending || !question.trim()}>
            {pending && <span className="busy-indicator" aria-hidden="true" />}
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
        <p className="label composer-hint" id="composer-hint">{pending ? 'Reading the source. You can draft your next question.' : 'Enter to ask · Shift + Enter for a new line'}</p>
      </form>
    </div>
  )
}

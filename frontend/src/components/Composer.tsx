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
          </button>
        </div>
        <p className="label composer-hint">Enter to ask · Shift + Enter for a new line</p>
      </form>
    </div>
  )
}

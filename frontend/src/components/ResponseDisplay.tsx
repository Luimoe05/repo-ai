import { useEffect, useRef } from 'react'
import type { Message } from '../types'

interface ResponseDisplayProps {
  messages: Message[]
  loading: boolean
}

export default function ResponseDisplay({ messages, loading }: ResponseDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (messages.length === 0 && !loading) {
    return (
      <div className="messages-empty" role="status">
        <div className="empty-icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p>Repo indexed. Ask your first question.</p>
      </div>
    )
  }

  return (
    <div className="messages" role="log" aria-live="polite" aria-label="Conversation">
      {messages.map((msg) => (
        <div key={msg.id} className={`message message-${msg.role}`}>
          <div className="message-bubble">{msg.content}</div>
        </div>
      ))}
      {loading && (
        <div className="message message-assistant" aria-label="Thinking">
          <div className="message-bubble typing" aria-hidden="true">
            <span /><span /><span />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

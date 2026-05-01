import { useEffect, useRef, useState } from 'react'
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
          {msg.role === 'assistant' ? (
            <TypingMessage content={msg.content} />
          ) : (
            <div className="message-bubble">{msg.content}</div>
          )}
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

function TypingMessage({ content }: { content: string }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    const duration = Math.min(Math.max(content.length * 10, 600), 2500)
    const start = Date.now()

    const animate = () => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      setDisplayed(content.slice(0, Math.floor(progress * content.length)))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayed(content)
        setDone(true)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [content])

  return (
    <div className="message-bubble">
      <MarkdownText content={displayed} />
      {!done && <span className="typing-cursor" aria-hidden="true" />}
    </div>
  )
}

function MarkdownText({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3)
          const newlineAt = inner.indexOf('\n')
          const code = newlineAt >= 0 ? inner.slice(newlineAt + 1) : inner
          return <pre key={i}><code>{code}</code></pre>
        }
        return <InlineMd key={i} text={part} />
      })}
    </>
  )
}

function InlineMd({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`]+`)/g)
  return (
    <>
      {tokens.map((tok, i) => {
        if (/^\*\*[^*]+\*\*$/.test(tok)) return <strong key={i}>{tok.slice(2, -2)}</strong>
        if (/^\*[^*]+\*$/.test(tok)) return <em key={i}>{tok.slice(1, -1)}</em>
        if (/^`[^`]+`$/.test(tok)) return <code key={i}>{tok.slice(1, -1)}</code>
        return tok ? <span key={i}>{tok}</span> : null
      })}
    </>
  )
}

import Prose from './Prose'
import { TOP_K } from '../api/client'
import type { Exchange } from '../types'

interface TranscriptProps {
  exchanges: Exchange[]
  onAsk: (question: string) => void
  onRetry: (id: string) => void
  pending: boolean
}

/** What a developer actually needs first from a repo they've never read. */
const STARTERS = [
  'What does this project do?',
  'Where does execution start?',
  'How is the code organized?',
]

export default function Transcript({ exchanges, onAsk, onRetry, pending }: TranscriptProps) {
  if (exchanges.length === 0) {
    return (
      <section className="empty">
        <h2 className="empty-title">The source is ready. Where shall we start?</h2>
        <p className="empty-note">
          Ask about the big picture or dig into a specific part of the code. Your questions and answers stay together here.
        </p>
        <ul className="starters">
          {STARTERS.map(q => (
            <li key={q}>
              <button className="starter" disabled={pending} onClick={() => onAsk(q)}>
                <span className="starter-q">{q}</span>
                <span className="starter-go" aria-hidden="true">Ask</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <div aria-live="polite">
      {exchanges.map(x => (
        <article aria-busy={!x.answer && !x.error} className="sec" id={`section-${x.n}`} key={x.id} aria-labelledby={`q-${x.n}`}>
          <p className="sec-num" aria-hidden="true">{String(x.n).padStart(2, '0')}</p>
          <div>
            <h2 className="sec-q" id={`q-${x.n}`}>{x.question}</h2>

            {x.answer && (
              <>
                <div className="sec-a"><Prose content={x.answer} /></div>
                <p className="sec-src">
                  <span className="label">Based on {TOP_K} relevant source passages</span>
                </p>
              </>
            )}

            {!x.answer && !x.error && (
              <div className="sec-reading">
                <span className="label sec-reading-label">Finding relevant source passages</span>
                <div className="answer-skeleton" aria-hidden="true"><span /><span /><span /></div>
              </div>
            )}

            {x.error && (
              <p className="notice" role="alert">
                <span className="notice-tag">Failed</span>
                <span className="notice-body">
                  {x.error}{' '}
                  <button className="seed" type="button" disabled={pending} onClick={() => onRetry(x.id)}>Retry</button>
                </span>
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

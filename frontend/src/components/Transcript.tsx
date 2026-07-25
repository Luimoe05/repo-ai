import Prose from './Prose'
import { TOP_K } from '../api/client'
import type { Exchange } from '../types'

interface TranscriptProps {
  exchanges: Exchange[]
  onAsk: (question: string) => void
  onRetry: (id: string) => void
}

/** What a developer actually needs first from a repo they've never read. */
const STARTERS = [
  'What does this project do?',
  'Where does execution start?',
  'How is the code organized?',
]

export default function Transcript({ exchanges, onAsk, onRetry }: TranscriptProps) {
  if (exchanges.length === 0) {
    return (
      <section className="empty">
        <h2 className="empty-title">Nothing asked yet.</h2>
        <p className="empty-note">
          Every question becomes a numbered section here, and the contents list fills in
          as you go. Start with one of these, or write your own.
        </p>
        <ul className="starters">
          {STARTERS.map(q => (
            <li key={q}>
              <button className="starter" onClick={() => onAsk(q)}>
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
        <article className="sec" id={`section-${x.n}`} key={x.id} aria-labelledby={`q-${x.n}`}>
          <p className="sec-num" aria-hidden="true">§ {String(x.n).padStart(2, '0')}</p>
          <div>
            <h2 className="sec-q" id={`q-${x.n}`}>{x.question}</h2>

            {x.answer && (
              <>
                <div className="sec-a"><Prose content={x.answer} /></div>
                <p className="sec-src">
                  <span className="label">Drawn from the {TOP_K} nearest chunks</span>
                </p>
              </>
            )}

            {!x.answer && !x.error && (
              <div className="sec-reading">
                <span className="label sec-reading-label">Retrieving {TOP_K} chunks</span>
                <span className="scanline" aria-hidden="true" />
              </div>
            )}

            {x.error && (
              <p className="notice" role="alert">
                <span className="notice-tag">Failed</span>
                <span className="notice-body">
                  {x.error}{' '}
                  <button className="seed" type="button" onClick={() => onRetry(x.id)}>Retry</button>
                </span>
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

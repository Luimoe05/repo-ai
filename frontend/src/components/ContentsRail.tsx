import type { Exchange } from '../types'

interface ContentsRailProps {
  exchanges: Exchange[]
  activeId: string | null
  onJump: (id: string) => void
}

/** The document's table of contents, written as the reader asks. Section
 *  numbers are real structure here — they order the document and index the
 *  jump targets — not ornament. */
export default function ContentsRail({ exchanges, activeId, onJump }: ContentsRailProps) {
  return (
    <nav className="rail" aria-label="Contents">
      <p className="label rail-label">Contents</p>
      {exchanges.length === 0 ? (
        <p className="rail-empty">Sections appear as you ask.</p>
      ) : (
        <ul className="rail-list">
          {exchanges.map(x => (
            <li key={x.id}>
              <button
                className="rail-entry"
                aria-current={activeId === x.id}
                onClick={() => onJump(x.id)}
              >
                <span className="rail-num" aria-hidden="true">{String(x.n).padStart(2, '0')}</span>
                <span className="rail-text">{x.question}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}

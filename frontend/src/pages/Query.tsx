import { useEffect, useRef, useState } from 'react'
import DocHeader from '../components/DocHeader'
import ContentsRail from '../components/ContentsRail'
import Transcript from '../components/Transcript'
import Composer from '../components/Composer'
import { useQuery } from '../hooks/useQuery'

interface QueryProps {
  repoUrl: string
  chunks: number
  onReset: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function Query({ repoUrl, chunks, onReset, theme, onToggleTheme }: QueryProps) {
  const { exchanges, ask, retry, pending } = useQuery()
  const [activeId, setActiveId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const count = exchanges.length

  /* Mark whichever section is highest in the viewport as current, so the
     contents rail tracks the reader rather than just the newest answer. */
  useEffect(() => {
    const root = scrollRef.current
    if (!root || count === 0) return

    const byNumber = new Map(exchanges.map(x => [`section-${x.n}`, x.id]))
    const observer = new IntersectionObserver(
      entries => {
        const top = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setActiveId(byNumber.get(top.target.id) ?? null)
      },
      { root, rootMargin: '0px 0px -55% 0px' },
    )

    root.querySelectorAll('.sec').forEach(el => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  /* Bring the newest section to the top of the page, the way turning to a
     new chapter would. */
  useEffect(() => {
    if (count === 0) return
    document.getElementById(`section-${count}`)?.scrollIntoView({ block: 'start' })
  }, [count])

  const jump = (id: string) => {
    const target = exchanges.find(x => x.id === id)
    if (target) document.getElementById(`section-${target.n}`)?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="doc">
      <DocHeader
        repoUrl={repoUrl}
        chunks={chunks}
        onReset={onReset}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div className="doc-main">
        <ContentsRail exchanges={exchanges} activeId={activeId} onJump={jump} />

        <div className="doc-col">
          <main className="doc-scroll" ref={scrollRef}>
            <div className="doc-sheet">
              <Transcript exchanges={exchanges} onAsk={ask} onRetry={retry} />
            </div>
          </main>
          <Composer onSubmit={ask} pending={pending} />
        </div>
      </div>
    </div>
  )
}

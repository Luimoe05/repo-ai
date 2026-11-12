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

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    root.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const root = scrollRef.current
    if (!root || count === 0) return
    let frame = 0
    const update = () => {
      const sections = [...root.querySelectorAll<HTMLElement>('.sec')]
      const top = root.getBoundingClientRect().top + 48
      const current = sections.filter(section => section.getBoundingClientRect().top <= top).at(-1) ?? sections[0]
      const index = sections.indexOf(current)
      setActiveId(exchanges[index]?.id ?? null)
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    root.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => { root.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [count, exchanges])

  /* Bring the newest section to the top of the page, the way turning to a
     new chapter would. */
  useEffect(() => {
    if (count === 0) return
    document.getElementById(`section-${count}`)?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }, [count])

  const jump = (id: string) => {
    const target = exchanges.find(x => x.id === id)
    if (target) document.getElementById(`section-${target.n}`)?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
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
          <main className="doc-scroll" ref={scrollRef} tabIndex={-1} aria-label="Repository answers">
            <div className="doc-sheet">
              <Transcript exchanges={exchanges} onAsk={ask} onRetry={retry} pending={pending} />
            </div>
          </main>
          <Composer onSubmit={ask} pending={pending} />
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'

/** A word (with its leading whitespace attached) or a whole fenced block.
 *  Emphasis spans stay whole so markup never reveals half-formed. */
type Token =
  | { kind: 'word'; text: string; style?: 'strong' | 'em' | 'code' }
  | { kind: 'pre'; text: string }

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Parse once, up front. Revealing by re-slicing the raw string would render
 *  partial fences as literal backticks while the answer is still arriving. */
function tokenize(content: string): Token[] {
  const out: Token[] = []
  const parts = content.split(/(```[\s\S]*?```)/g)
  const fenced = parts.length > 1

  for (const part of parts) {
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3)
      const newlineAt = inner.indexOf('\n')
      const code = newlineAt >= 0 ? inner.slice(newlineAt + 1) : inner
      out.push({ kind: 'pre', text: code.replace(/\s+$/, '') })
      continue
    }

    /* The container is pre-wrap, so newlines touching a fence would stack on
       top of the block's own margin. Let the margin do the spacing. */
    const text = fenced ? part.replace(/^\n+/, '').replace(/\n+$/, '') : part
    if (!text) continue

    for (const seg of text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`]+`)/g)) {
      if (!seg) continue

      if (/^\*\*[^*]+\*\*$/.test(seg)) { out.push({ kind: 'word', text: seg.slice(2, -2), style: 'strong' }); continue }
      if (/^\*[^*]+\*$/.test(seg)) { out.push({ kind: 'word', text: seg.slice(1, -1), style: 'em' }); continue }
      if (/^`[^`]+`$/.test(seg)) { out.push({ kind: 'word', text: seg.slice(1, -1), style: 'code' }); continue }

      for (const word of seg.match(/\s*\S+|\s+/g) ?? []) out.push({ kind: 'word', text: word })
    }
  }

  return out
}

/** Walks a count up to `total` on a rAF ramp, so tokens mount a few per frame
 *  rather than one per render. Mount order is the stagger — each token fades
 *  itself in on arrival. */
function useReveal(total: number, animate: boolean) {
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!animate || total === 0) return

    const duration = Math.min(Math.max(total * 26, 480), 2200)
    const start = performance.now()
    let frame = 0

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setN(Math.max(1, Math.ceil(progress * total)))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [total, animate])

  return animate ? Math.min(n, total) : total
}

export default function Prose({ content, animate = false }: { content: string; animate?: boolean }) {
  const tokens = useMemo(() => tokenize(content), [content])
  const [motion] = useState(() => animate && !prefersReducedMotion())
  const shown = useReveal(tokens.length, motion)

  return (
    <>
      {tokens.slice(0, shown).map((token, i) => {
        const cls = motion ? 'rv' : undefined
        if (token.kind === 'pre') return <pre key={i} className={cls}><code>{token.text}</code></pre>
        if (token.style === 'strong') return <strong key={i} className={cls}>{token.text}</strong>
        if (token.style === 'em') return <em key={i} className={cls}>{token.text}</em>
        if (token.style === 'code') return <code key={i} className={cls}>{token.text}</code>
        return <span key={i} className={cls}>{token.text}</span>
      })}
    </>
  )
}

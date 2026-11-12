import { useMemo } from 'react'

/** Inline text and emphasis, or an intact fenced code block. */
type Token =
  | { kind: 'word'; text: string; style?: 'strong' | 'em' | 'code' }
  | { kind: 'pre'; text: string }

/** Keep source code intact while rendering supported inline formatting. */
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

      out.push({ kind: 'word', text: seg })
    }
  }

  return out
}

export default function Prose({ content }: { content: string }) {
  const tokens = useMemo(() => tokenize(content), [content])
  return (
    <>
      {tokens.map((token, i) => {
        if (token.kind === 'pre') return <pre key={i}><code>{token.text}</code></pre>
        if (token.style === 'strong') return <strong key={i}>{token.text}</strong>
        if (token.style === 'em') return <em key={i}>{token.text}</em>
        if (token.style === 'code') return <code key={i}>{token.text}</code>
        return <span key={i}>{token.text}</span>
      })}
    </>
  )
}

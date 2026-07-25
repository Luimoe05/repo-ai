/** Minimal markdown for answers: fenced blocks, inline code, bold, italic.
 *  Deliberately small — the model returns explanatory prose, not documents. */
export default function Prose({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  const fenced = parts.length > 1

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3)
          const newlineAt = inner.indexOf('\n')
          const code = newlineAt >= 0 ? inner.slice(newlineAt + 1) : inner
          return <pre key={i}><code>{code.replace(/\s+$/, '')}</code></pre>
        }
        /* The container is pre-wrap, so newlines touching a fence would stack
           on top of the block's own margin. Let the margin do the spacing. */
        const text = fenced ? part.replace(/^\n+/, '').replace(/\n+$/, '') : part
        return text ? <Inline key={i} text={text} /> : null
      })}
    </>
  )
}

function Inline({ text }: { text: string }) {
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

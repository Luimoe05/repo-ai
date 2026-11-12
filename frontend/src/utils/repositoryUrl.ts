/** Accept a repository root, with or without its scheme, and send a canonical URL. */
export function repositoryUrl(value: string): string | null {
  try {
    const trimmed = value.trim()
    const parsed = new URL(trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`)
    const parts = parsed.pathname.replace(/\/$/, '').split('/').filter(Boolean)
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com' || parsed.username || parsed.password || parsed.port || parts.length !== 2 || !parts.every(part => /^[a-zA-Z0-9_.-]+$/.test(part))) return null
    const repo = parts[1].replace(/\.git$/, '')
    if (!repo) return null
    return `https://github.com/${parts[0]}/${repo}`
  } catch {
    return null
  }
}

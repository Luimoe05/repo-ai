import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Query from './pages/Query'
import { useTheme } from './hooks/useTheme'
import { warmBackend } from './api/client'
import './App.css'

interface Indexed {
  url: string
  chunks: number
}

const STORAGE_KEY = 'repoai:indexed'

/* The index lives on the server, so a reload should not cost the visitor one
   of their three hourly ingests just to get back to a repo they already
   indexed. */
const restore = (): Indexed | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Indexed) : null
  } catch {
    return null
  }
}

export default function App() {
  const [indexed, setIndexed] = useState<Indexed | null>(restore)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    try {
      if (indexed) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(indexed))
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* Private browsing can refuse storage; the app still works without it. */
    }
  }, [indexed])

  /* Free-tier instances sleep between visits. Waking one the moment the page
     paints means the spin-up overlaps with the visitor reading the page,
     rather than being charged to their first click. */
  useEffect(() => {
    void warmBackend()
  }, [])

  return (
    <div className="app">
      {indexed ? (
        <Query
          repoUrl={indexed.url}
          chunks={indexed.chunks}
          onReset={() => setIndexed(null)}
          theme={theme}
          onToggleTheme={toggle}
        />
      ) : (
        <Home
          onIndexed={(url, chunks) => setIndexed({ url, chunks })}
          theme={theme}
          onToggleTheme={toggle}
        />
      )}
    </div>
  )
}

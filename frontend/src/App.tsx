import { useState } from 'react'
import Home from './pages/Home'
import Query from './pages/Query'
import { useTheme } from './hooks/useTheme'
import './App.css'

interface Indexed {
  url: string
  chunks: number
}

export default function App() {
  const [indexed, setIndexed] = useState<Indexed | null>(null)
  const { theme, toggle } = useTheme()

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

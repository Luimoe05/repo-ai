import { useState } from 'react'
import Home from './pages/Home'
import Query from './pages/Query'
import { useTheme } from './hooks/useTheme'

type AppState = 'home' | 'query'

export default function App() {
  const [appState, setAppState] = useState<AppState>('home')
  const [repoUrl, setRepoUrl] = useState('')
  const [chunksStored, setChunksStored] = useState(0)
  const { theme, toggle } = useTheme()

  const handleIngestSuccess = (url: string, chunks: number) => {
    setRepoUrl(url)
    setChunksStored(chunks)
    setAppState('query')
  }

  const handleReset = () => {
    setAppState('home')
    setRepoUrl('')
    setChunksStored(0)
  }

  return (
    <div className="app">
      {appState === 'home' ? (
        <Home onSuccess={handleIngestSuccess} theme={theme} onToggleTheme={toggle} />
      ) : (
        <Query repoUrl={repoUrl} chunksStored={chunksStored} onReset={handleReset} theme={theme} onToggleTheme={toggle} />
      )}
    </div>
  )
}

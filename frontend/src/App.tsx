import { useState } from 'react'
import Home from './pages/Home'
import Query from './pages/Query'

type AppState = 'home' | 'query'

export default function App() {
  const [appState, setAppState] = useState<AppState>('home')
  const [repoUrl, setRepoUrl] = useState('')
  const [chunksStored, setChunksStored] = useState(0)

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
        <Home onSuccess={handleIngestSuccess} />
      ) : (
        <Query repoUrl={repoUrl} chunksStored={chunksStored} onReset={handleReset} />
      )}
    </div>
  )
}

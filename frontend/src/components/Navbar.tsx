interface NavbarProps {
  repoUrl: string
  onReset: () => void
}

export default function Navbar({ repoUrl, onReset }: NavbarProps) {
  const repoName = repoUrl.replace(/\.git$/, '').split('/').slice(-2).join('/')

  return (
    <header className="navbar" aria-label="RepoAI">
      <span className="navbar-logo" aria-label="RepoAI">RepoAI</span>
      <div className="navbar-repo" aria-label="Current repository">
        <span className="navbar-repo-name" title={repoName}>{repoName}</span>
      </div>
      <button className="navbar-reset" onClick={onReset} aria-label="Start over with a new repository">
        <span aria-hidden="true">← </span>New repo
      </button>
    </header>
  )
}

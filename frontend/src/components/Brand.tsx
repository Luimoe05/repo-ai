export default function Brand() {
  return (
    <span className="wordmark">
      <svg className="brand-mark" width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <rect width="30" height="30" rx="8" fill="currentColor" />
        <path d="M10 9v12m0-6h5a5 5 0 0 0 5-5V9" stroke="var(--on-accent)" strokeWidth="1.6" />
        <circle cx="10" cy="9" r="2" fill="var(--on-accent)" /><circle cx="10" cy="21" r="2" fill="var(--on-accent)" /><circle cx="20" cy="9" r="2" fill="var(--on-accent)" />
      </svg>
      Repo<span className="wordmark-ai">AI</span>
    </span>
  )
}

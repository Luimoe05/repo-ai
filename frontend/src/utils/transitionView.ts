import { flushSync } from 'react-dom'

/** Native snapshots animate navigation without delaying the next interaction. */
export function transitionView(update: () => void) {
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update()
    return
  }
  const transition = document.startViewTransition(() => flushSync(update))
  void transition.finished.catch(() => { /* An interrupted transition is harmless. */ })
}

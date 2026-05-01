# Product

## Register

brand

## Users

Developers onboarding to unfamiliar codebases. They've just been handed a repo they've never seen — a new job, an open-source contribution, a client handoff — and they need to get up to speed fast. They're technically literate but time-constrained. They don't want to grep through files or read a wall of README; they want to ask questions in plain English and get direct, confident answers.

## Product Purpose

RepoAI lets you paste a GitHub repository URL and immediately start asking natural language questions about it. The system ingests, parses, and embeds the codebase, then answers questions about its purpose, architecture, and design decisions. Success looks like: a developer who just cloned a new repo understands it in 5 minutes instead of 5 hours.

## Brand Personality

Sharp, focused, trustworthy. The tool speaks plainly and never hedges. It has the confidence of a senior engineer who has read every file and remembered it. Not flashy — authoritative.

## Anti-references

- Generic AI chatbot wrapper (bubbly, rounded, "chat with your data" SaaS cliché)
- The indigo-gradient SaaS dashboard template (despite the current palette — this should feel earned, not default)
- VS Code dark theme aesthetic (developer tools can have taste)
- Loud hero metrics / big-number dashboards
- Glassmorphism used decoratively

## Design Principles

1. **Confidence through clarity** — every visual element should communicate precision, not decoration. If something is on screen it earns its place.
2. **Tool, not toy** — this is expert software. Design should feel deliberate and capable, not polished for a product hunt screenshot.
3. **Show, don't scaffold** — no onboarding fluff, no feature announcements. The interface is the pitch.
4. **Signal over noise** — surface only what the user needs at this moment in the workflow. Ingestion screen is different from query screen; don't conflate them.
5. **Earned detail** — start minimal; reveal depth only when the user is ready for it. The empty state should feel purposeful, not empty.

## Accessibility & Inclusion

WCAG AA minimum. Cover:
- Sufficient contrast ratios (4.5:1 for body text, 3:1 for large text and UI components)
- Full keyboard navigation with visible focus indicators
- Proper semantic HTML (landmarks, heading hierarchy, button vs. div)
- ARIA labels on all interactive elements without visible text labels
- Reduced motion support via `prefers-reduced-motion`
- Form inputs with associated labels
- Error states that are not color-only

# RepoAI interface foundations

## Purpose and register

The working interface is product UI. A developer opens a repository, asks a question, and returns to an answer without learning a new navigation model. The start screen borrows the spacious visual rhythm of https://www.nowadays.ai/ while keeping repository exploration as the primary task.

## Theme and color

Scene: a developer at a daylight desk, reading an unfamiliar codebase alongside their editor. Use a light lavender canvas, deep violet text, and near-white reading surfaces. The restrained color strategy reserves saturated violet for primary actions, keyboard focus, and selection. All color roles use OKLCH in `frontend/src/index.css`.

Light is the default on first visit. A saved theme preference takes precedence. The dark alternative preserves the same hierarchy for dim environments. Errors use an oxide role and an explicit text label.

## Typography

Self-host the variable Manrope font, with its OFL license in `frontend/public/fonts/`. Use the native sans stack as fallback and monospace for source code. The desktop introduction is 72px, with 60px, 48px, and 40px steps for smaller viewports. Keep working interface labels compact, body copy at 15–16px, and prose limited to 70ch. Use sentence case and solid text colors.

## Structure

The start screen centers one introduction and one repository field. Compact example buttons populate and focus the field without submitting. A single secondary lavender panel demonstrates useful questions and lists supported languages. Avoid repeated setup instructions and extra introductory headings.

The answer workspace uses a repository toolbar, question history, a scrollable reading surface, and an anchored composer. On small screens, history becomes a horizontally scrollable index. Numbered questions connect history entries to answers. The repository form stacks its action beneath the input on mobile.

## Components and behavior

Fields use 16px corners, primary buttons use 11px corners, theme and repository-switch controls use rounded shapes, and the secondary start-screen panel uses 24px corners. Interactive controls have at least 44px touch targets. Inputs have associated accessible labels and contextual help. Disabled controls remain legible. Errors appear beside the affected task and never rely on color alone.

Indexing uses an indeterminate indicator and elapsed time, without invented percentages or completion stages. Reserve feedback space so example selection does not shift nearby controls. URL validation accepts scheme-free GitHub repository roots. Long indexing failures retain the recovery action.

Answers render immediately. The composer grows with its content, keeps focus after submission, and remains editable during a request. Only one answer request runs at a time; leaving aborts it. History follows reading position. Mobile form inputs use 16px type to avoid focus zoom.

## Motion and accessibility

Use 140ms press feedback, 220ms control changes, and 280ms workspace transitions with the shared quintic ease-out curve. Native View Transitions share the brand mark, with immediate updates when unsupported or reduced motion is requested. Animate opacity and transforms only. Loading indicators respect reduced-motion preferences.

The start screen enters with a 560ms fade and 14px upward reveal. Stagger the introduction, repository field, supporting panel, and footer by up to 260ms. Keep navigation immediately visible. Focusing the repository field ends its entrance immediately. Skip the entrance entirely when reduced motion is preferred.

Maintain visible keyboard focus, semantic landmarks, accessible control names, and sufficient text contrast. Avoid decorative gradients, glass effects, side-stripe accents, repeated feature cards, and nested cards.

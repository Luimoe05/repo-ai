# RepoAI interface foundations

## Purpose and register

The working interface is product UI. A developer should be able to open a repository, ask a question, and return to an answer without learning a new navigation model.

## Theme and color

Scene: a developer at a daylight desk, reading an unfamiliar codebase alongside their editor. Light surfaces support sustained reading. A dark alternative preserves the same hierarchy for dim environments.

Use restrained plum for primary actions, keyboard focus, and active questions. Neutral surfaces carry a slight violet tint. All color roles use OKLCH, defined in `frontend/src/index.css`; dark mode overrides the same roles. Errors use a separate oxide role and an explicit text label.

## Typography

Use the native system sans stack for headings, labels, questions, and answers. Reserve monospace for code. Body copy is 15–16px; primary section titles are 28px; the desktop introduction is 42px. Prose is limited to 70ch. Labels use sentence case, with no decorative letter spacing or all-caps text.

## Structure

The start screen pairs a compact introduction with a repository input, example repository rows, and sample questions. The primary task stays visible without a marketing detour. On small screens the introduction compresses and the process list disappears.

The answer workspace has a repository toolbar, question history, a scrollable reading area, and an anchored composer. On small screens history becomes a horizontal index. Questions stay numbered so navigation remains connected to answers.

## Components and behavior

Fields use 12px corners, buttons use 10px corners, and toolbar controls use 44px minimum targets with a consistent visible focus outline. Inputs have persistent labels and contextual help. Example rows fill and focus the repository input without submitting. Disabled controls remain legible. Indexing uses an indeterminate indicator and elapsed time, never invented percentages or completion stages.

Answers render immediately. Motion only conveys pending state, and respects reduced-motion preferences. Use borders for grouping and tinted backgrounds for selection. Avoid decorative gradients, glass effects, side-stripe accents, repeated feature cards, and nested cards.

## Motion and interaction polish

Reference: https://www.nowadays.ai/. Borrow its open spacing, softly tinted atmosphere, and rounded control shapes; keep RepoAI focused on the repository task. The start screen uses an open introduction with a restrained radial surface tint.

Use 140ms for press feedback, 220ms for control and content state changes, and 280ms for workspace transitions. Use the shared quintic ease-out curve. Navigation uses native View Transitions with a shared brand mark, falling back to immediate updates when unsupported or reduced motion is requested. Never delay an action for an animation. Loading skeletons and indicators stop animating under reduced motion.

Repository examples have persistent selected states. URL errors appear next to the field and accept scheme-free GitHub roots. Indexing feedback occupies reserved space. The composer grows to its content, keeps focus on submit, and remains editable during requests. Only one answer request runs at a time; leaving aborts it. Question history follows the reading position. All toolbar and row interactions have at least 44px touch targets; mobile form inputs use 16px type to avoid focus zoom.

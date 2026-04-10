<!-- GSD:project-start source:PROJECT.md -->
## Project

**Wagha-ai (wagha-AI)**

An Arabic AI-powered architectural rendering tool that lets architecture firms upload 2D floor plans or building photos and instantly generate photorealistic 3D exterior renders — replacing a process that traditionally takes weeks with a 3D artist, down to one minute with AI. The tool wraps Nano Banana 2 inside a polished Arabic UI with professional pre-built prompts, so the firm's client gets a beautifully formatted PDF deliverable without any AI back-and-forth.

**Core Value:** Turn a 2D architectural plan or building photo into a photorealistic 3D exterior render in under 60 seconds — and deliver it as a branded PDF to the client.

### Constraints

- **Tech**: Web app (Arabic RTL frontend, backend for file handling and PDF generation)
- **AI**: Nano Banana 2 for image generation — no alternative for MVP
- **Timeline**: MVP scoped to ship quickly to validate with the architecture firm
- **Scope**: Exterior only — no interior renders, no authentication, no payments
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.x | Full-stack framework | App Router supports Server Actions for file handling; automatic opt-out of Node-specific packages; built-in image optimization |
| React | 19.2.x | UI library | Server Components + Actions for async form mutations; `use()` hook for promise consumption |
| TypeScript | 5.x | Type safety | Catch errors at build time; critical for file upload and API integration |
### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| SQLite (via better-sqlite3) | 5.x | Local prototype storage | MVP scope: single architecture firm; no auth; stores projects in local file system or simple SQLite |
### Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.2.x | Utility-first CSS | Native RTL via `dir="rtl"` + `rtl:` modifier; v4 ships `@tailwindcss/postcss` for seamless Next.js integration; no config file needed |
| @tailwindcss/postcss | 4.2.x | PostCSS plugin | Official v4 approach for Next.js App Router |
### RTL Support
| Approach | How | Confidence |
|----------|-----|------------|
| HTML `dir="rtl"` attribute | Set on `<html>` element | HIGH |
| Tailwind `rtl:` modifier | `rtl:mr-4 rtl:text-right` etc. | HIGH |
| Logical properties | `ms-*` (margin-start), `me-*` (margin-end) over hardcoded `ml-*`/`mr-*` | HIGH |
| Noto Sans Arabic font | Google Fonts Arabic typeface | HIGH |
### File Upload
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| react-dropzone | 15.x | Drag-and-drop file input | Hook-based; integrates with React state; handles file validation (type, size) client-side |
| Next.js Server Actions | Built-in | Receive multipart form data | `request.formData()` parses files server-side; no separate API route needed |
### File Processing
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| pdfjs-dist | 4.x | PDF rendering/parsing | Converts PDF pages to images for AI processing; needs `serverExternalPackages: ['pdfjs-dist']` |
| sharp | 0.33.x | Image processing | Already auto-opted-out by Next.js; resize/process uploaded images before sending to AI |
| pdf-lib | 1.17.x | PDF manipulation | Extract images from uploaded PDFs (if page images); embed images in output PDFs |
### PDF Generation (Branded Exports)
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @react-pdf/renderer | 4.x | React-based PDF creation | Already in Next.js `serverExternalPackages` list; use React components to define PDF layout; supports custom fonts |
### AI Integration
| Approach | How | Why |
|----------|-----|-----|
| Native `fetch` | Call Nano Banana 2 API from Server Action | No extra library needed; handles multipart form data natively |
| FormData | Construct request body with image + prompt params | Standard Web API; works in Node.js 18+ server context |
### State Management
| Approach | Why |
|----------|-----|
| React `useState` + `useActionState` | React 19's `useActionState` (formerly `useFormState`) handles async form state; no Redux/Zustand needed for MVP scope |
## Installation
# Core
# Type safety
# Styling
# File handling
# Image processing
# PDF generation
# Arabic font
### Dev dependencies
## next.config.ts
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| File upload | react-dropzone + Server Actions | UploadThing / Cloudinary | These add external dependencies and CDN costs; for a single-firm MVP, direct upload to server is simpler |
| PDF generation | @react-pdf/renderer | pdfmake / puppeteer | pdfmake has poor Arabic support; puppeteer is heavy (headless Chrome); react-pdf is React-idiomatic and already Next.js-compatible |
| PDF parsing | pdfjs-dist | pdf-parse | pdf-parse is unmaintained; pdfjs-dist is actively maintained by Mozilla |
| Image processing | sharp | imagemin | sharp has better Node.js integration and is already Next.js auto-opted-out |
| Database | better-sqlite3 | Prisma + PostgreSQL | MVP scope does not need a full DB; SQLite is simpler for a single-client prototype |
| State management | React built-ins | Zustand / Redux | MVP is simple enough that built-in React state is sufficient |
## What NOT to Use and Why
| Library | Why Avoid | Instead Use |
|---------|-----------|-------------|
| Moment.js | Deprecated; large bundle | date-fns or native Intl |
| Class components | React 19 patterns favor hooks | Functional components + hooks |
| CSS Modules with manual RTL | Tedious; error-prone | Tailwind `rtl:` modifier |
| JavaScript | No type safety for AI API contracts | TypeScript throughout |
## Sources
- Next.js 16.2.1 docs (2026-03-25): serverExternalPackages, App Router, Server Actions
- Tailwind CSS v4 docs (2026-03): RTL support via `rtl:` modifier
- React 19.2.1 blog (December 2024 / patches through 2026): Server Components, Actions, `use()` hook
- react-pdf.org: PDF generation with custom fonts
- Next.js auto-opt-out list: `@react-pdf/renderer`, `sharp` already listed
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:browser-automation-start -->
## Browser Automation

Use the Playwright MCP (`plugin:playwright`) for browser automation — opening pages, clicking elements, filling forms, taking snapshots, and evaluating JavaScript.

Core workflow:
1. `browser_navigate` — Navigate to a URL
2. `browser_snapshot` — Get interactive elements with refs (@e1, @e2)
3. `browser_click @e1` / `browser_fill` / `browser_type` — Interact using refs
4. Re-snapshot after page changes to get fresh refs

Key capabilities:
- `browser_evaluate` — Run arbitrary JS and inspect DOM state
- `browser_take_screenshot` — Visual verification
- `browser_network_requests` — Inspect API calls
- `browser_console_messages` — Check for console errors
- `browser_wait_for` — Wait for text/element to appear

For headless browser testing at a URL: use the `agent-browser` tool.
<!-- GSD:browser-automation-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

=================
Talk to me like im ur bro man in very simple english lang.
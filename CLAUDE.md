Done.

```markdown
<!-- GSD:project-start source:PROJECT.md -->
## Project

**Wagha-ai (wagha-AI)**

Arabic AI rendering tool. Architecture firms upload 2D plans/photos. Instantly generate photorealistic 3D exterior renders.
Replaces weeks of 3D artist work in 1 minute. Wraps Nano Banana 2 in Arabic UI + professional prompts. Client gets branded PDF.

**Core Value:** 2D → photorealistic 3D exterior in <60s → branded PDF.

### Constraints

- **Tech**: Web app (Arabic RTL frontend, backend for file handling, PDF generation)
- **AI**: Nano Banana 2 (no alternative for MVP)
- **Timeline**: MVP scoped for quick ship to validate with architecture firm
- **Scope**: Exterior only (no interior, auth, or payments)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.x | Full-stack framework | App Router + Server Actions; auto opt-out of Node packages |
| React | 19.2.x | UI library | Server Components + Actions; `use()` hook for promises |
| TypeScript | 5.x | Type safety | Catch errors at build time; critical for file upload + AI |
### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| SQLite (better-sqlite3) | 5.x | Local prototype storage | MVP scope: single firm; no auth; projects in local filesystem or SQLite |
### Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.2.x | Utility-first CSS | Native RTL via `dir="rtl"` + `rtl:` modifier; v4 ships `@tailwindcss/postcss`; no config file |
| @tailwindcss/postcss | 4.2.x | PostCSS plugin | Official v4 approach for Next.js App Router |
### RTL Support
| Approach | How | Confidence |
|----------|-----|------------|
| HTML `dir="rtl"` attribute | Set on `<html>` element | HIGH |
| Tailwind `rtl:` modifier | `rtl:mr-4 rtl:text-right` etc. | HIGH |
| Logical properties | `ms-*` (margin-start), `me-*` (margin-end) over `ml-*`/`mr-*` | HIGH |
| Noto Sans Arabic font | Google Fonts Arabic typeface | HIGH |
### File Upload
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| react-dropzone | 15.x | Drag-and-drop file input | Hook-based; integrates with React state; handles validation client-side |
| Next.js Server Actions | Built-in | Receive multipart form data | `request.formData()` parses files server-side; no separate API route |
### File Processing
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| pdfjs-dist | 4.x | PDF rendering/parsing | Converts PDF pages to images for AI; needs `serverExternalPackages: ['pdfjs-dist']` |
| sharp | 0.33.x | Image processing | Auto-opted-out by Next.js; resize/process images before AI |
| pdf-lib | 1.17.x | PDF manipulation | Extract/embed images in PDFs |
### PDF Generation (Branded Exports)
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @react-pdf/renderer | 4.x | React-based PDF creation | In `serverExternalPackages`; React components for PDF layout; custom fonts |
### AI Integration
| Approach | How | Why |
|----------|-----|-----|
| Native `fetch` | Call Nano Banana 2 API from Server Action | No extra library; handles multipart form data natively |
| FormData | Construct request body with image + prompt params | Standard Web API; works in Node.js 18+ |
### State Management
| Approach | Why |
|----------|-----|
| React `useState` + `useActionState` | React 19 `useActionState` handles async form state; no Redux/Zustand for MVP |
## Installation
`npm install` → Core, Type safety, Styling, File handling, Image processing, PDF generation, Arabic font. Dev dependencies. See next.config.ts.
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|--------|
| File upload | react-dropzone + Server Actions | UploadThing / Cloudinary | Extra dependencies + CDN costs; direct upload simpler for single-firm MVP |
| PDF generation | @react-pdf/renderer | pdfmake / puppeteer | pdfmake poor Arabic support; puppeteer heavy (headless Chrome); react-pdf React-idiomatic + Next.js-compatible |
| PDF parsing | pdfjs-dist | pdf-parse | pdf-parse unmaintained; pdfjs-dist actively maintained by Mozilla |
| Image processing | sharp | imagemin | Better Node.js integration; already auto-opted-out by Next.js |
| Database | better-sqlite3 | Prisma + PostgreSQL | MVP scope doesn't need full DB; SQLite simpler for single-client prototype |
| State management | React built-ins | Zustand / Redux | MVP simple enough; built-in React state sufficient |
## What NOT to Use and Why
| Library | Why Avoid | Instead Use |
|---------|-----------|-------------|
| Moment.js | Deprecated; large bundle | date-fns or native Intl |
| Class components | React 19 favors hooks | Functional components + hooks |
| CSS Modules with manual RTL | Tedious; error-prone | Tailwind `rtl:` modifier |
| JavaScript | No type safety for AI API contracts | TypeScript throughout |
## Sources
- Next.js 16.2.1 docs: serverExternalPackages, App Router, Server Actions
- Tailwind CSS v4 docs: RTL support via `rtl:` modifier
- React 19.2.1 blog: Server Components, Actions, `use()` hook
- react-pdf.org: PDF generation with custom fonts
- Next.js auto-opt-out list: `@react-pdf/renderer`, `sharp` already listed
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Not yet mapped. Follow existing patterns in codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before Edit/Write/file-changing tools: start through GSD command. Keeps planning artifacts + execution context in sync.

Entry points:
- `/gsd:quick` — small fixes, doc updates, ad-hoc tasks
- `/gsd:debug` — investigation + bug fixing
- `/gsd:execute-phase` — planned phase work

Bypass only if user explicitly asks.
<!-- GSD:workflow-end -->

<!-- GSD:browser-automation-start -->
## Browser Automation

Playwright MCP (`plugin:playwright`) for browser automation — open pages, click, fill forms, snapshots, evaluate JS.

Core workflow:
1. `browser_navigate` → URL
2. `browser_snapshot` → interactive elements with refs (@e1, @e2)
3. `browser_click @e1` / `browser_fill` / `browser_type` → interact via refs
4. Re-snapshot after page changes

Key capabilities:
- `browser_evaluate` — Run JS; inspect DOM
- `browser_take_screenshot` — Visual verification
- `browser_network_requests` — Inspect API calls
- `browser_console_messages` — Check console errors
- `browser_wait_for` — Wait for text/element

Headless browser testing: `agent-browser` tool.
<!-- GSD:browser-automation-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE Grep/Glob/Read.** Faster, cheaper, + structural context.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fallback: Grep/Glob/Read **only** when graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Code review — risk-scored analysis |
| `get_review_context` | Source snippets — token-efficient |
| `get_impact_radius` | Blast radius of a change |
| `get_affected_flows` | Which execution paths impacted |
| `query_graph` | Callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Find functions/classes by name |
| `get_architecture_overview` | High-level codebase structure |
| `refactor_tool` | Renames, dead code |

### Workflow

1. Graph auto-updates on file changes.
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` for impact.
4. Use `query_graph` pattern="tests_for" for coverage.
```
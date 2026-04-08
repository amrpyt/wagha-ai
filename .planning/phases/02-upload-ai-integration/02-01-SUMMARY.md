---
phase: "02-upload-ai-integration"
plan: "01"
subsystem: infra
tags: [react-dropzone, sharp, pdfjs-dist, nextjs, file-upload]

# Dependency graph
requires:
  - phase: "01-saas-foundation-arabic-ui"
    provides: "Supabase auth, database schema, Arabic RTL UI foundation"
provides:
  - "react-dropzone@15.0.0 installed for drag-and-drop file uploads"
  - "sharp@0.34.5 installed for image processing (CMYK to RGB)"
  - "pdfjs-dist@5.6.205 installed for PDF parsing"
  - "src/lib/upload/ directory for validation, storage, processing"
  - "src/lib/ai/ directory for Nano Banana 2 client"
  - "src/components/upload/ directory for upload UI components"
  - "uploads/ directory with .gitignore"
affects: ["02-upload-ai-integration (tasks 2-4)"]

# Tech tracking
tech-stack:
  added: [react-dropzone, sharp, pdfjs-dist]
  patterns: []

key-files:
  created:
    - "src/lib/upload/index.ts"
    - "src/lib/ai/index.ts"
    - "src/components/upload/index.ts"
    - "uploads/.gitignore"
  modified:
    - "package.json"
    - "next.config.ts"

key-decisions:
  - "sharp@0.34.5 is already auto-opted-out by Next.js - do NOT add to serverExternalPackages"
  - "pdfjs-dist requires serverExternalPackages due to WASM worker"
  - "uploads/ uses .gitignore to track directory but ignore all user-uploaded files"

patterns-established: []

requirements-completed: []

# Metrics
duration: 3min
completed: 2026-04-08
---

# Phase 02-01: Upload & AI Integration - Foundation

**Installed react-dropzone, sharp, and pdfjs-dist; updated Next.js config for pdfjs-dist WASM; created directory scaffold for upload and AI libraries**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-08T09:09:12Z
- **Completed:** 2026-04-08T09:12:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Installed react-dropzone (15.0.0), sharp (0.34.5), and pdfjs-dist (5.6.205) as production dependencies
- Added pdfjs-dist to serverExternalPackages in next.config.ts for WASM worker support
- Created src/lib/upload/, src/lib/ai/, src/components/upload/ directories with placeholder index.ts files
- Created uploads/ directory with .gitignore (* to ignore all, !.gitignore to track)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install npm packages** - `5107f6a` (chore)
2. **Task 2: Update next.config.ts for pdfjs-dist** - `6cc0661` (feat)
3. **Task 3: Create directory structure and .gitignore** - `03bd3c5` (feat)

**Plan metadata:** `03bd3c5` (docs: complete plan)

## Files Created/Modified
- `package.json` - Added react-dropzone, sharp, pdfjs-dist dependencies
- `next.config.ts` - Added pdfjs-dist to serverExternalPackages array
- `src/lib/upload/index.ts` - Placeholder for upload utilities
- `src/lib/ai/index.ts` - Placeholder for AI client and prompts
- `src/components/upload/index.ts` - Placeholder for upload UI components
- `uploads/.gitignore` - Gitignore to track dir but ignore all uploads

## Decisions Made
- sharp@0.34.5 is auto-opted-out by Next.js natively - no config change needed
- pdfjs-dist MUST be in serverExternalPackages because it uses WASM workers that cannot run in browser context
- uploads/ directory uses .gitignore pattern `*` with `!.gitignore` exception - standard git pattern to track empty directories while ignoring contents

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 2 Wave 1 foundation complete: dependencies installed, config updated, directory structure in place
- Wave 2 (02-02) can proceed with actual implementation of upload validation, storage, and processing utilities
- Wave 3 (02-03) can proceed with Nano Banana 2 client implementation

---
*Phase: 02-upload-ai-integration-01*
*Completed: 2026-04-08*

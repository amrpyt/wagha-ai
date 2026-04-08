---
phase: "02"
plan: "02"
subsystem: upload
tags: [upload, ai, sharp, pdfjs-dist, nanobanana, retry]

# Dependency graph
requires:
  - phase: "01"
    provides: Multi-tenant SaaS infrastructure, auth, database
provides:
  - Upload validation library (magic bytes + MIME + size)
  - Upload storage library (UUID filenames in /uploads/)
  - Upload processing pipeline (sharp CMYK normalization, pdfjs-dist PDF conversion)
  - Pre-built architectural prompt for Nano Banana 2
  - Nano Banana 2 client with exponential backoff retry
affects: [Phase 2 Plans 03, 04]

# Tech tracking
tech-stack:
  added: [sharp, pdfjs-dist]
  patterns: [Server-side OffscreenCanvas for PDF rendering, CMYK->sRGB via sharp toColorspace, exponential backoff with jitter]

key-files:
  created:
    - src/lib/upload/validation.ts
    - src/lib/upload/storage.ts
    - src/lib/upload/processing.ts
    - src/lib/ai/prompts.ts
    - src/lib/ai/client.ts
  modified: []

key-decisions:
  - "Used OffscreenCanvas instead of HTMLCanvas for server-side PDF rendering (browser Canvas API unavailable in Node)"
  - "PDFs converted to JPEG via first page render before processing — all inputs normalized to image/jpeg"
  - "sharp toColorspace('srgb') for CMYK->RGB conversion — avoids explicit channel manipulation"
  - "Nano Banana 2 client uses generic FormData + binary response pattern — adaptable when API details confirmed"

patterns-established:
  - "Server-safe PDF rendering via OffscreenCanvas + pdfjs-dist"
  - "Magic bytes validation before any processing"
  - "Exponential backoff with ±25% jitter for rate limit handling"

requirements-completed: [UPLOAD-03, UPLOAD-04, AI-01, AI-06, AI-07]

# Metrics
duration: 2min
completed: 2026-04-08T09:19:32Z
---

# Phase 2 Plan 2: Upload & AI Libraries Summary

**Upload validation, storage, and processing libraries plus Nano Banana 2 client with exponential backoff retry**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-08T09:17:20Z
- **Completed:** 2026-04-08T09:19:32Z
- **Tasks:** 5
- **Files modified:** 5

## Accomplishments
- Magic bytes validation for JPG/PNG/PDF (actual header bytes, not just MIME type)
- UUID-based file storage in /uploads/ with no user input in path construction
- Sharp-based CMYK-to-sRGB normalization pipeline for all image inputs
- pdfjs-dist PDF-to-JPEG conversion via OffscreenCanvas (server-safe, no browser dependency)
- Nano Banana 2 client with exponential backoff retry (1s-30s, 5 retries, ±25% jitter)

## Task Commits

Each task was committed atomically:

1. **Task 1: Upload validation library** - `adb1505` (feat)
2. **Task 2: Upload storage library** - `87a5eda` (feat)
3. **Task 3: Upload processing library** - `2dca615` (feat)
4. **Task 4: AI prompts library** - `353f46d` (feat)
5. **Task 5: AI client with exponential backoff** - `5e21902` (feat)

## Files Created/Modified

- `src/lib/upload/validation.ts` - Magic bytes + MIME + size validation; MAX_SIZE_BYTES = 10MB; Arabic error messages
- `src/lib/upload/storage.ts` - crypto.randomUUID() file writes to /uploads/; UPLOAD_DIR created recursively
- `src/lib/upload/processing.ts` - pdfPageToImage (OffscreenCanvas + pdfjs-dist), normalizeImage (sharp CMYK->sRGB), processUploadedFile router
- `src/lib/ai/prompts.ts` - EXTERIOR_RENDER_PROMPT: pre-built photorealistic exterior render instructions
- `src/lib/ai/client.ts` - generateExteriorRender with FormData upload, 120s AbortController timeout, fetchWithRetry (5 retries, exponential backoff, jitter)

## Decisions Made

- Used OffscreenCanvas instead of HTMLCanvas for server-side PDF rendering (HTMLCanvas is browser-only)
- pdfjs-dist worker loaded from CDN via `.min.mjs` extension pattern
- All processed files saved with .jpg extension regardless of original type (uniformity for AI pipeline)
- API URL/key loaded from env vars (NANOBANANA_API_URL, NANOBANANA_API_KEY) — not hardcoded

## Deviations from Plan

None - plan executed exactly as written.

## Threat Surface

| Flag | File | Description |
|------|------|-------------|
| T-02-01 Mitigated | validation.ts | Magic bytes validate actual file header, not just declared MIME type |
| T-02-02 Mitigated | validation.ts | 10MB MAX_SIZE_BYTES enforced before any processing |
| T-02-03 Mitigated | storage.ts | crypto.randomUUID() — no user input in path construction |
| T-02-04 Mitigated | client.ts | Exponential backoff with ±25% jitter prevents retry storms on 429 |
| T-02-05 Mitigated | client.ts | NANOBANANA_API_KEY from env var only, never logged |

## Next Phase Readiness

Plan 02-03 (Server Action & SSE Route) can proceed immediately. The upload processing pipeline and AI client are ready to be wired into a Server Action.

---
*Phase: 02-upload-ai-integration*
*Completed: 2026-04-08*

# Project Research Summary

**Project:** Wagha-ai
**Domain:** AI-powered architectural exterior rendering SaaS
**Researched:** 2026-03-29
**Confidence:** MEDIUM

## Executive Summary

Wagha-ai is a client-facing web application that transforms 2D architectural inputs (floor plans, building photos) into photorealistic 3D exterior renders using the Nano Banana 2 AI service. The primary deliverable is a branded PDF that architecture firms send to their clients. Experts build this type of product using a full-stack JavaScript framework (Next.js 16 with React 19) for the frontend, an Express backend for job orchestration, and async patterns (polling + SSE) to handle the 10-60 second AI generation latency.

The recommended approach prioritizes a phased build: foundation first (file upload handling with strict security), then AI integration with proper timeout and rate-limit handling, then real-time UX feedback, then result display and download, and finally PDF export with Arabic RTL support. Critical risks include AI API timeout without user feedback, unvalidated file uploads, and PDF generation blocking the server's main thread. All three must be addressed architecturally from day one, not retrofitted later.

## Key Findings

### Recommended Stack

Next.js 16.2.x with React 19.2.x and TypeScript 5.x forms the foundation. Next.js App Router with Server Actions handles file uploads without separate API routes. SQLite via better-sqlite3 stores MVP project data. Tailwind CSS 4.2.x with the `rtl:` modifier provides native RTL support. File processing uses pdfjs-dist for PDF parsing, sharp for image normalization, and @react-pdf/renderer for branded PDF generation.

**Core technologies:**
- **Next.js 16 + React 19:** Server Actions for file handling, automatic Node package opt-out, built-in image optimization
- **TypeScript 5:** Build-time type safety for file upload and API integration contracts
- **better-sqlite3:** MVP-scale persistence without full database infrastructure
- **Tailwind CSS 4 + @tailwindcss/postcss:** Native RTL via `dir="rtl"` and `rtl:` modifier, no config file needed
- **sharp + pdfjs-dist:** Image normalization (CMYK to RGB, 8-bit conversion) and PDF page extraction
- **@react-pdf/renderer:** React-idiomatic PDF generation with custom Arabic font support

### Expected Features

**Must have (table stakes):**
- **Image Upload (JPG, PNG, PDF):** Drag-and-drop upload is standard; PDF support expected since many firms work from digital drawings
- **AI Render Generation:** Core value proposition; output must be photorealistic, not obviously AI-generated; under 60 seconds turnaround expected
- **Render Preview Display:** Full-width preview with loading state feedback
- **High-Resolution Image Download:** JPG/PNG download at sufficient resolution for print (2K-4K)
- **PDF Export with Branding:** Primary deliverable to clients; must include render image, project name, project number, firm name; A4/Letter format
- **Arabic RTL UI:** Full RTL layout throughout; Arabic labels; professional Arabic font (Noto Sans Arabic); Western Arabic numerals (0-9)

**Should have (competitive):**
- **Prompt Adjustment Controls:** Dropdown/slider controls for style (modern, traditional, mediterranean), window style, materials, lighting; NOT a raw text prompt box; architect-friendly terminology
- **PDF Upload support:** Many firms work from PDF drawings; easy addition with pdfjs-dist
- **PDF Customization:** Upload firm logo; choose primary brand color; customizable project name/number

**Defer (v2+):**
- **Multiple Angle Renders:** High complexity; requires consistent style matching across angles
- **Scene Context/Environment:** Landscaping, sky, ground plane; medium complexity
- **Multiple Render Variations (A/B):** Side-by-side comparison; low-medium complexity but not MVP-critical
- **Project History:** Implies persistence and auth; out of MVP scope
- **Interior Rendering:** Very high complexity; requires different AI model; explicitly excluded per PROJECT.md

### Architecture Approach

The architecture follows a three-layer pattern: client-facing React frontend for uploads and display, Express backend for job orchestration and validation, and external Nano Banana 2 AI service for image generation. The critical architectural challenge is handling the asynchronous nature of AI generation (10-60 seconds) with real-time progress feedback via Server-Sent Events (SSE). File uploads stream to temporary storage with UUID filenames, never trusting user-provided names or extensions.

**Major components:**
1. **Client (Browser):** Upload form, image preview, SSE listener for real-time progress, PDF download
2. **Express Backend:** File validation middleware, job orchestration, SSE streaming, PDF generation, serves static assets
3. **AI Orchestrator (Internal Module):** Manages job lifecycle, polls Nano Banana 2 for completion, emits SSE events
4. **File Storage:** Temporary UUID-named files during processing; uploads/ and results/ directories with TTL-based cleanup
5. **Nano Banana 2 (External):** External AI image generation; treated as untrusted; backend-only API calls

### Critical Pitfalls

1. **AI API Timeout Without User Feedback** — AI requests can take 10-60+ seconds. Without explicit timeout handling and progress feedback, users see infinite spinners and submit duplicates. Implement 120+ second timeouts with progressive SSE updates and a cancel option.

2. **Unvalidated File Uploads** — Checking only file extension is easily bypassed. Uploaded PHP shells, SVG with scripts, or oversized files cause RCE, storage exhaustion, or server crashes. Validate magic bytes, enforce strict MIME type allowlist, limit file size, store outside webroot, use UUID filenames.

3. **PDF Generation Blocking Main Thread** — PDF generation (especially with Puppeteer) is CPU-intensive. If triggered synchronously on Express, it blocks all other requests during generation. Offload to background job queue; never generate synchronously in the request handler.

4. **API Key Exposure in Frontend** — Bundling `NANO_BANANA_KEY` into frontend JavaScript exposes the key to attackers. ALL AI API calls must go through the backend via backend-for-frontend pattern.

5. **Ignoring Rate Limits** — Without understanding Nano Banana 2 rate limits, concurrent users or rapid regenerations cause 429 errors and quota exhaustion. Implement request queuing and exponential backoff with jitter.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Security
**Rationale:** Security and infrastructure must be foundational, not retrofitted. File upload vulnerabilities, storage lifecycle, and API key protection cannot be bolt-on additions.
**Delivers:** Express server with routing, file upload endpoint with multer, magic byte validation, UUID filename generation, storage lifecycle (TTL cleanup), in-memory job store, body size limits, backend-only API pattern
**Addresses:** Table stakes features #1 (Image Upload), Pitfalls #2 (Unvalidated Uploads), #4 (API Key Exposure), #7 (Memory Exhaustion), #8 (Stale File Accumulation)
**Avoids:** Security vulnerabilities that would require breaking changes later

### Phase 2: Core Upload and AI Integration
**Rationale:** The core product value depends entirely on AI integration working correctly. This phase adds complexity around async handling, rate limits, prompt injection, and image normalization.
**Delivers:** Nano Banana 2 API client wrapper, job submission flow, polling mechanism, 120+ second timeout handling with SSE progress, rate limiting (request queuing), exponential backoff, input sanitization for prompt injection, Sharp-based image normalization (CMYK to RGB, 8-bit), render caching via hash
**Addresses:** Table stakes #2 (AI Render Generation), #3 (Render Preview Display), Pitfalls #1 (Timeout), #5 (Rate Limits), #9 (Prompt Injection), #11 (Image Normalization), #12 (No Caching)
**Research Flags:** Verify Nano Banana 2 rate limits, supported input formats, and exact API response format

### Phase 3: Result Display and Download
**Rationale:** User needs to see and use the generated render. This phase connects the AI results to the frontend display with proper state management.
**Delivers:** Image download from Nano Banana 2, local result storage, result display in frontend with zoom capability, high-resolution image download button, SSE completion handler, error state UX
**Uses:** Stack elements from Phase 1-2
**Implements:** Architecture component #4 (Result Display)

### Phase 4: PDF Export with Branding
**Rationale:** The PDF is the primary deliverable and the product's most important output. RTL layout, Arabic fonts, and job race conditions must be handled correctly.
**Delivers:** @react-pdf/renderer template for branded PDF, firm name/logo embedding, project metadata fields, Arabic RTL text with Noto Sans Arabic font, A4/Letter layout, job deduplication for race conditions, PDF download with status polling
**Addresses:** Table stakes #5 (PDF Export), Pitfalls #3 (Main Thread Block), #6 (RTL Layout), #10 (Race Condition), #13 (Premature Download)
**Avoids:** Background job queue infrastructure needed for production; implement job deduplication and async status polling

### Phase 5: Prompt Refinement and Variations (MVP Enhancement)
**Rationale:** After core workflow works, add the differentiators that make the product competitive. Prompt adjustment controls are highly valued by architects and have medium complexity.
**Delivers:** Dropdown/slider controls for style, window style, materials, lighting; PDF upload support via pdfjs-dist; prompt caching; PDF customization (logo upload, brand color)
**Research Flags:** Prompt engineering for architectural terminology; verify Nano Banana 2 prompt modification response time

### Phase Ordering Rationale

- **Phase 1 before Phase 2:** File validation and security patterns must be in place before AI integration; you cannot add magic-byte validation retroactively without potentially breaking existing uploads
- **Phase 2 before Phase 3:** Results display depends on AI integration working; Phase 3 just connects the dots
- **Phase 3 before Phase 4:** PDF export depends on having a render to embed; you cannot test PDF layout without actual generated images
- **Phase 4 before Phase 5:** The branded PDF deliverable is the core product; refinements come after the core workflow is stable
- **Grouping rationale:** Phases 1-2 form the infrastructure layer; Phase 3 is the output layer; Phase 4 is the deliverable layer; Phase 5 is the enhancement layer
- **Pitfall mitigation:** Each phase explicitly addresses specific pitfalls rather than trying to fix everything in Phase 1

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Core Upload + AI Integration):** Nano Banana 2 API specifics (endpoints, authentication, rate limits, response format) are unverified; research-phase recommended to confirm API contract
- **Phase 4 (PDF Export + Branding):** Arabic PDF typography (font licensing, RTL text flow in PDFKit) may need design consultation
- **Phase 5 (Prompt Refinement):** Architectural terminology mapping to Nano Banana 2 prompts may require experimentation

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** File upload security (OWASP patterns), Express middleware, SSE patterns are well-documented
- **Phase 3 (Result Display):** Standard image display, download, and SSE integration patterns are well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Based on Next.js 16, React 19 official docs; specific package versions may shift; Nano Banana 2 integration details unverified |
| Features | MEDIUM | Based on training data and project context; unable to verify against live competitor sites (mnml.ai returned 403) |
| Architecture | MEDIUM | General Node.js/Express patterns well-documented; SSE, polling, and PDFKit patterns are standard; Nano Banana 2 polling interval TBD |
| Pitfalls | MEDIUM-HIGH | OWASP file upload standards high confidence; AI API timeout and rate limit patterns based on general knowledge; Nano Banana 2 specifics unverified |

**Overall confidence:** MEDIUM

### Gaps to Address

1. **Nano Banana 2 API verification:** Exact endpoints, authentication method, rate limits, supported input formats, timeout behavior, and response format are unverified. Must confirm before Phase 2 implementation.

2. **Competitor feature verification:** Feature analysis (mnml.ai and others) could not be live-verified due to access restrictions. Recommend verifying competitor capabilities once access is available.

3. **Arabic font licensing:** Noto Sans Arabic is Google Fonts (open source), but commercial PDF generation may require additional licensing verification.

4. **RTL PDF rendering:** PDFKit's Arabic text support requires testing; font registration and RTL text flow must be verified during Phase 4 implementation.

## Sources

### Primary (HIGH confidence)
- Next.js 16.2.1 docs (2026-03-25) — serverExternalPackages, App Router, Server Actions
- Tailwind CSS v4 docs (2026-03) — RTL support via `rtl:` modifier
- React 19.2.1 blog (December 2024/patches through 2026) — Server Components, Actions, `use()` hook
- OWASP File Upload Cheat Sheet (https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) — file validation, magic bytes, security headers
- PDFKit GitHub Documentation — PDF generation API, image embedding
- MDN SSE Documentation — real-time updates pattern
- MDN Express/Node.js Documentation — backend patterns, middleware, error handling

### Secondary (MEDIUM confidence)
- react-pdf.org — PDF generation with custom fonts
- Next.js auto-opt-out list — `@react-pdf/renderer`, `sharp` already listed
- Arabic RTL web development best practices — general RTL patterns
- Architecture AI rendering domain knowledge — general product patterns

### Tertiary (LOW confidence)
- mnml.ai and competitor analysis — could not verify due to 403 access restriction
- Nano Banana 2 API specifics — not documented; requires direct verification

---
*Research completed: 2026-03-29*
*Ready for roadmap: yes*

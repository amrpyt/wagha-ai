# Roadmap: Wagha-ai

**Phases:** 5 | **Requirements:** 32 | **All v1 requirements covered ✓**

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation & Arabic UI | Next.js project with Arabic RTL UI and secure file upload | 11 | Project scaffolded, Arabic UI visible, file upload working |
| 2 | AI Integration | Nano Banana 2 connected, renders generating | 7 | Upload → render completes in <60s with progress feedback |
| 3 | Result Display & Download | Render shown, downloadable | 5 | Render preview displays, JPG downloads correctly |
| 4 | Branded PDF Export | Professional Arabic RTL PDF delivered | 6 | PDF opens in Arabic RTL, correct layout, downloadable |
| 5 | Prompt Refinement & Branding | Style controls + firm branding | 4 | Dropdown style selection regenerates, logo appears in PDF |

---

## Phase 1: Foundation & Arabic UI

**Goal:** Project scaffolded with Next.js 16 + React 19, full Arabic RTL UI, and secure file upload infrastructure.

**Requirements:** UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05, UPLOAD-06, UI-01, UI-02, UI-03, UI-04, UI-05

**Success Criteria:**
1. Next.js project initializes with TypeScript and Tailwind CSS v4
2. `dir="rtl"` set on `<html>`, all layouts flip correctly
3. Arabic labels throughout the UI — no English text visible
4. Drag-and-drop upload zone accepts JPG, PNG, and PDF files
5. Files validated by magic bytes and MIME type before processing
6. Files stored with UUID filenames in `/uploads/` directory
7. Project name, project number, and firm name input fields present
8. Upload feels fast and responsive (< 2 seconds for small files)

**Phase Type:** Foundation

---

## Phase 2: AI Integration

**Goal:** Nano Banana 2 connected, images render to photorealistic 3D exteriors, progress shown in real-time.

**Requirements:** AI-01, AI-02, AI-03, AI-04, AI-05, AI-06, AI-07

**Success Criteria:**
1. Uploaded image is normalized (CMYK→RGB, 8-bit) before sending to API
2. Pre-built architectural prompt configured and sent to Nano Banana 2
3. Progress feedback shown via SSE (percentage or status messages)
4. Generation completes in under 60 seconds
5. Timeout after 120 seconds with clear error message and retry option
6. Cancel button stops in-progress generation
7. Rendered image stored and accessible for display
8. Retry on 429 rate limit with exponential backoff

**Dependencies:** Phase 1 (file upload and storage must exist first)

**Phase Type:** Core Feature

---

## Phase 3: Result Display & Download

**Goal:** Render visible in UI, downloadable as high-resolution JPG.

**Requirements:** DISPLAY-01, DISPLAY-02, DISPLAY-03, DOWNLOAD-01, DOWNLOAD-02

**Success Criteria:**
1. Loading spinner/progress bar shown during generation (from Phase 2 SSE)
2. Render preview displays full-width after completion
3. Error state shows clear message if generation fails, with retry button
4. "Download JPG" button present on render preview
5. Downloaded file named `project-name-render.jpg` using provided project name
6. Image resolution sufficient for print (2K minimum)

**Dependencies:** Phase 2 (AI generation must work)

**Phase Type:** Output Layer

---

## Phase 4: Branded PDF Export

**Goal:** Professional Arabic RTL PDF generated with render, project name, number, and firm name — the deliverable the architecture firm sends to their client.

**Requirements:** PDF-01, PDF-02, PDF-03, PDF-04, PDF-05, PDF-06

**Success Criteria:**
1. "Generate PDF" button present alongside render preview
2. PDF generated as background job (does not block UI)
3. PDF layout is RTL — Arabic text flows right-to-left
4. PDF includes: render image (centered), project name, project number, firm name
5. Noto Sans Arabic font used for all Arabic text in PDF
6. PDF downloadable from UI after generation
7. PDF opens correctly in standard Arabic PDF readers

**Dependencies:** Phase 3 (render image must exist before PDF can embed it)

**Phase Type:** Deliverable

---

## Phase 5: Prompt Refinement & Branding

**Goal:** Architects can refine renders with style controls and add firm branding to PDFs.

**Requirements:** REFINE-01, REFINE-02, REFINE-03, BRAND-01, BRAND-02

**Success Criteria:**
1. Building style dropdown: modern / traditional / mediterranean
2. Lighting dropdown: day / golden hour / dusk
3. Selecting a new style regenerates the render with that style applied
4. Regeneration uses same uploaded image, only prompt changes
5. User can upload firm logo (JPG/PNG, displayed in PDF)
6. User can select primary brand color (used for PDF accents)

**Dependencies:** Phase 4 (PDF generation infrastructure must exist)

**Phase Type:** Enhancement

---

## v2 & Future

After MVP validates with the architecture firm:

- Multiple angle renders (corner, rear, aerial)
- Scene context (environment, landscaping, sky)
- Side-by-side render variations (A/B comparison)
- Project history (last N renders)
- Batch upload (multiple projects)
- Interior rendering (separate AI model)

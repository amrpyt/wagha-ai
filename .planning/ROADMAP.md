# Roadmap: Wagha-ai

**Phases:** 5 | **Requirements:** 47 | **All v1 requirements covered ✓**

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | SaaS Foundation & Arabic UI | Multi-tenant auth, Paymob, database, Arabic RTL UI | 31 | Firm can signup, subscribe, see dashboard |
| 2 | Upload & AI Integration | File upload + Nano Banana 2 renders | 13 | Upload → render in <60s with progress feedback |
| 3 | Result Display & Download | Render visible, downloadable | 5 | Render preview displays, JPG downloads |
| 4 | Branded PDF Export | Arabic RTL PDF with firm branding | 7 | PDF opens in Arabic RTL with logo |
| 5 | Prompt Refinement | Style controls + variations | 3 | Dropdown style selection regenerates |

---

## Phase 1: SaaS Foundation & Arabic UI

**Goal:** Multi-tenant SaaS infrastructure — auth, Paymob subscription billing, database, Arabic RTL UI foundation.

**Requirements:** AUTH-01 through AUTH-07, BILL-01 through BILL-07, DASH-01 through DASH-05, UI-01 through UI-06

**Plans:** 5 plans

Plans:
- [x] 01-01-PLAN.md — Foundation & Infrastructure (Wave 1: Next.js, RTL, Supabase, DB schema)
- [x] 01-02-PLAN.md — Authentication Flows (Wave 2: Signup, Login, Verification, Password Reset, Logout)
- [x] 01-03-PLAN.md — Dashboard & Projects (Wave 2: Sidebar, Project Grid, Project Detail, Delete)
- [x] 01-04-PLAN.md — Settings & Team (Wave 2: Account Settings, Firm Settings, Team Invites)
- [x] 01-05-PLAN.md — Billing & Pricing (Wave 2: Pricing Page, Paymob, Webhooks, Billing Settings)

**Success Criteria:**
1. Firm can sign up with email/password and receive email verification
2. User can log in, stay logged in, reset password, log out
3. Firm admin can invite team members by email
4. Each firm sees only their own data (multi-tenant isolation)
5. Pricing page showing 3 plans in EGP (Starter 250, Business 750, Pro 2000)
6. Free render on signup — renders work immediately
7. After free render used, firm sees upgrade prompt — renders blocked
8. Firm can subscribe via Paymob checkout
9. Firm can view credits and cancel subscription in settings
10. Dashboard shows past projects for the firm
11. Firm settings: firm name, logo upload, primary brand color
12. Full Arabic RTL UI — RTL layout, Noto Sans Arabic font, native HTML + Tailwind components
13. Account settings: name, email, password change

**Phase Type:** Infrastructure

---

## Phase 2: Upload & AI Integration

**Goal:** Secure file upload + Nano Banana 2 connected to generate photorealistic renders.

**Requirements:** UPLOAD-01 through UPLOAD-06, AI-01 through AI-07

**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md — Setup & Dependencies (Wave 1: npm packages, next.config, directory structure)
- [x] 02-02-PLAN.md — Upload & AI Libraries (Wave 2: validation, storage, processing, prompts, client)
- [x] 02-03-PLAN.md — Server Action & SSE Route (Wave 3: uploadAndGenerate action, /api/generate SSE endpoint)
- [ ] 02-04-PLAN.md — Upload UI Components (Wave 4: DropZone, ProjectForm, GenerationProgress, new project page)

**Success Criteria:**
1. Drag-and-drop upload accepts JPG, PNG, and PDF files
2. Files validated by magic bytes and MIME type before processing
3. Files stored with UUID filenames in `/uploads/` directory
4. Upload associated with logged-in firm (multi-tenant)
5. Project name and project number entered before generation
6. Image normalized (CMYK→RGB, 8-bit) before API call
7. Pre-built architectural prompt sent to Nano Banana 2
8. Progress feedback via SSE (percentage or status messages)
9. Generation completes in under 60 seconds
10. 120s timeout with clear error and retry option
11. Cancel button stops in-progress generation
12. Retry on 429 rate limit with exponential backoff
13. Rendered image stored and accessible for display

**Dependencies:** Phase 1 (auth and multi-tenant DB must exist)

**Phase Type:** Core Feature

---

## Phase 3: Result Display & Download

**Goal:** Render visible in UI, downloadable as high-resolution JPG.

**Requirements:** DISPLAY-01, DISPLAY-02, DISPLAY-03, DOWNLOAD-01, DOWNLOAD-02

**Success Criteria:**
1. Loading spinner/progress bar shown during generation
2. Render preview displays full-width after completion
3. Error state shows clear message if generation fails, with retry button
4. "Download JPG" button present on render preview
5. Downloaded file named `project-name-render.jpg`

**Dependencies:** Phase 2 (AI generation must work)

**Phase Type:** Output Layer

---

## Phase 4: Branded PDF Export

**Goal:** Professional Arabic RTL PDF with firm logo, project info, rendered image.

**Requirements:** PDF-01 through PDF-07

**Success Criteria:**
1. "Generate PDF" button present alongside render preview
2. PDF generated as background job (does not block UI)
3. PDF layout is RTL — Arabic text flows right-to-left
4. PDF includes: render image, project name, project number, firm name, firm logo
5. Noto Sans Arabic font used for all Arabic text in PDF
6. pdfmake-rtl used for Arabic RTL layout (not @react-pdf/renderer)
7. PDF downloadable from UI after generation

**Dependencies:** Phase 3 (render image must exist)

**Phase Type:** Deliverable

---

## Phase 5: Prompt Refinement

**Goal:** Architects can refine renders with style controls without re-uploading.

**Requirements:** REFINE-01, REFINE-02, REFINE-03

**Success Criteria:**
1. Building style dropdown: modern / traditional / mediterranean
2. Lighting dropdown: day / golden hour / dusk
3. Selecting a new style regenerates the render with that style applied
4. Regeneration uses same uploaded image, only prompt changes

**Dependencies:** Phase 4 (PDF and render infrastructure must exist)

**Phase Type:** Enhancement

---

## v2 & Future

After MVP validates with subscribing firms:

- Multiple angle renders (corner, rear, aerial)
- Scene context (environment, landscaping, sky)
- Side-by-side render variations (A/B comparison)
- Project history with thumbnails
- Batch upload (multiple projects)
- Interior rendering (separate AI model)
- Email delivery of PDF to client

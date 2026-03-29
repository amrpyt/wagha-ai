# Requirements: Wagha-ai

**Defined:** 2026-03-29
**Core Value:** Turn a 2D architectural plan or building photo into a photorealistic 3D exterior render in under 60 seconds — and deliver it as a branded PDF to the client.

## v1 Requirements

### Upload

- [ ] **UPLOAD-01**: User can upload a JPG or PNG image via drag-and-drop or file picker
- [ ] **UPLOAD-02**: User can upload a PDF containing a 2D floor plan
- [ ] **UPLOAD-03**: Uploaded files are validated (magic bytes, MIME type, size limit) before processing
- [ ] **UPLOAD-04**: Files are stored with UUID filenames (not user-provided names)
- [ ] **UPLOAD-05**: User can enter project name and project number before generating
- [ ] **UPLOAD-06**: User can enter firm name for PDF branding

### AI Rendering

- [ ] **AI-01**: System sends uploaded image to Nano Banana 2 with a pre-built architectural prompt
- [ ] **AI-02**: System receives a photorealistic 3D exterior render back
- [ ] **AI-03**: Render generation shows real-time progress feedback (SSE — percentage or status)
- [ ] **AI-04**: Generation has a 120+ second timeout with clear error if it fails
- [ ] **AI-05**: User can cancel an in-progress generation
- [ ] **AI-06**: Pre-built prompt produces architecturally plausible exteriors (realistic style, no facade shown in red)
- [ ] **AI-07**: Rendered image is normalized (CMYK to RGB, 8-bit) before display

### Display & Download

- [ ] **DISPLAY-01**: Render preview is shown full-width after generation completes
- [ ] **DISPLAY-02**: Loading state with progress indicator shown during generation
- [ ] **DISPLAY-03**: Error state shown if generation fails, with retry option
- [ ] **DOWNLOAD-01**: User can download the render as a high-resolution JPG
- [ ] **DOWNLOAD-02**: Downloaded file is named with project name (e.g., "project-name-render.jpg")

### PDF Export

- [ ] **PDF-01**: User can generate a branded PDF containing the render image
- [ ] **PDF-02**: PDF displays project name, project number, and firm name
- [ ] **PDF-03**: PDF layout is RTL (Arabic text flows right-to-left)
- [ ] **PDF-04**: PDF uses Noto Sans Arabic font for Arabic text
- [ ] **PDF-05**: PDF is generated as a background job (does not block server)
- [ ] **PDF-06**: PDF is downloadable from the UI after generation

### UI / UX

- [ ] **UI-01**: Entire UI is in Arabic with right-to-left layout
- [ ] **UI-02**: Numbers display as Western Arabic numerals (0-9)
- [ ] **UI-03**: Professional Arabic font used throughout
- [ ] **UI-04**: Drag-and-drop upload area has clear visual feedback
- [ ] **UI-05**: All interactive elements have clear hover/active states

## v2 Requirements

### Prompt Refinement

- [ ] **REFINE-01**: User can select building style (modern, traditional, mediterranean) via dropdown
- [ ] **REFINE-02**: User can select lighting/time-of-day via dropdown
- [ ] **REFINE-03**: Regeneration applies selected style without re-uploading

### PDF Customization

- [ ] **BRAND-01**: User can upload firm logo for PDF inclusion
- [ ] **BRAND-02**: User can select primary brand color for PDF accents

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication / accounts | MVP validates with single firm; no multi-user needed |
| Interior renders | Explicitly excluded — only exterior for MVP |
| Raw text prompt interface | Target user is architect, not prompt engineer |
| 3D floor plan generation | Separate product category (BIM); not attempted |
| Real-time 3D walkthrough | Requires WebGL/Three.js; out of scope |
| Payment processing | Validate product first before billing |
| English toggle / bilingual UI | Arabic-only MVP scope |
| Multiple angle renders | High complexity; defer to v2+ |
| Project history / persistence | No auth/database for MVP |
| Batch upload | Single-project flow for MVP validation |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UPLOAD-01 | Phase 1 | Pending |
| UPLOAD-02 | Phase 1 | Pending |
| UPLOAD-03 | Phase 1 | Pending |
| UPLOAD-04 | Phase 1 | Pending |
| UPLOAD-05 | Phase 1 | Pending |
| UPLOAD-06 | Phase 1 | Pending |
| AI-01 | Phase 2 | Pending |
| AI-02 | Phase 2 | Pending |
| AI-03 | Phase 2 | Pending |
| AI-04 | Phase 2 | Pending |
| AI-05 | Phase 2 | Pending |
| AI-06 | Phase 2 | Pending |
| AI-07 | Phase 2 | Pending |
| DISPLAY-01 | Phase 3 | Pending |
| DISPLAY-02 | Phase 3 | Pending |
| DISPLAY-03 | Phase 3 | Pending |
| DOWNLOAD-01 | Phase 3 | Pending |
| DOWNLOAD-02 | Phase 3 | Pending |
| PDF-01 | Phase 4 | Pending |
| PDF-02 | Phase 4 | Pending |
| PDF-03 | Phase 4 | Pending |
| PDF-04 | Phase 4 | Pending |
| PDF-05 | Phase 4 | Pending |
| PDF-06 | Phase 4 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 1 | Pending |
| UI-04 | Phase 1 | Pending |
| UI-05 | Phase 1 | Pending |
| REFINE-01 | Phase 5 | Pending |
| REFINE-02 | Phase 5 | Pending |
| REFINE-03 | Phase 5 | Pending |
| BRAND-01 | Phase 5 | Pending |
| BRAND-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after initial definition*

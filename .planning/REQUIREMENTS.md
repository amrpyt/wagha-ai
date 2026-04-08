# Requirements: Wagha-ai

**Defined:** 2026-03-29
**Core Value:** Architecture firms subscribe → upload a 2D plan → get a branded PDF render in under 60 seconds → send to their client.

## v1 Requirements

### Authentication & Multi-Tenancy

- [ ] **AUTH-01**: Firm can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can log in and stay logged in across sessions
- [ ] **AUTH-04**: User can reset password via email link
- [ ] **AUTH-05**: Firm admins can invite team members by email
- [ ] **AUTH-06**: Each firm has isolated data — cannot see other firms' projects
- [ ] **AUTH-07**: User can log out from any page

### Subscriptions & Billing

- [ ] **BILL-01**: Firm sees pricing plans (monthly / annual)
- [ ] **BILL-02**: Firm can start a free trial without entering payment info
- [ ] **BILL-03**: Firm can subscribe to a plan via Stripe checkout
- [ ] **BILL-04**: Subscribed firms can access full rendering features
- [ ] **BILL-05**: Trial expired firms are blocked from rendering (see upgrade prompt)
- [ ] **BILL-06**: Firm can view and manage billing in account settings
- [ ] **BILL-07**: Firm can cancel subscription

### Dashboard

- [ ] **DASH-01**: Firm dashboard shows all past projects (render + PDF history)
- [ ] **DASH-02**: User can view a past project and re-download render or PDF
- [ ] **DASH-03**: User can delete a project from their history
- [ ] **DASH-04**: Firm settings: firm name, logo upload, primary brand color
- [ ] **DASH-05**: Account settings: user name, email, password change

### Upload

- [ ] **UPLOAD-01**: User can upload a JPG or PNG image via drag-and-drop or file picker
- [ ] **UPLOAD-02**: User can upload a PDF containing a 2D floor plan
- [x] **UPLOAD-03**: Uploaded files are validated (magic bytes, MIME type, size limit) before processing
- [x] **UPLOAD-04**: Files are stored with UUID filenames (not user-provided names)
- [ ] **UPLOAD-05**: User can enter project name and project number before generating
- [ ] **UPLOAD-06**: Upload is associated with the logged-in firm (multi-tenant)

### AI Rendering

- [x] **AI-01**: System sends uploaded image to Nano Banana 2 with a pre-built architectural prompt
- [ ] **AI-02**: System receives a photorealistic 3D exterior render back
- [ ] **AI-03**: Render generation shows real-time progress feedback (SSE — percentage or status)
- [ ] **AI-04**: Generation has a 120+ second timeout with clear error if it fails
- [ ] **AI-05**: User can cancel an in-progress generation
- [x] **AI-06**: Pre-built prompt produces architecturally plausible exteriors (realistic style, no facade shown in red)
- [x] **AI-07**: Rendered image is normalized (CMYK to RGB, 8-bit) before display

### Display & Download

- [ ] **DISPLAY-01**: Render preview is shown full-width after generation completes
- [ ] **DISPLAY-02**: Loading state with progress indicator shown during generation
- [ ] **DISPLAY-03**: Error state shown if generation fails, with retry option
- [ ] **DOWNLOAD-01**: User can download the render as a high-resolution JPG
- [ ] **DOWNLOAD-02**: Downloaded file is named with project name (e.g., "project-name-render.jpg")

### PDF Export

- [ ] **PDF-01**: User can generate a branded PDF containing the render image
- [ ] **PDF-02**: PDF displays render image, project name, project number, and firm name
- [ ] **PDF-03**: PDF layout is RTL (Arabic text flows right-to-left)
- [ ] **PDF-04**: PDF uses Noto Sans Arabic font for Arabic text
- [ ] **PDF-05**: PDF is generated as a background job (does not block server)
- [ ] **PDF-06**: PDF is downloadable from the UI after generation
- [ ] **PDF-07**: Firm logo (uploaded in settings) appears in PDF header

### UI / UX

- [ ] **UI-01**: Entire UI is in Arabic with right-to-left layout
- [ ] **UI-02**: Numbers display as Western Arabic numerals (0-9)
- [ ] **UI-03**: Professional Arabic font used throughout (Noto Sans Arabic)
- [ ] **UI-04**: Drag-and-drop upload area has clear visual feedback
- [ ] **UI-05**: All interactive elements have clear hover/active states
- [ ] **UI-06**: Noor-UI RTL component library used for standard UI elements

## v2 Requirements

### Prompt Refinement

- [ ] **REFINE-01**: User can select building style (modern, traditional, mediterranean) via dropdown
- [ ] **REFINE-02**: User can select lighting/time-of-day via dropdown
- [ ] **REFINE-03**: Regeneration applies selected style without re-uploading

## Out of Scope

| Feature | Reason |
|---------|--------|
| Interior renders | Explicitly excluded — only exterior for MVP |
| Raw text prompt interface | Target user is architect, not prompt engineer |
| 3D floor plan generation | Separate product category (BIM); not attempted |
| Real-time 3D walkthrough | Requires WebGL/Three.js; out of scope |
| English toggle / bilingual UI | Arabic-only MVP scope |
| Multiple angle renders | High complexity; defer to v2+ |
| Batch upload | Single-project flow for MVP |
| Mobile app | Web-first; mobile later |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| AUTH-07 | Phase 1 | Pending |
| BILL-01 | Phase 1 | Pending |
| BILL-02 | Phase 1 | Pending |
| BILL-03 | Phase 1 | Pending |
| BILL-04 | Phase 1 | Pending |
| BILL-05 | Phase 1 | Pending |
| BILL-06 | Phase 1 | Pending |
| BILL-07 | Phase 1 | Pending |
| DASH-01 | Phase 1 | Pending |
| DASH-02 | Phase 1 | Pending |
| DASH-03 | Phase 1 | Pending |
| DASH-04 | Phase 1 | Pending |
| DASH-05 | Phase 1 | Pending |
| UPLOAD-01 | Phase 2 | Pending |
| UPLOAD-02 | Phase 2 | Pending |
| UPLOAD-03 | Phase 2 | Complete |
| UPLOAD-04 | Phase 2 | Complete |
| UPLOAD-05 | Phase 2 | Pending |
| UPLOAD-06 | Phase 2 | Pending |
| AI-01 | Phase 2 | Complete |
| AI-02 | Phase 2 | Pending |
| AI-03 | Phase 2 | Pending |
| AI-04 | Phase 2 | Pending |
| AI-05 | Phase 2 | Pending |
| AI-06 | Phase 2 | Complete |
| AI-07 | Phase 2 | Complete |
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
| PDF-07 | Phase 4 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 1 | Pending |
| UI-04 | Phase 1 | Pending |
| UI-05 | Phase 1 | Pending |
| UI-06 | Phase 1 | Pending |
| REFINE-01 | Phase 5 | Pending |
| REFINE-02 | Phase 5 | Pending |
| REFINE-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after SaaS scope expansion*

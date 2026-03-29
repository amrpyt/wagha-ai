# Wagha-ai (wagha-AI)

## What This Is

An Arabic AI-powered architectural rendering tool that lets architecture firms upload 2D floor plans or building photos and instantly generate photorealistic 3D exterior renders — replacing a process that traditionally takes weeks with a 3D artist, down to one minute with AI. The tool wraps Nano Banana 2 inside a polished Arabic UI with professional pre-built prompts, so the firm's client gets a beautifully formatted PDF deliverable without any AI back-and-forth.

## Core Value

Turn a 2D architectural plan or building photo into a photorealistic 3D exterior render in under 60 seconds — and deliver it as a branded PDF to the client.

## Requirements

### Active

- [ ] Architecture firm can upload a 2D floor plan (image: JPG, PNG) or building frontage photo
- [ ] Architecture firm can upload a PDF containing a 2D floor plan
- [ ] System sends upload to Nano Banana 2 AI with a professional pre-built prompt
- [ ] System receives a photorealistic 3D exterior render back
- [ ] Render is displayed in the Arabic UI with a preview
- [ ] User can regenerate with modified prompt adjustments (window style, materials, lighting)
- [ ] User can download the render as a high-resolution image
- [ ] System generates a branded PDF with the render image, project name, project number, and firm name
- [ ] PDF is formatted professionally for client delivery
- [ ] Full Arabic RTL UI throughout

### Out of Scope

- Interior renders — only exterior for MVP
- 3D floor plan generation (2D → 2D plan drawing)
- Real-time 3D walkthrough or orbit views
- User accounts / authentication
- Payment processing
- Multiple project management / dashboard
- mnml.ai's full feature set — only the exterior-ai equivalent

## Context

**The opportunity:** An architecture firm leader (the paying client) currently:
- Sends 2D floor plans or building photos to a 3D artist who takes ~2 weeks per render
- Wants to show clients photorealistic exteriors during early design phases
- Is excited by AI but doesn't want to manage prompts or back-and-forth with image generators

**The product insight:** The firm doesn't want an AI tool — they want a *result*. They want to send a PDF, get back a professional render, and send that to their client. The pre-built prompts + PDF export is the product, not the AI itself.

**Reference site:** https://mnml.ai/app/exterior-ai — studied and will be scraped for UX inspiration.

**AI engine:** Nano Banana 2 — already proven to work for this use case by the founder.

**Language:** Arabic RTL. The UI must feel native to Arabic-speaking architecture professionals.

## Constraints

- **Tech**: Web app (Arabic RTL frontend, backend for file handling and PDF generation)
- **AI**: Nano Banana 2 for image generation — no alternative for MVP
- **Timeline**: MVP scoped to ship quickly to validate with the architecture firm
- **Scope**: Exterior only — no interior renders, no authentication, no payments

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Nano Banana 2 as AI engine | Already proven working for this exact use case | — Pending |
| Arabic RTL only, no bilingual toggle | Arabic-speaking firm; simplify MVP scope | — Pending |
| Exterior only (no interior) | User explicitly scoped to mnml.ai/exterior-ai equivalent | — Pending |
| No auth/payments for MVP | Validate product with single client first | — Pending |
| PDF export with branding | Core deliverable — what makes it useful to the firm | — Pending |

---

*Last updated: 2026-03-29 after initialization*

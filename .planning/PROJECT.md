# Wagha-ai (wagha-AI)

## What This Is

A **multi-tenant SaaS** targeting architecture firms in Arabic-speaking markets. Firms self-serve signup, subscribe via Stripe, upload 2D floor plans or building photos, and receive photorealistic 3D exterior renders powered by Nano Banana 2 — delivered as a branded Arabic PDF. The pre-built prompts hide AI complexity; the branded PDF is what firms send to their own clients.

## Core Value

Architecture firms subscribe → upload a 2D plan → get a branded PDF render in under 60 seconds → send to their client.

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

- **Tech**: Next.js 16 + React 19 (full-stack SaaS), multi-tenant database
- **AI**: Nano Banana 2 (Google's API — paid per render, markup on subscription)
- **Payments**: Paymob subscription (self-serve signup, free trial, monthly/annual) — Stripe not available in Egypt
- **PDF**: pdfmake-rtl (Arabic RTL built-in)
- **Scope**: Exterior only — no interior renders for MVP

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Nano Banana 2 as AI engine | Already proven for this use case; fast, photorealistic | — Pending |
| Arabic RTL only, no bilingual | Arabic market first; simplify MVP scope | — Pending |
| pdfmake-rtl for PDF | Arabic RTL built-in, production-ready NPM package | — Pending |
| Multi-tenant from day 1 | Self-serve SaaS; each firm has isolated data | — Pending |
| Stripe subscriptions | ~~Stripe~~ Paymob — Stripe not available in Egypt | — Pending |
| Exterior only (no interior) | User scoped to mnml.ai/exterior-ai equivalent | — Pending |
| Noor-UI RTL components | 78 free Arabic RTL components; don't rebuild | — Pending |

---

*Last updated: 2026-04-10 after Phase 03 completion (mini-apps hub live at /apps/)*

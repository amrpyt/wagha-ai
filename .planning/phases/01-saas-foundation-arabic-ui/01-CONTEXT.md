# Phase 1: SaaS Foundation & Arabic UI - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Multi-tenant SaaS infrastructure: authentication, Stripe subscriptions, database, Arabic RTL UI, and firm dashboard with folder-based project organization.

</domain>

<decisions>
## Implementation Decisions

### Infrastructure & Stack
- **D-01:** PostgreSQL database via Supabase — row-level security for multi-tenant firm data isolation
- **D-02:** Hosting: Vercel (frontend/Next.js) + Supabase (database, auth, file storage)
- **D-03:** Authentication: Supabase Auth (email/password, magic links, email verification)
- **D-04:** Next.js 16 + React 19, TypeScript, Tailwind CSS v4
- **D-05:** Noor-UI RTL component library for Arabic UI elements (78 free components)
- **D-06:** Resolution for renders: 1K (1024px) — sufficient quality, lower API cost

### Arabic UI
- **D-07:** Full Arabic RTL layout throughout — `dir="rtl"` + Tailwind `rtl:` modifier
- **D-08:** Noto Sans Arabic as the primary font
- **D-09:** Western Arabic numerals (0-9) — not Eastern Arabic numerals
- **D-10:** pdfmake-rtl for Arabic PDF generation (NOT @react-pdf/renderer — Arabic support broken)

### Subscription & Billing Model
- **D-11:** Credit-based subscription (like mnml.ai) — not unlimited renders
- **D-12:** 1 free render per firm (lead-gen offer, no time limit, one-time only)
- **D-13:** Credits do NOT roll over each month — resets at billing cycle
- **D-14:** 1 credit = 1 render at 1K resolution
- **D-15:** Subscription tiers (all prices in EGP, Egyptian Pounds):
  - Starter: 250 EGP/mo → 10 renders/month (~87% margin)
  - Business: 750 EGP/mo → 30 renders/month (~87% margin)
  - Pro: 2,000 EGP/mo → 100 renders/month (~83% margin)
- **D-16:** NB2 API cost per render: ~$0.067 × 50 EGP = ~3.35 EGP/render at 1K standard API

### Dashboard & Project Organization
- **D-17:** Folder-based project organization — firms can create named folders to group projects
- **D-18:** All team members see ALL projects and ALL folders — no per-folder access control
- **D-19:** Team member invites by email — all members have equal access

### Auth & Multi-Tenancy
- **D-20:** Firms sign up via Supabase Auth (email/password)
- **D-21:** Firm admin can invite team members by email
- **D-22:** Row-level security in Supabase PostgreSQL — each firm sees only their own data
- **D-23:** Email verification required after signup
- **D-24:** Password reset via email link

### Stripe Integration
- **D-25:** Stripe checkout for subscription payment
- **D-26:** Free trial = 1 render (not time-based) — rendered immediately on signup
- **D-27:** After free render used, firm sees upgrade prompt to subscribe
- **D-28:** Subscription managed via Stripe billing portal (cancel, upgrade, invoices)

### Claude's Discretion
- Folder naming conventions — planner decides
- Exact dashboard layout/visual hierarchy — planner decides
- How the free render prompt works (does it show a branded result immediately?) — planner decides
- Email templates for verification, invites, etc. — planner decides

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project
- `.planning/PROJECT.md` — Full project vision and constraints
- `.planning/REQUIREMENTS.md` — All v1 requirements for this phase (AUTH-01 through AUTH-07, BILL-01 through BILL-07, DASH-01 through DASH-05, UI-01 through UI-06)
- `.planning/ROADMAP.md` — Phase 1 goal and success criteria

### Research
- `.planning/research/STACK.md` — Technology recommendations (Next.js 16, React 19, Tailwind v4, pdfmake-rtl)
- `.planning/research/FEATURES.md` — Feature landscape (table stakes vs differentiators)
- `.planning/research/ARCHITECTURE.md` — Architecture components (Express, SSE, job orchestration)
- `.planning/research/PITFALLS.md` — Critical pitfalls to avoid (file upload security, API key protection, PDF blocking)
- `.planning/research/SUMMARY.md` — Executive summary and research gaps

### External References
- `https://mnml.ai/pricing` — Reference for credit-based subscription model
- `https://aifreeapi.com/en/posts/nano-banana-2-pricing` — NB2 pricing breakdown (verified March 2026): $0.067/render at 1K standard API
- `https://github.com/aysnet1/pdfmake-rtl` — pdfmake-rtl NPM package for Arabic RTL PDF generation
- `https://github.com/ositaka/noor-ui/` — Noor-UI RTL-first design system (78 Arabic RTL components)
- `https://tailwindcss.com/docs/guides/v4` — Tailwind CSS v4 setup

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — fresh project

### Established Patterns
- No established patterns — fresh project

### Integration Points
- Supabase Auth → Next.js middleware for session management
- Supabase PostgreSQL → Row-level security policies per firm
- Stripe Checkout → Supabase webhook to update subscription status
- Supabase Storage → UUID-named file storage for uploads and renders

</code_context>

<specifics>
## Specific Ideas

- mnml.ai exterior-ai is the reference UX: https://mnml.ai/app/exterior-ai
- The dashboard should feel professional — architecture firms are design-conscious clients
- PDF output is the primary deliverable — it must look premium when the firm sends it to their own client

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)
(None — no todos were reviewed in this phase)

### Scope Creep Redirected
- Multi-language support (English toggle) → deferred to future phase, Arabic-only MVP
- Interior renders → deferred to v2, explicitly out of scope per PROJECT.md
- Per-folder team access control → not in scope, all team members see all projects

</deferred>

---

*Phase: 01-saas-foundation-arabic-ui*
*Context gathered: 2026-03-29*

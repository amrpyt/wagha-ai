# Phase 1: SaaS Foundation & Arabic UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 01-saas-foundation-arabic-ui
**Areas discussed:** Database, Hosting, Auth, Stripe Pricing (trial, billing model, tiers, pricing in EGP), Dashboard Layout, Team Access

---

## Database

| Option | Description | Selected |
|--------|-------------|----------|
| PostgreSQL (Recommended) | Production-grade, row-level security for multi-tenant | ✓ |
| SQLite | MVP simplicity, zero cost | |

**User's choice:** PostgreSQL via Supabase

---

## Hosting

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel + Neon (Recommended) | Vercel for Next.js, Neon for PostgreSQL | |
| Railway | Full-stack hosting | |
| Render + Supabase | Render + Supabase PostgreSQL+Auth | ✓ |

**User's choice:** Vercel + Supabase

---

## Authentication

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase Auth (Recommended) | Built into Supabase, email/password, magic links, verification | ✓ |
| Clerk | Premium auth service, pre-built components, Arabic support | |

**User's choice:** Supabase Auth

---

## Trial Model

| Option | Description | Selected |
|--------|-------------|----------|
| Time-based (7/14/30 days) | Standard SaaS trial | |
| 1 render total (lead gen) | One free render, no time limit | ✓ |

**User's choice:** 1 free render total (lead generation) — not time-based

---

## Billing Model

| Option | Description | Selected |
|--------|-------------|----------|
| Credit-based (Recommended) | Subscription = monthly credits, like mnml.ai | ✓ |
| Unlimited renders | Flat fee = unlimited renders | |

**User's choice:** Credit-based (like mnml.ai)

---

## Credit Rollover

| Option | Description | Selected |
|--------|-------------|----------|
| No rollover (Recommended) | Credits reset each month | ✓ |
| Yes rollover | Unused credits carry forward | |

**User's choice:** No rollover

---

## Credits Per Render

| Option | Description | Selected |
|--------|-------------|----------|
| 1 credit = 1 render | Simple | ✓ |
| 10 credits = 1 render | Like mnml.ai main tools | |

**User's choice:** 1 credit = 1 render

---

## Plan Tiers

| Option | Description | Selected |
|--------|-------------|----------|
| Single plan | One tier, simple | |
| 2-3 tiers | Starter/Business/Pro with increasing credits | ✓ |

**User's choice:** 2-3 tiers (Starter/Business/Pro)

---

## Tier Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Starter/Business/Pro | Starter (10), Business (30), Pro (100) | ✓ |
| Basic/Professional | Basic (20), Professional (60) | |

**User's choice:** Starter/Business/Pro

---

## Pricing (USD/EGP)

| Option | Description | Selected |
|--------|-------------|----------|
| $19/$49/$99 (USD) | Not appropriate for Egypt market | |
| Custom EGP amounts | 250/750/2000 EGP — 87% margin | ✓ |

**User's choice:** Custom EGP amounts: 250/750/2000 EGP
**Note:** User emphasized: (1) Egypt market pricing awareness, (2) NB2 API cost must be factored in, (3) want maximum margin
**Final pricing:**
- Starter: 250 EGP/mo → 10 renders → ~87% margin
- Business: 750 EGP/mo → 30 renders → ~87% margin
- Pro: 2,000 EGP/mo → 100 renders → ~83% margin

---

## Resolution

| Option | Description | Selected |
|--------|-------------|----------|
| 1K (1024px) | Lower cost, web/email quality | ✓ |
| 2K (2048px) | Higher cost, print quality | |

**User's choice:** 1K — cost efficiency priority

---

## Dashboard Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Simple list | Single list, newest first, familiar | |
| Grid with thumbnails | Visual grid, more screen space | |
| Folder-based | Firms create folders to organize projects | ✓ |

**User's choice:** Folder-based project organization

---

## Team Access Control

| Option | Description | Selected |
|--------|-------------|----------|
| All see all (Recommended) | All team members see all projects and folders | ✓ |
| Per-folder access control | Admins can restrict folders to specific members | |

**User's choice:** All team members see all projects and folders

---

## Deferred Ideas

- Per-folder access control → deferred to future (all see all for MVP)
- Interior renders → explicitly out of scope per PROJECT.md
- English toggle / bilingual UI → Arabic-only MVP

---

## Billing Method

| Option | Description | Selected |
|--------|-------------|----------|
| Stripe | Standard SaaS billing (not available in Egypt) | |
| Paymob | Egyptian payment gateway | ✓ |

**User's choice:** Paymob
**Note:** Stripe does not work in Egypt — Paymob is the standard alternative

---

*Logged: 2026-03-29*
*Updated: 2026-03-29 — Paymob replaces Stripe (not available in Egypt)*

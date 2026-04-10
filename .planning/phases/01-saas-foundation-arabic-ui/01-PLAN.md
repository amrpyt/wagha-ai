# Phase 1: SaaS Foundation & Arabic UI - Master Plan

## Consolidated Phase Plan

**Phase:** 01-saas-foundation-arabic-ui
**Status:** Planned
**Wave Structure:** 5 plans across 2 waves

---

## Wave Structure

| Wave | Plans | Depends On | Autonomous | Key Deliverables |
|------|-------|-----------|-----------|------------------|
| 1 | 01-01 (Foundation) | None | Yes | Next.js + RTL + Noor-UI + Supabase clients + DB schema with RLS |
| 2 | 01-02 (Auth) | 01-01 | Yes | Signup, Login, Email Verification, Password Reset, Logout |
| 2 | 01-03 (Dashboard) | 01-01 | Yes | Sidebar layout, Project grid, Project detail, Delete |
| 2 | 01-04 (Settings) | 01-01 | Yes | Account settings, Firm settings, Team invites |
| 2 | 01-05 (Billing) | 01-01 | Yes | Pricing page, Paymob checkout, Webhooks, Billing settings |

---

## Requirements Coverage

| Requirement | Plan | Task |
|-------------|------|------|
| **AUTH-01** (Firm signup) | 01-02 | signUp action + signup page |
| **AUTH-02** (Email verification) | 01-02 | verifyEmail action + callback route |
| **AUTH-03** (Login persistence) | 01-02 | signIn action + Supabase session |
| **AUTH-04** (Password reset) | 01-02 | resetPassword action + page |
| **AUTH-05** (Team invites) | 01-04 | inviteTeamMember + TeamInviteForm |
| **AUTH-06** (Data isolation) | 01-01 | RLS policies on all tables |
| **AUTH-07** (Logout) | 01-02 | signOut action + LogoutButton |
| **BILL-01** (Pricing page) | 01-05 | PricingPage with plan cards |
| **BILL-02** (Free trial) | 01-05 | checkRenderAccess - free render on signup |
| **BILL-03** (Paymob checkout) | 01-05 | createPaymobOrder + webhook |
| **BILL-04** (Full access) | 01-05 | checkRenderAccess - active sub check |
| **BILL-05** (Upgrade prompt) | 01-05 | checkRenderAccess - returns upgrade_required |
| **BILL-06** (Billing settings) | 01-05 | BillingSettingsPage |
| **BILL-07** (Cancel) | 01-05 | cancelSubscription action |
| **DASH-01** (Project list) | 01-03 | DashboardPage + ProjectGrid |
| **DASH-02** (View project) | 01-03 | ProjectDetailPage |
| **DASH-03** (Delete project) | 01-03 | DeleteProjectModal |
| **DASH-04** (Firm settings) | 01-04 | FirmSettingsForm + page |
| **DASH-05** (Account settings) | 01-04 | AccountSettingsForm + page |
| **UI-01** (Arabic RTL) | All | dir="rtl" throughout |
| **UI-02** (Western numerals) | 01-03 | Intl.DateTimeFormat with ar-EG |
| **UI-03** (Noto Sans Arabic) | 01-01 | Google Fonts import |
| **UI-04** (Drag-drop feedback) | 01-03 | Placeholder (real upload in Phase 2) |
| **UI-05** (Hover states) | 01-03 | Noor-UI component states |
| **UI-06** (Noor-UI) | All | noorui-rtl throughout |

---

## Sub-Plans

1. [01-01-PLAN.md](01-01-PLAN.md) - Foundation & Infrastructure
2. [01-02-PLAN.md](01-02-PLAN.md) - Authentication Flows
3. [01-03-PLAN.md](01-03-PLAN.md) - Dashboard & Projects
4. [01-04-PLAN.md](01-04-PLAN.md) - Settings & Team
5. [01-05-PLAN.md](01-05-PLAN.md) - Billing & Pricing

---

## Key Architectural Decisions

### Database Schema (supabase/schema.sql)
- **firms**: Core organization table with owner_id, brand_color, free_render_used
- **firm_members**: Team membership with role (admin/member)
- **folders**: Project organization
- **projects**: Render projects with status tracking
- **subscriptions**: Credit-based subscriptions with plan, credits_remaining, status
- **invitations**: Team invite tokens with email + role

### RLS Policies
All tables have RLS enabled with policies that check `auth.uid()` against `user_id` or through `firm_members` join. This ensures firm data isolation at the database level.

### Supabase Auth Flow
- `@supabase/ssr` package for cookie-based PKCE auth
- `getUser()` (not `getSession()`) in server code for JWT verification
- Middleware protects /dashboard, /settings, /projects routes
- Cache-Control: private, no-store on auth responses

### Paymob Integration
- Token-based checkout (not Stripe-style checkout sessions)
- Webhook-driven subscription lifecycle
- Idempotent webhook handler with duplicate check
- Credit-based subscription model (not metered billing)

### RTL Implementation
- `dir="rtl"` on `<html>` element
- Noor-UI DirectionProvider wrapping all content
- Tailwind `rtl:` modifier for directional styles
- Logical properties (ms-*/me-*) preferred over hardcoded ml-*/mr-*

---

## Execution Order

**Step 1:** Execute `/gsd:execute-phase 01-saas-foundation-arabic-ui --plans 01-01`
**Wait for:** Plan 01 completes successfully (Wave 1 blocks all others)

**Step 2:** Execute `/gsd:execute-phase 01-saas-foundation-arabic-ui --plans 01-02, 01-03, 01-04, 01-05`
**These run:** In parallel once Wave 1 is complete

---

## Success Criteria for Phase 1

1. Firm can sign up with email/password and receive email verification
2. User can log in and stay logged in across sessions
3. User can reset password via email link
4. Firm admin can invite team members by email
5. Each firm sees only their own data (RLS enforced)
6. User can log out from any page
7. Pricing page shows all three plans in EGP
8. Free render works on first signup
9. Paymob checkout initiates subscription
10. Firm can view and cancel subscription in settings
11. Dashboard shows all firm projects
12. User can view, and delete projects
13. Firm settings: name, logo, brand color
14. Account settings: name, email, password change
15. Full Arabic RTL UI with Noor-UI components

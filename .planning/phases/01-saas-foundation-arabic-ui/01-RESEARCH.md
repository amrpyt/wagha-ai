# Phase 1: SaaS Foundation & Arabic UI - Research

**Researched:** 2026-03-29
**Domain:** Multi-tenant SaaS infrastructure - auth, subscriptions, billing, Arabic RTL UI
**Confidence:** MEDIUM

## Summary

Phase 1 requires building the multi-tenant SaaS foundation for Wagha-ai: Supabase Auth with email verification and team invites, Supabase PostgreSQL with row-level security for firm data isolation, Paymob subscription billing (credit-based), and a full Arabic RTL UI using Noor-UI RTL components with Tailwind CSS v4. The core challenge is integrating these components correctly from day one since retrofitting multi-tenancy later is expensive.

**Primary recommendation:** Use `@supabase/ssr` package with cookie-based PKCE auth flow in Next.js middleware. Set `dir="rtl"` on the `<html>` element and use Noor-UI's pre-compiled CSS + DirectionProvider. Paymob subscription integration requires a webhook-driven model since Paymob uses tokenization (not Stripe-style checkout sessions).

**Note on billing discrepancy:** REQUIREMENTS.md BILL-03 says "Stripe checkout" but 01-CONTEXT.md D-25 locks Paymob as the payment gateway (Egypt market). Paymob is the authoritative decision.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions
- PostgreSQL via Supabase (row-level security for multi-tenant)
- Vercel + Supabase hosting
- Supabase Auth (email/password, magic links, email verification)
- Next.js 16 + React 19, TypeScript, Tailwind CSS v4
- Noor-UI RTL component library (78 free components)
- Paymob payment gateway (not Stripe - Egypt market)
- Credit-based subscription: Starter 250EGP/10renders, Business 750EGP/30renders, Pro 2000EGP/100renders
- Folder-based project organization, all team members see all
- 1 free render total (lead-gen)
- pdfmake-rtl for Arabic PDF generation (NOT @react-pdf/renderer)
- Noor-UI RTL component library for standard UI elements

### Claude's Discretion
- Folder naming conventions — planner decides
- Exact dashboard layout/visual hierarchy — planner decides
- How the free render prompt works — planner decides
- Email templates for verification, invites, etc. — planner decides

### Deferred Ideas (OUT OF SCOPE)
- Multi-language support (English toggle) → Arabic-only MVP
- Interior renders → v2
- Per-folder team access control → all team members see all projects
- Stripe → Paymob is locked (Egypt market)

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Firm can sign up with email and password | Supabase Auth email/password via @supabase/ssr |
| AUTH-02 | User receives email verification after signup | Supabase Auth email verification (built-in) |
| AUTH-03 | User can log in and stay logged in across sessions | Cookie-based session via @supabase/ssr with PKCE flow |
| AUTH-04 | User can reset password via email link | Supabase Auth password reset (built-in) |
| AUTH-05 | Firm admins can invite team members by email | Custom invite flow via auth.admin.inviteUserByEmail + invitations table |
| AUTH-06 | Each firm has isolated data — cannot see other firms' projects | Supabase PostgreSQL RLS policies on all tables |
| AUTH-07 | User can log out from any page | Supabase Auth logout clears session and cookies |
| BILL-01 | Firm sees pricing plans (monthly / annual) | Static pricing page with Paymob plan IDs |
| BILL-02 | Firm can start a free trial without entering payment info | 1 free render on signup (not time-based trial) |
| BILL-03 | Firm can subscribe to a plan via Stripe checkout | **NOTE: D-25 locks Paymob, not Stripe.** Paymob tokenization API |
| BILL-04 | Subscribed firms can access full rendering features | Credit check in render Server Action |
| BILL-05 | Trial expired firms are blocked from rendering | Credit counter check + upgrade prompt |
| BILL-06 | Firm can view and manage billing in account settings | Paymob billing portal or custom billing settings page |
| BILL-07 | Firm can cancel subscription | Paymob cancellation API + webhook to update DB |
| DASH-01 | Firm dashboard shows all past projects | Supabase query filtered by firm_id (RLS enforced) |
| DASH-02 | User can view past project and re-download render or PDF | Signed URL from Supabase Storage |
| DASH-03 | User can delete a project from history | DELETE action on projects table (RLS enforced) |
| DASH-04 | Firm settings: firm name, logo upload, primary brand color | Firm settings form, logo stored in Supabase Storage |
| DASH-05 | Account settings: user name, email, password change | Supabase Auth updateUser + profile form |
| UI-01 | Entire UI is in Arabic with right-to-left layout | dir="rtl" + rtl: modifier throughout |
| UI-02 | Numbers display as Western Arabic numerals (0-9) | Noto Sans Arabic + explicit numeral styling |
| UI-03 | Professional Arabic font used throughout | Noto Sans Arabic via Google Fonts |
| UI-04 | Drag-and-drop upload area has clear visual feedback | react-dropzone with Noor-UI styling |
| UI-05 | All interactive elements have clear hover/active states | Noor-UI component states |
| UI-06 | Noor-UI RTL component library used for standard UI elements | noorui-rtl npm package with DirectionProvider |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.x | Full-stack framework | App Router + Server Actions; auto-opt-out of Node packages |
| react | 19.2.x | UI library | useActionState, use() hook for async |
| typescript | 5.x | Type safety | Required for Supabase and API contracts |
| @supabase/ssr | beta | Auth SSR helper | Cookie-based PKCE flow for Next.js |
| @supabase/supabase-js | 2.x | Supabase client | Database and auth |
| tailwindcss | 4.x | CSS framework | rtl: modifier for RTL; v4 @tailwindcss/postcss |
| @tailwindcss/postcss | 4.x | PostCSS plugin | Official v4 approach for Next.js |

**Installation:**
```bash
npm install next@16 react@19 react-dom@19
npm install -D typescript @types/react @types/node
npm install tailwindcss@4 @tailwindcss/postcss postcss
npm install @supabase/supabase-js @supabase/ssr
npm install react-dropzone noorui-rtl next-themes
npm install pdfmake-rtl
npm install @fontsource/noto-sans-arabic
```

**Version verification (2026-03-29):**
```bash
npm view next version        # 16.2.x - verify current
npm view @supabase/ssr version  # beta - verify before use
npm view tailwindcss version    # 4.x
npm view noorui-rtl version     # verify current
npm view pdfmake-rtl version    # verify current
```

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | latest | Dark/light mode | Used by Noor-UI ThemeProvider |
| @fontsource/noto-sans-arabic | latest | Arabic font | Font loading without Google Fonts CDN |
| react-dropzone | 15.x | Drag-and-drop uploads | UPLOAD-01, UPLOAD-02 |
| pdfmake-rtl | latest | Arabic RTL PDF generation | PDF-01 through PDF-07 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/ssr | @supabase/auth-helpers-nextjs | SSR is the current recommended package; helpers-nextjs is deprecated |
| pdfmake-rtl | @react-pdf/renderer | CONTEXT.md D-10 explicitly locks pdfmake-rtl for Arabic support |
| noorui-rtl | shadcn/ui + arabic extensions | User locked to Noor-UI via D-05 |

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth group: login, signup, reset-password
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/         # Protected dashboard group
│   │   ├── layout.tsx       # Sidebar + topbar layout
│   │   ├── page.tsx         # Main dashboard (projects list)
│   │   ├── projects/
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   └── settings/
│   │       ├── page.tsx     # Account settings
│   │       ├── firm/page.tsx
│   │       └── billing/page.tsx
│   ├── api/
│   │   └── webhooks/
│   │       └── paymob/route.ts  # Paymob webhook handler
│   ├── layout.tsx           # Root layout with html dir="rtl"
│   └── globals.css
├── components/
│   ├── ui/                  # Noor-UI components (Button, Input, Card, etc.)
│   ├── auth/                # Auth-specific components
│   ├── dashboard/          # Dashboard-specific components
│   └── pdf/                # PDF generation components
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client (singleton)
│   │   ├── server.ts       # Server client (per-request)
│   │   └── middleware.ts   # Auth middleware
│   ├── paymob/
│   │   └── client.ts       # Paymob API client
│   └── pdf/
│       └── generator.ts     # pdfmake-rtl wrapper
├── types/
│   └── database.types.ts   # Supabase generated types
└── middleware.ts           # Next.js middleware for auth routes
```

### Pattern 1: Supabase Auth SSR with @supabase/ssr

**What:** Cookie-based PKCE authentication flow using `@supabase/ssr` package for Next.js App Router.

**When to use:** Every auth operation (login, signup, logout, session refresh).

**Example - Browser Client (lib/supabase/client.ts):**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Example - Server Client (lib/supabase/server.ts):**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}
```

**Example - Next.js Middleware (middleware.ts):**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate session on protected routes
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  supabaseResponse.headers.set('Cache-Control', 'private, no-store')

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/projects/:path*'],
}
```

**Source:** Supabase docs - Server-Side Rendering guide

### Pattern 2: Supabase PostgreSQL Row-Level Security for Multi-Tenant Isolation

**What:** RLS policies on all tables matching `auth.uid()` against `user_id` or `team_id` columns.

**When to use:** Every table that stores firm or user data.

**Database Schema Pattern:**
```sql
-- Firms table
create table firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  brand_color text default '#1E3A5F',
  owner_id uuid references auth.users not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table firms enable row level security;

-- Policy: users can only see their own firm
create policy "Users can view their own firm"
on firms for select
to authenticated
using ( owner_id = (select auth.uid()) );

-- Users/FirmMembers table (for team invites)
create table firm_members (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references firms not null,
  user_id uuid references auth.users not null,
  role text default 'member', -- 'admin' or 'member'
  created_at timestamptz default now(),
  unique(firm_id, user_id)
);

alter table firm_members enable row level security;

create policy "Members can view their firm"
on firm_members for select
to authenticated
using ( user_id = (select auth.uid()) );

-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references firms not null,
  name text not null,
  project_number text,
  folder_id uuid references folders,
  status text default 'pending', -- pending, processing, complete, failed
  render_url text,
  pdf_url text,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

alter table projects enable row level security;

create policy "Firm members can view firm projects"
on projects for select
to authenticated
using (
  exists (
    select 1 from firm_members
    where firm_id = projects.firm_id
    and user_id = (select auth.uid())
  )
);

create policy "Firm members can insert projects"
on projects for insert
to authenticated
with check (
  exists (
    select 1 from firm_members
    where firm_id = projects.firm_id
    and user_id = (select auth.uid())
  )
);

create policy "Firm members can delete projects"
on projects for delete
to authenticated
using (
  exists (
    select 1 from firm_members
    where firm_id = projects.firm_id
    and user_id = (select auth.uid())
  )
);
```

**Critical best practices:**
- Always include `TO` clause specifying `authenticated` role
- Wrap function calls in `(select ...)` for performance
- Index columns referenced in policies
- For complex joins, use `security definer` functions to bypass RLS

**Source:** Supabase - Row-Level Security docs

### Pattern 3: Team Invite Flow with Supabase Auth Admin API

**What:** Custom invite system since Supabase does not have built-in organization/team invites.

**When to use:** AUTH-05 (firm admins invite team members).

**Implementation:**
```typescript
// 1. Create invitations table
// 2. Admin sends invite via auth.admin.inviteUserByEmail
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Never expose to client
)

// In invite Server Action:
const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
  data: { firm_id: firm.id, role: 'member' },
  // Redirect after signup (custom URL or app deep link)
})

// 3. When invitee clicks link and signs up,
//    use auth.jwt() -> app_metadata to get firm_id and role
```

**Note:** `inviteUserByEmail` sets `app_metadata.firms` automatically. You must manually sync to `firm_members` table on signup using a database trigger.

**Source:** Supabase - Auth Admin API docs

### Pattern 4: Noor-UI RTL Setup with Next.js

**What:** Install and configure noorui-rtl with DirectionProvider for full RTL support.

**When to use:** Every page (root layout setup).

**Example - Root Layout (app/layout.tsx):**
```tsx
import 'noorui-rtl/dist/styles.css'
import { ThemeProvider } from 'next-themes'
import { DirectionProvider, DesignSystemProvider } from 'noorui-rtl'

export default function RootLayout({ children }) {
  return (
    <html dir="rtl" lang="ar">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" enableSystem={true}>
          <DirectionProvider dir="rtl" locale="ar">
            <DesignSystemProvider defaultTheme="cozy">
              {children}
            </DesignSystemProvider>
          </DirectionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Using Noor-UI Components:**
```tsx
import { Button, Input, Card, Badge } from 'noorui-rtl'

// All components auto-handle RTL when wrapped with DirectionProvider
```

**Source:** Noor-UI GitHub (ositaka/noor-ui) + npm (noorui-rtl)

### Pattern 5: Credit-Based Subscription with Paymob

**What:** Track credits in Supabase, deduct on render, integrate with Paymob for billing.

**When to use:** BILL-01 through BILL-07.

**Credits Table:**
```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references firms not null,
  plan text not null, -- 'starter', 'business', 'pro'
  paymob_subscription_id text,
  credits_remaining integer not null default 0,
  billing_cycle_start timestamptz default now(),
  status text default 'active', -- 'active', 'cancelled', 'past_due'
  created_at timestamptz default now()
);
```

**Credit Check Middleware (in render Server Action):**
```typescript
async function checkAndDeductCredit(firmId: string): Promise<boolean> {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('credits_remaining, status')
    .eq('firm_id', firmId)
    .single()

  if (!sub || sub.status !== 'active' || sub.credits_remaining <= 0) {
    return false // Show upgrade prompt
  }

  // Deduct credit
  await supabase
    .from('subscriptions')
    .update({ credits_remaining: sub.credits_remaining - 1 })
    .eq('firm_id', firmId)

  return true
}
```

**Paymob Integration Flow:**
1. User selects plan on pricing page
2. Server creates Paymob order (one-time or subscription registration)
3. User redirected to Paymob iframe/payment page
4. On success, Paymob webhook fires to `/api/webhooks/paymob`
5. Webhook handler creates/updates subscription record in Supabase
6. User redirected to dashboard

**Source:** Paymob subscriptions docs (marketing + developer portal)

### Pattern 6: Tailwind CSS v4 RTL Setup

**What:** Configure Tailwind v4 with @tailwindcss/postcss and use rtl: modifier throughout.

**When to use:** Every component and layout file.

**Setup - postcss.config.mjs:**
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
export default config
```

**Setup - app/globals.css:**
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

**RTL Usage in Components:**
```tsx
// Every directional style must use rtl: modifier
<div className="flex rtl:flex-row-reverse gap-4">
  <button className="rtl:me-4 rtl:ms-0">Back</button>
  <button className="rtl:me-0 rtl:ms-4">Next</button>
</div>

// Text alignment
<h1 className="rtl:text-right text-2xl font-semibold">

// Margin/padding
<div className="rtl:me-6 rtl:pe-6">

// Use logical properties (ms-* = margin-start, me-* = margin-end)
<div className="ms-4 me-4">
```

**Key rule:** Test every component in RTL mode. The `rtl:` modifier flips the meaning of directional utilities.

**Source:** Tailwind CSS v4 docs (2026-03)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth session management | Custom JWT handling + localStorage | @supabase/ssr package | PKCE flow, cookie security, token refresh all handled correctly |
| Multi-tenant data isolation | Application-level filtering | PostgreSQL RLS policies | RLS is enforced at the database layer - cannot be bypassed by application bugs |
| RTL layout utilities | Custom CSS classes | Tailwind rtl: modifier + Noor-UI | Built, tested, accessible RTL components |
| PDF RTL layout | Custom PDF generation | pdfmake-rtl | Explicitly locked by D-10; handles Arabic text flow, table reversal, bullets |
| Credit tracking | Manual counter in application code | Database column + atomic updates | Prevents race conditions from concurrent renders |

**Key insight:** Multi-tenant security must be database-enforced, not application-enforced. RLS policies are the only correct approach for firm data isolation.

---

## Common Pitfalls

### Pitfall 1: Spoofed Session in Server Code
**What goes wrong:** Middleware uses `getSession()` which only reads cookies locally - it does not validate the JWT signature. Attackers can spoof cookies.
**Why it happens:** `getSession()` is intended for client-side; it trusts cookies without server-side verification.
**How to avoid:** Always use `getUser()` or `getClaims()` in server-side code to verify JWT signatures against Supabase public keys.
**Warning signs:** Server routes accessible without valid tokens; auth state not propagating correctly.

### Pitfall 2: RLS Policy Missing FROM Clause or TO Clause
**What goes wrong:** Policies without explicit `TO authenticated` or with broken USING expressions silently fail - all rows appear invisible.
**Why it happens:** Supabase RLS is permissive by default for auth users when no policy matches.
**How to avoid:** Always include `TO authenticated` in every policy. Test each policy manually with `auth.uid()` values.
**Warning signs:** Empty query results even when data exists; "no rows" in dashboard.

### Pitfall 3: Middleware Cache-Control Missing
**What goes wrong:** CDN or Vercel Edge caches responses with Set-Cookie headers, causing session leaks between users.
**Why it happens:** Default cache headers allow public caching of pages with auth cookies.
**How to avoid:** Set `Cache-Control: private, no-store` on all auth-related responses.
**Warning signs:** Users seeing other users' sessions; random auth state changes.

### Pitfall 4: Supabase Admin Key Exposed to Client
**What goes wrong:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is in client bundle; `SUPABASE_SERVICE_ROLE_KEY` must never be.
**Why it happens:** `NEXT_PUBLIC_` prefix bundles the value into client-side JavaScript.
**How to avoid:** Service role key only in server-side code (Route Handlers, Server Actions). Never pass it to `createBrowserClient`.
**Warning signs:** Service role key appears in network tab or client bundle.

### Pitfall 5: Credit Race Condition on Concurrent Renders
**What goes wrong:** Two renders started simultaneously both read credits_remaining=1, both deduct, resulting in -1 credits.
**Why it happens:** Non-atomic read-then-update pattern.
**How to avoid:** Use database functions with `FOR UPDATE` or atomic update with a check: `update(...).eq('credits_remaining', sub.credits_remaining)`.
**Warning signs:** Credits going negative; more renders than purchased.

### Pitfall 6: Paymob Webhook Not Idempotent
**What goes wrong:** Paymob retries webhook delivery; non-idempotent handlers apply subscription changes multiple times.
**Why it happens:** Network retries + Paymob's at-least-once delivery semantics.
**How to avoid:** Check if subscription already exists before creating; use `ON CONFLICT DO UPDATE` pattern.
**Warning signs:** Duplicate subscription records; credits granted multiple times.

---

## Code Examples

### Auth Flow - Login Server Action
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
```

### Credit Check Before Render
```typescript
'use server'

export async function renderProject(projectId: string, imageData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get firm subscription
  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id, role')
    .eq('user_id', user.id)
    .single()

  if (!firmMember) return { error: 'Not a firm member' }

  // Check credits (atomic)
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('credits_remaining, status')
    .eq('firm_id', firmMember.firm_id)
    .eq('status', 'active')
    .single()

  const freeRenderUsed = await checkFreeRenderUsed(firmMember.firm_id)

  if (!freeRenderUsed) {
    await markFreeRenderUsed(firmMember.firm_id)
    // Allow free render
  } else if (!sub || sub.credits_remaining <= 0) {
    return { error: 'upgrade_required', message: 'لا توجد رصيد متبقي' }
  } else {
    // Deduct credit atomically
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ credits_remaining: sub.credits_remaining - 1 })
      .eq('firm_id', firmMember.firm_id)
      .eq('credits_remaining', sub.credits_remaining) // Atomic check

    if (updateError) {
      return { error: 'concurrent_render', message: 'حاول مرة أخرى' }
    }
  }

  // Proceed with render...
}
```

### RLS-Compliant Project Query
```typescript
'use server'

export async function getProjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // RLS automatically filters - user only sees their firm's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*, folders(name)')
    .order('created_at', { ascending: false })

  return projects
}
```

### Paymob Webhook Handler
```typescript
// app/api/webhooks/paymob/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const hmac = req.headers.get('hmac')

  // Verify Paymob HMAC signature
  // ...

  const { type, data } = payload

  switch (type) {
    case 'TRANSACTION_CREATED':
      // Handle successful payment
      await handleSuccessfulPayment(data)
      break
    case 'SUBSCRIPTION_CREATED':
      await handleSubscriptionCreated(data)
      break
    case 'SUBSCRIPTION_CANCELLED':
      await handleSubscriptionCancelled(data)
      break
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionCreated(data: PaymobSubscriptionData) {
  const supabase = await createClient()

  // Idempotent: check if already exists
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('paymob_subscription_id', data.subscription_id)
    .single()

  if (existing) return // Already processed

  // Parse plan from Paymob data and create subscription
  const plan = parsePlanFromPaymob(data.plan_id)
  const credits = getPlanCredits(plan)

  await supabase.from('subscriptions').insert({
    firm_id: data.firm_id,
    plan,
    paymob_subscription_id: data.subscription_id,
    credits_remaining: credits,
    billing_cycle_start: new Date().toISOString(),
    status: 'active',
  })
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| localStorage for auth tokens | Cookie-based via @supabase/ssr | 2024+ | Secure; works with SSR; CDN-safe |
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 | Better cookie handling; PKCE flow |
| App-level tenant filtering | PostgreSQL RLS | 2019+ (Supabase) | Database-enforced isolation |
| Stripe checkout | Paymob tokenization | Egypt market | Stripe unavailable in Egypt |
| CSS Modules with manual RTL | Tailwind rtl: modifier + Noor-UI | 2024+ | Consistent; maintainable RTL |
| PDFKit for Arabic | pdfmake-rtl | Project decision | Better Arabic RTL support |
| @react-pdf/renderer | pdfmake-rtl | D-10 locked | Arabic support confirmed |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated in favor of `@supabase/ssr`
- `@react-pdf/renderer`: Arabic support issues; replaced by pdfmake-rtl per D-10
- CSS Modules for RTL: Replaced by Tailwind rtl: modifier

---

## Open Questions

1. **Paymob subscription API specifics**
   - What we know: Paymob supports subscriptions via tokenization; customers save card details once; recurring charges via token
   - What's unclear: Exact API endpoints for subscription creation, plan IDs, webhook event names, billing portal URL
   - Recommendation: Contact Paymob integration support; test with sandbox credentials before Phase 1 planning

2. **Noor-UI font conflict with Noto Sans Arabic**
   - What we know: Noor-UI uses IBM Plex Sans Arabic as --font-arabic; Noto Sans Arabic is the project standard
   - What's unclear: Whether Noor-UI's CSS variable can be overridden without breaking components
   - Recommendation: Test both fonts in a spike; if conflict, override `--font-arabic` CSS variable in globals.css

3. **Free render tracking mechanism**
   - What we know: 1 free render per firm, lead-gen offer
   - What's unclear: Is free render tracked in `subscriptions` table or a separate flag on `firms` table?
   - Recommendation: Add `free_render_used boolean default false` to `firms` table; simpler and always tied to firm

4. **Annual billing toggle (BILL-01)**
   - What we know: UI spec shows monthly/annual toggle
   - What's unclear: Does Paymob support annual subscription cycles? Are there multi-month plans?
   - Recommendation: Confirm with Paymob before implementing annual toggle; may need to use monthly + calculate discount

5. **Billing portal URL**
   - What we know: BILL-06 says "view and manage billing in account settings"; BILL-07 "cancel subscription"
   - What's unclear: Does Paymob provide a hosted billing portal (like Stripe's /customer_portal) or must we build custom?
   - Recommendation: Check Paymob's billing portal offering; if none, build minimal settings page with cancel button calling Paymob API

---

## Environment Availability

> Step 2.6: SKIPPED (no external dependencies identified beyond npm packages)

Phase 1 is primarily a configuration and setup phase. All dependencies are installed via npm. The external services (Supabase, Paymob) are accessed via API keys configured in environment variables.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Supabase | Database + Auth | API key required | - | - |
| Paymob | Billing | API key required | - | - |
| Node.js 18+ | Next.js | Should verify | - | Upgrade Node |
| npm | Package install | Should verify | - | Install npm |

**Note:** No external tools need to be pre-installed on the machine. All dependencies are managed via `npm install` in the project directory.

---

## Sources

### Primary (HIGH confidence)
- Supabase docs - Server-Side Rendering: @supabase/ssr package, PKCE flow, cookie management
- Supabase docs - Row-Level Security: RLS policies, auth.uid(), multi-tenant patterns
- Supabase docs - Sessions: Token refresh, logout, multi-session
- Tailwind CSS v4 docs - Next.js + PostCSS setup: @tailwindcss/postcss, @import "tailwindcss"
- Noor-UI GitHub (ositaka/noor-ui) + npm (noorui-rtl): Installation, DirectionProvider, DesignSystemProvider
- pdfmake-rtl GitHub (aysnet1/pdfmake-rtl): Arabic RTL support, Cairo font, Node.js usage

### Secondary (MEDIUM confidence)
- Supabase docs - Auth: Email/password, magic links, invites (partial)
- Paymob marketing - Subscriptions: Tokenization, recurring payments (overview only)
- Supabase blog/SRS docs - Multi-tenant patterns (inferred from RLS docs)

### Tertiary (LOW confidence - requires validation)
- Paymob developer API: Specific webhook events, subscription API endpoints (URLs returned 404 SPA; needs direct API docs access)
- Supabase inviteUserByEmail: Exact API signature (URL returned 404; needs docs access)
- Credit-based subscription patterns: General SaaS patterns (not Supabase-specific)

---

## Metadata

**Confidence breakdown:**
- Standard Stack: MEDIUM - npm packages verified, but specific versions (especially @supabase/ssr beta) need confirmation
- Supabase Auth SSR: HIGH - Well-documented official patterns
- RLS Policies: HIGH - Standard Supabase patterns verified
- Noor-UI: MEDIUM - npm package confirmed, some docs URLs returned SPA-rendered content
- Paymob Billing: LOW - Marketing docs accessible, developer API returned 404 (SPA); requires direct API access
- RTL/Tailwind v4: HIGH - Official docs accessible and verified

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (30 days for stable patterns; Paymob API may need re-validation sooner)

---
name: Supabase Typed Client Setup
description: How to generate TypeScript types from a live Supabase DB and wire them into all Supabase clients to catch column mismatches at compile time
type: reference
tags: [supabase, typescript, database, bug-prevention]
created: 2026-04-10
---

## Problem

Supabase JavaScript client was using **untyped** clients (`createClient` without a `<Database>` generic). This meant:

- Typing `project.input_url` — a column that doesn't exist — produces **no TypeScript error**
- Supabase silently rejects the unknown column at **runtime** → 500 error with no helpful message
- Bug: `input_url` (singular) was inserted but DB column is `input_urls` (TEXT[] array)

## Solution

### 1. Generate types from live DB

Use the Supabase MCP tool (no CLI needed):

```ts
// Via MCP - no install needed:
mcp__plugin_supabase_supabase__generate_typescript_types({ project_id: "YOUR_REF" })
```

Output → paste into `src/lib/supabase/database.types.ts`.

### 2. Wire Database generic into all 4 Supabase clients

```ts
// client.ts (browser)
import type { Database } from './database.types'
export function createClient() {
  return createBrowserClient<Database>(URL, KEY)
}

// server.ts (SSR)
return createServerClient<Database>(URL, KEY, { cookies: ... })

// admin.ts (service role)
return createClient<Database>(URL, SERVICE_ROLE_KEY)

// middleware.ts
const supabase = createServerClient<Database>(URL, ANON_KEY, { cookies: ... })
```

### 3. Supabase RLS causes `never` type inference

When Supabase RLS policies restrict access, TypeScript infers `never` for query results — even when the query is correct. Fix with explicit type casts:

```ts
type FirmMemberRow = Database['public']['Tables']['firm_members']['Row']
const { data } = await supabase
  .from('firm_members')
  .select('firm_id')
  .eq('user_id', user.id)
  .single() as { data: FirmMemberRow | null }
```

### 4. DB column name changes must be reflected in code

When migration adds `input_urls TEXT[]` but code inserts `input_url` → silent runtime rejection. The typed client would have caught this.

## Root Cause

No CI step regenerates types from DB schema after migrations. The local `schema.sql` and live Supabase DB can drift.

## Prevention

1. **After every migration**: regenerate `database.types.ts` via MCP or `supabase gen types typescript`
2. **On new Supabase project**: set up typed clients as first step
3. **CI check**: `npx tsc --noEmit` should pass before merging

# Phase 03: Platform Redesign - Research

**Researched:** 2026-04-10
**Domain:** Next.js App Router multi-page app architecture, Gemini img2img rendering, parallel API calls, selective editing
**Confidence:** HIGH (based on verified codebase + official API docs)

## Summary

Phase 03 transforms the single `/dashboard/projects/new` page into a **mini-apps hub** with three dedicated apps. Each app gets its own route (`/apps/2d-to-3d`, `/apps/interior`, `/apps/suggestions`), its own LeftPanel variant with app-specific options, and shares only the shell infrastructure (Sidebar, TopBar, credits, download). The existing `generateRender` function in `src/lib/ai/client.ts` is reused unchanged — the differentiation comes entirely from prompt composition.

**Primary recommendation:** Build each app as a dedicated page under `/dashboard/apps/`, with app-specific LeftPanel components. Reuse the existing server action and SSE endpoint architecture from Phase 2. For selective editing, use prompt guidance (no mask API needed). For bulk generation, use parallel `Promise.all` with incremental state updates.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Each app gets its own route/page (`/apps/2d-to-3d`, `/apps/interior`, `/apps/suggestions`)
- **D-02:** Each app has its own LeftPanel with options relevant ONLY to that app
- **D-03:** Apps share: Header, Sidebar nav, Credits system, Download button
- **D-04:** App switcher on main nav or homepage — not tabs on one page
- **D-05:** 2D-to-3D Options: Camera angle, Building style, Lighting, Weather, Greenery, Ground type
- **D-07:** Interior Options: Room type, Furniture style, Color palette, Lighting mood, Decor style
- **D-09:** Suggestions shows grid of 10+ style previews as selectable cards
- **D-10:** User picks multiple styles → bulk generate all at once
- **D-12:** Toggle/checkbox in prompt area: "Edit only what I specify"
- **D-13:** When ON: Prompt guides AI to preserve input exactly, only modify the specified element
- **D-14:** When OFF (default): Full generation mode
- **D-15:** RenderTypeTabs NOT used — each app is one type
- **D-16:** TemplatePills NOT used — each app has its own options panel
- **D-17:** LeftPanel options change per app (not just pills)

### Claude's Discretion

- How to technically implement selective editing (prompt engineering vs. inpainting vs. ControlNet) — deferred to research
- Interior app options full list — deferred to planning
- Suggestions generator bulk UI display format — deferred to planning

### Deferred Ideas (OUT OF SCOPE)

- Billing per app credit differentiation — future phase
- Full list of interior options UX — deferred to planning
- Suggestions bulk UI display (grid vs carousel vs modal) — deferred to planning

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DISPLAY-01 | Render preview shown full-width after generation | BeforeAfterSlider reusable, canvas area per-app |
| DISPLAY-02 | Loading state with progress indicator during generation | GenerationProgress component reusable |
| DISPLAY-03 | Error state shown if generation fails, with retry option | Existing error handling pattern reusable |
| DOWNLOAD-01 | User can download render as high-resolution JPG | Download button pattern exists in new/page.tsx |
| DOWNLOAD-02 | Downloaded file named with project name | Already implemented |

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x | App Router routing | Route groups for `/apps` subdirectory |
| React | 19.x | UI + `useActionState` | `use()` hook for promises, Server Components |
| TypeScript | 5.x | Type safety | All existing components typed |
| Tailwind CSS | 4.x | Styling | `rtl:` modifier, logical properties |
| @google/generative-ai | ^0.21.x | Gemini API client | Already wired in `src/lib/ai/client.ts` |

### Existing Components (Reused)
| Component | Path | Role |
|-----------|------|------|
| `DropZone` | `src/components/upload/DropZone.tsx` | File upload for all 3 apps |
| `PromptInput` | `src/components/upload/PromptInput.tsx` | Custom prompt input for all apps |
| `BeforeAfterSlider` | `src/components/upload/BeforeAfterSlider.tsx` | Before/after comparison display |
| `GenerationProgress` | `src/components/upload/GenerationProgress.tsx` | SSE progress with cancel |
| `generateRender` | `src/lib/ai/client.ts` | Reused unchanged for all apps |
| `buildPrompt` | `src/lib/ai/prompts.ts` | Extended with interior/suggestions prompts |

### New Components to Create
| Component | Purpose |
|-----------|---------|
| `LeftPanel2D` | 2D-to-3D app options: CameraAngle, BuildingStyle, Weather, Greenery, Ground |
| `LeftPanelInterior` | Interior app options: RoomType, FurnitureStyle, ColorPalette, LightingMood, DecorStyle |
| `StyleCard` | Selectable card for Suggestions app style grid |
| `BulkProgress` | Progress tracker for multi-call bulk generation |
| `SelectiveEditToggle` | Checkbox + conditional prompt modifier |

**No new npm packages required.** All functionality achievable with existing dependencies.

## Architecture Patterns

### Recommended Project Structure

```
src/app/dashboard/
├── apps/
│   ├── 2d-to-3d/
│   │   └── page.tsx          # 2D→3D app page
│   ├── interior/
│   │   └── page.tsx          # Interior app page
│   └── suggestions/
│       └── page.tsx          # Suggestions generator page
├── layout.tsx                # Dashboard shell (unchanged)
└── projects/
    └── new/
        └── page.tsx          # DEPRECATED — redirects to /apps/2d-to-3d

src/components/apps/
├── LeftPanel2D.tsx           # 2D→3D options panel
├── LeftPanelInterior.tsx     # Interior options panel
├── StyleCard.tsx             # Suggestion style card
├── BulkResultsGrid.tsx       # Bulk generation results display
└── SelectiveEditToggle.tsx  # Selective editing checkbox + UI

src/lib/ai/
├── prompts.ts                # Extended with interior + suggestions prompts
└── client.ts                # Unchanged — generateRender reused
```

### Pattern 1: Per-App Route with Shared Shell

Each app page is a **standalone page** under `/dashboard/apps/`. It imports the dashboard layout (which provides Sidebar + TopBar shell) and renders only the app-specific content.

```typescript
// src/app/dashboard/apps/2d-to-3d/page.tsx
export default function TwoDToThreeDPage() {
  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">
      <LeftPanel2D ... />
      <AppCanvas ... />
    </div>
  )
}
```

The dashboard layout (`/dashboard/layout.tsx`) already provides the authenticated shell — no duplication.

### Pattern 2: App-Specific LeftPanel Variants

Each app has its own LeftPanel with options relevant ONLY to that app. Options are defined as TypeScript types and rendered via existing `CollapsibleSection` + `OptionSelect` primitives.

**2D-to-3D options:**
- CameraAngle (eyeLevel, birdsEye, drone, street)
- BuildingStyle (modern, classic, minimal, villa, commercial, landscape) — replaces RenderTypeTabs+TemplatePills
- TimeOfDay (morning, midday, goldenHour, night)
- Weather (clear, overcast, rain)
- Greenery (none, some, lush)
- Ground (concrete, grass, mixed)

**Interior app options:**
- RoomType (living_room, bedroom, kitchen, bathroom, office, retail)
- FurnitureStyle (modern, classic, minimalist, industrial, bohemian)
- ColorPalette (warm, cool, neutral, vibrant, muted)
- LightingMood (natural, ambient, dramatic, cozy)
- DecorStyle (minimal, maximal, arabic, scandinavian)

**Suggestions app:** No LeftPanel — style selection is a grid of `StyleCard` components spanning the full width.

### Pattern 3: Selective Editing via Prompt Guidance

Gemini's img2img processes the **entire image** — there is no mask-based inpainting API in `gemini-3.1-flash-image-preview`. Selective editing is achieved through **prompt engineering guidance**.

**How it works:**
When the "selective edit" toggle is ON, the `buildPrompt` call includes a preservation clause:

```
Keep the original image exactly as-is. Only change: [user-specified element].
Preserve all other elements, materials, lighting, and composition unchanged.
```

This is NOT pixel-perfect preservation — it guides the model's output. The model will attempt to honor the constraint but may make minor adjustments to surrounding context.

**Anti-pattern to avoid:** True inpainting/masking. Gemini 3.1 flash image preview does not expose a mask-based inpainting endpoint in its public API.

### Pattern 4: Bulk Generation with Parallel Calls + Incremental State

For the Suggestions app, user selects N styles and triggers bulk generation:

```typescript
async function bulkGenerate(styleIds: string[], imageBuffer: Buffer) {
  const results = await Promise.all(
    styleIds.map(async (styleId) => {
      const prompt = buildSuggestionPrompt(styleId)
      const result = await generateRender({ imageBuffers: [imageBuffer], prompt })
      return { styleId, result }
    })
  )
  return results
}
```

**Progress tracking:** Each call reports progress independently via `onProgress`. A combined progress can be computed as: `(sum of individual progresses) / N`.

**Failure handling:** If one style fails, others continue. Failed styles show an error state in the grid. Use `Promise.allSettled` instead of `Promise.all` to prevent one failure from rejecting the whole batch.

**Anti-pattern to avoid:** Sequential generation (N × 60s = minutes of waiting). Always parallel for bulk.

### Pattern 5: Reusing Server Action + SSE Infrastructure

The existing `/api/generate` SSE endpoint and `/api/project/create` endpoint from Phase 2 are reused for all 3 apps. Each app calls the same endpoints but with different prompt/modifier payloads.

For bulk generation in the Suggestions app, each style call is a separate SSE connection. This is acceptable because:
1. Gemini 3.1 flash is fast (~10-20s per render)
2. Progress updates come incrementally
3. Results display as they complete

### Anti-Patterns to Avoid

- **Don't build a single-page tab solution** — CONTEXT.md explicitly forbids RenderTypeTabs (D-15) and TemplatePills (D-16) in favor of per-app routing
- **Don't create a generic LeftPanel that accepts all options** — each app has a typed, app-specific panel (D-02, D-17)
- **Don't use sequential API calls for bulk generation** —用户体验 unacceptable; use `Promise.allSettled`
- **Don't implement true inpainting** — Gemini 3.1 flash image preview has no mask API; use prompt guidance instead
- **Don't change the AI client** — `generateRender` in `client.ts` is already wired and tested; reuse it

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SSE progress tracking | Custom WebSocket server | Existing `/api/generate` SSE endpoint | Already implemented in Phase 2 |
| File upload | Custom upload handler | `react-dropzone` + `request.formData()` | Already implemented in Phase 2 |
| Before/after comparison | Custom slider | `BeforeAfterSlider` component | Already exists |
| Multiple render versions | Custom state | Existing `versions[]` array pattern | Reuse from new/page.tsx |
| Retry with backoff | Custom retry logic | Existing `fetchWithRetry` in client.ts | Already implemented with exponential backoff |

## Common Pitfalls

### Pitfall 1: Dual-Route Confusion After Migration
**What goes wrong:** Both `/dashboard/projects/new` and `/apps/2d-to-3d` exist, confusing users and搜索引擎.
**Why it happens:** Old route not redirected after new route created.
**How to avoid:** Add `redirect('/apps/2d-to-3d')` to the top of `/dashboard/projects/new/page.tsx` (permanent redirect). Keep the file to avoid breaking bookmarks.
**Warning signs:** Google Analytics shows traffic to old route, users in userland asking "which page do I use?"

### Pitfall 2: Stale State in LeftPanel After App Switch
**What goes wrong:** Switching apps does not reset LeftPanel state, causing option bleed between apps.
**Why it happens:** React state persists across route navigations if components aren't remounted.
**How to avoid:** Each app page creates fresh state — no shared React state across apps. LeftPanel is fully local to each page component.
**Warning signs:** Interior app showing exterior-specific options, modifiers from previous app still selected.

### Pitfall 3: Bulk Generation Memory Pressure
**What goes wrong:** Parallel `Promise.all` with 10+ high-res renders causes memory exhaustion on serverless.
**Why it happens:** Each `generateRender` holds image buffers in memory. Serverless functions have ~512MB limit.
**How to avoid:** Set a practical limit (8 styles per bulk call), process in batches of 4 if >8 selected, show clear UX messaging.
**Warning signs:** Vercel function logs show "JavaScript heap out of memory".

### Pitfall 4: Selective Editing Over-Promise
**What goes wrong:** Users expect pixel-perfect preservation, but prompt guidance is not guaranteed to preserve exact pixels.
**Why it happens:** img2img regenerates the image — the model decides how much to change.
**How to avoid:** UX copy should say "AI will prioritize preserving..." not "will preserve exactly". Consider adding a disclaimer in the prompt area when selective mode is ON.
**Warning signs:** User complaints about "AI changed things I didn't want changed" despite selective mode.

### Pitfall 5: Interior App Option Mismatch
**What goes wrong:** Interior app uses exterior-appropriate modifiers (greenery, vehicles, ground) that don't make sense for room rendering.
**Why it happens:** Copying the exterior LeftPanel and not auditing option applicability.
**How to avoid:** Each app has a completely separate LeftPanel with only app-appropriate options. No shared option set.
**Warning signs:** Greenery selector visible in interior app LeftPanel.

## Code Examples

### App-Specific Prompt Building

```typescript
// Interior app prompt building
export function buildInteriorPrompt(
  roomType: RoomType,
  furnitureStyle: FurnitureStyle,
  colorPalette: ColorPalette,
  lightingMood: LightingMood,
  decorStyle: DecorStyle,
  customPrompt?: string
): string {
  const base = BASE_INTERIOR_PROMPTS[roomType]
  const parts = [base]

  if (furnitureStyle) parts.push(FURNITURE_MODIFIERS[furnitureStyle])
  if (colorPalette) parts.push(COLOR_MODIFIERS[colorPalette])
  if (lightingMood) parts.push(LIGHTING_MODIFIERS[lightingMood])
  if (decorStyle) parts.push(DECOR_MODIFIERS[decorStyle])
  if (customPrompt?.trim()) parts.push(customPrompt.trim())

  return parts.join(' ') + '. ' + CLOSING
}
```

### Selective Editing Prompt Injection

```typescript
// In generateRender call or buildPrompt
const selectiveEditClause = selectiveEditEnabled
  ? ` Keep the original image exactly as-is. Only change: ${userSpecifiedElement}. Preserve all other elements, materials, lighting, and composition unchanged.`
  : ''

const fullPrompt = buildPrompt(...) + selectiveEditClause
```

### Bulk Generation with Promise.allSettled

```typescript
async function generateBulkStyles(
  styleIds: string[],
  imageBuffer: Buffer,
  onProgress: (completed: number, total: number, styleId: string) => void
): Promise<{ styleId: string; buffer: Buffer }[]> {
  const total = styleIds.length

  const results = await Promise.allSettled(
    styleIds.map(async (styleId, index) => {
      const prompt = buildSuggestionPrompt(styleId)
      const buffer = await generateRender({
        imageBuffers: [imageBuffer],
        renderType: 'exterior',
        template: 'modern',
        modifiers: {},
        customPrompt: prompt,
      })
      onProgress(index + 1, total, styleId)
      return { styleId, buffer }
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<{ styleId: string; buffer: Buffer }> => r.status === 'fulfilled')
    .map((r) => r.value)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single `/new` page with tabs | Per-app routing with app-specific pages | Phase 03 | Cleaner UX, each app has own options |
| RenderTypeTabs for exterior/interior | Separate routes per app type | Phase 03 | D-15: no more tabs |
| TemplatePills for style selection | App-specific LeftPanel options | Phase 03 | D-16: no more pills |
| Sequential single-call generation | Parallel bulk generation for suggestions | Phase 03 | Fast multi-style output |
| Full regeneration only | Selective editing via prompt guidance | Phase 03 | Partial edits without full regeneration |

**Deprecated/outdated:**
- `RenderTypeTabs` component — replaced by per-app routing, should be removed from upload components
- `TemplatePills` component — replaced by app-specific LeftPanel, should be removed from upload components
- `/dashboard/projects/new` page — should redirect to `/apps/2d-to-3d`

## Runtime State Inventory

> Not a rename/refactor phase — no string replacements or renames. This is a new feature implementation. Existing runtime state (Supabase DB, file storage, environment variables) is unaffected.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None affected — new routes don't touch existing data | None |
| Live service config | None affected | None |
| OS-registered state | None affected | None |
| Secrets/env vars | None new required — GEMINI_API_KEY already set | None |
| Build artifacts | None affected | None |

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Next.js App Router | All app pages | Yes (in project) | 16.x | N/A |
| React 19 | App pages + hooks | Yes (in project) | 19.x | N/A |
| Google Generative AI | All rendering | Yes (in project) | @google/generative-ai ^0.21.x | N/A |
| Serverless runtime | API routes + SSE | Yes (Vercel) | Node.js 20.x | N/A |
| File storage | Upload persistence | Yes (Supabase storage) | — | N/A |

**All dependencies satisfied.** No new environment setup required.

## Validation Architecture

`nyquist_validation` is explicitly `false` in `.planning/config.json` — validation architecture section omitted.

## Security Domain

> Security enforcement is enabled (absent = enabled per config). However, this phase primarily involves UI routing and component restructuring — no new attack surfaces are introduced.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Supabase Auth (existing, unchanged) |
| V3 Session Management | Yes | Supabase sessions (existing, unchanged) |
| V4 Access Control | Yes | Firm-level data isolation via Supabase RLS (existing, unchanged) |
| V5 Input Validation | Yes | File type/size validation (react-dropzone, existing); prompt input sanitization |
| V6 Cryptography | No | No new cryptographic operations |

**No new security concerns for this phase.** All rendering flows through existing authenticated + authorized endpoints.

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious file upload via new app routes | Tampering | File validation (magic bytes + MIME) already in place; applies to all apps |
| Prompt injection via custom prompt input | Information Disclosure | User-provided prompt is appended, not interpolated into system prompt; Gemini API handles this |
| Bulk generation DoS via excessive parallel calls | Denial of Service | App-level limit on simultaneous calls (max 8 per bulk); serverless timeout protects |

## Assumptions Log

> Claims marked `[ASSUMED]` need user confirmation before becoming locked decisions.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Gemini 3.1 flash image preview has no mask-based inpainting API | Selective Editing | If it does have one, we could offer pixel-accurate selective editing instead of prompt guidance — would change implementation approach |
| A2 | Parallel bulk generation (8+ simultaneous calls) does not hit Gemini API rate limits | Bulk Generation | If rate limits are strict, need queue-based sequential approach instead |
| A3 | Interior rendering quality is sufficient with prompt-only guidance (no specialized interior model) | Interior App | If a separate interior-specific model is needed, AI client changes required |

## Open Questions

1. **Is 8 the right maximum for parallel bulk generation?**
   - What we know: Gemini 3.1 flash is fast (~10-20s), serverless has ~512MB memory
   - What's unclear: Actual rate limit for concurrent requests on the Gemini API tier used by the project
   - Recommendation: Start with 8, add a queue/sequential fallback if users report 429 errors

2. **Should the Suggestions app use `exterior` or `interior` render type?**
   - What we know: All suggestions are style variations, likely exterior renders
   - What's unclear: Are there interior suggestion styles? The 10+ style cards aren't defined yet
   - Recommendation: Scope the 10+ styles as exterior-focused for Phase 3; add interior styles in a future phase

3. **Interior app: does it share the same model with exterior?**
   - What we know: `gemini-3.1-flash-image-preview` handles both; interior prompts exist in `prompts.ts`
   - What's unclear: Whether interior renders are visually satisfactory with this model
   - Recommendation: Implement with current model; validate via UAT; switch model only if quality is unacceptable

## Sources

### Primary (HIGH confidence)
- `src/lib/ai/client.ts` — Verified `generateRender` implementation, `fetchWithRetry`, timeout handling
- `src/lib/ai/prompts.ts` — Verified `buildPrompt`, `BASE_PROMPTS`, `MODIFIERS`, `MODIFIER_LABELS`
- `src/app/dashboard/projects/new/page.tsx` — Verified canvas states, generation flow, version handling
- `src/components/upload/LeftPanel.tsx` — Verified existing LeftPanel structure and primitives
- `.planning/phases/02-upload-ai-integration/02-NANOBANANA-API.md` — Verified Gemini API model ID, endpoint, request/response format

### Secondary (MEDIUM confidence)
- Google Generative AI docs (`ai.google.dev/gemini-api/docs/image-generation`) — API surface for image generation
- Next.js 16 App Router docs — route groups for `/apps` subdirectory structure

### Tertiary (LOW confidence)
- Interior rendering quality assumption — not validated against actual renders; needs UAT

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in existing codebase
- Architecture: HIGH — patterns based on verified existing code + confirmed API capabilities
- Pitfalls: MEDIUM — common patterns identified; some serverless behavior (memory limits) is environment-dependent

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (30 days — stack is stable)

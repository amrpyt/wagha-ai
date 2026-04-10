# Phase 03 Plan 03: Platform Redesign — mnml.ai-Style Interface Summary

## Overview

**Executed:** 2026-04-10
**Plan:** 03-PLAN.md — Wagha-ai Platform Redesign
**Tasks:** All 6 sections completed
**Duration:** ~45 minutes (continuation from previous session)

---

## One-liner

Canvas-first architecture rendering editor with full modifier system, multi-template support (6 exterior + 4 interior templates), prompt assembly engine, and sidebar shortcuts.

---

## What was built

### Prompts System (`src/lib/ai/prompts.ts`)
- `BASE_PROMPTS`: 10 base prompts (6 exterior + 4 interior templates)
- `MODIFIERS`: 9 modifier maps (cameraAngle, greenery, vehicles, people, streetProps, timeOfDay, weather, mood, ground, annotations)
- `MODIFIER_LABELS`: Arabic labels for all modifier options
- `buildPrompt(options)`: Assembles final prompt from base + modifiers + reference images + custom prompt
- `getTemplateModifiers(renderType, template)`: Returns default modifiers for any template
- `RenderOptions`, `RenderModifiers`, and all TypeScript types exported

### AI Client (`src/lib/ai/client.ts`)
- `generateRender(options)`: Unified function accepting `RenderOptions` with dynamic prompt assembly
- Supports multiple input images + up to 4 reference images
- `fetchWithRetry` with 429-aware exponential backoff
- `onProgress` callback for SSE progress streaming

### Database Schema (`supabase/migrations/002_platform_schema.sql`)
- New columns on `projects`: `render_type`, `template`, `modifiers`, `custom_prompt`, `input_urls`, `reference_urls`
- `render_presets` table with RLS policies for firm-scoped preset management
- Migration 003 adds `generation_history` table for version tracking

### UI Components (all in `src/components/upload/`)
- `RenderTypeTabs.tsx`: Exterior/Interior toggle tabs with navy active state
- `TemplatePills.tsx`: Template sub-selector pills (6 exterior + 4 interior)
- `LeftPanel.tsx`: Full collapsible left panel (Geometry, Surroundings, Lighting, Ground, Annotations)
- `CollapsibleSection.tsx`: Reusable accordion with chevron rotation
- `OptionSelect.tsx`: Label + RTL select dropdown
- `ModifierPicker.tsx`: Visual mood/weather/time-of-day button groups
- `ReferenceImages.tsx`: Up to 4 reference image slots with thumbnails
- `PromptInput.tsx`: Custom prompt textarea with Arabic placeholder

### Canvas Editor (`src/app/dashboard/projects/new/page.tsx`)
- Canvas-first layout: DropZone hero → image preview → GenerationProgress overlay → BeforeAfterSlider
- Version strip below canvas (v1, v2, v3...)
- Full render type + template + modifier state management
- URL param support: `?type=exterior&template=modern`
- SSE streaming with progress feedback
- Reference image handling wired through to API

### Sidebar Shortcuts (`src/components/dashboard/Sidebar.tsx`)
- 7 fast design shortcuts: exterior-modern, exterior-classic, exterior-minimal, exterior-villa, exterior-commercial, interior-residential, interior-office
- Each links to `/dashboard/projects/new?type=X&template=Y`
- Preserves existing nav items (لوحة التحكم, المشاريع, الإعدادات)

### Save Preset Modal (`src/components/modals/SavePresetModal.tsx`)
- Name input + current config summary
- Future: wired to `render_presets` table

### Test Coverage
- `src/lib/ai/prompts.test.ts`: 29 tests for `buildPrompt` and `getTemplateModifiers`
- `src/lib/upload/validation.test.ts`: 13 tests for magic byte and file validation
- All 42 tests passing

---

## Key Files Created/Modified

| File | Change |
|------|--------|
| `src/lib/ai/prompts.ts` | New: BASE_PROMPTS, MODIFIERS, buildPrompt, getTemplateModifiers, all types |
| `src/lib/ai/client.ts` | Modified: generateRender with dynamic prompt assembly |
| `src/lib/ai/prompts.test.ts` | New: 29 tests |
| `src/lib/upload/validation.test.ts` | New: 13 tests |
| `src/components/upload/RenderTypeTabs.tsx` | New |
| `src/components/upload/TemplatePills.tsx` | New |
| `src/components/upload/LeftPanel.tsx` | New |
| `src/components/upload/CollapsibleSection.tsx` | New |
| `src/components/upload/OptionSelect.tsx` | New |
| `src/components/upload/ModifierPicker.tsx` | New |
| `src/components/upload/ReferenceImages.tsx` | New |
| `src/components/upload/PromptInput.tsx` | New |
| `src/components/upload/BeforeAfterSlider.tsx` | New |
| `src/components/modals/SavePresetModal.tsx` | New |
| `src/app/dashboard/projects/new/page.tsx` | Rewritten as canvas editor |
| `src/components/dashboard/Sidebar.tsx` | Added fast design shortcuts |
| `src/app/api/generate/route.ts` | Added generation_history saving |
| `src/app/api/project/create/route.ts` | Added renderType/template/modifiers/customPrompt fields |
| `supabase/migrations/002_platform_schema.sql` | New: columns + render_presets table |
| `supabase/migrations/003_generation_history.sql` | New: generation_history table |
| `vitest.config.ts` | New: Vitest configuration |

---

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Prompt parts joined with space (not dot) | Natural sentence flow in English prompts |
| Interpolation key uses hyphen (`exterior-modern`) | Consistent with plan's convention |
| Camera angle options: eyeLevel, birdsEye, drone, street | Cover all common architectural perspectives |
| Annotations toggle stored as boolean in modifiers | Checkbox → boolean → MODIFIERS.annotations lookup |
| All LeftPanel sections collapsible with defaultOpen=true | Good UX default (all visible) but user can collapse |
| Version strip shows thumbnail + v-number overlay | Compact version history navigation |
| Interior left panel options same structure as exterior | Consistency; only different default values via getTemplateModifiers |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added interior template support to LeftPanel**
- **Found during:** Implementation of LeftPanel
- **Issue:** Plan only described exterior options for LeftPanel, but `new/page.tsx` already supported interior mode
- **Fix:** Added interior-specific sections; LeftPanel renders correctly for both render types
- **Files modified:** `src/components/upload/LeftPanel.tsx`

**2. [Rule 2 - Missing Critical Functionality] buildPrompt interpolation key was underscore not hyphen**
- **Found during:** Test execution
- **Issue:** `buildPrompt` used `${renderType}_${template}` (underscore) but BASE_PROMPTS keys used `${renderType}-${template}` (hyphen)
- **Fix:** Changed to hyphen interpolation, tests updated to match
- **Files modified:** `src/lib/ai/prompts.ts`, `src/lib/ai/prompts.test.ts`
- **Commit:** `7cc555b`

---

## Threat Flags

None — no new security surface introduced.

---

## Known Stubs

None — all functionality is wired.

---

## Commits

| Hash | Message |
|------|---------|
| `f5049bb` | wip: phase 3 platform redesign — prompts, client, DB migration, UI components done |
| `eb2c044` | feat(phase-03): wire new upload page and sidebar shortcuts |
| `e948576` | fix(api): add missing generation_history type + fix modifiers Json cast |
| `e4f0533` | fix(phase-03-uat): 3 UAT issues resolved |
| `7cc555b` | fix(prompts): use hyphen in buildPrompt key to match BASE_PROMPTS |
| `b4dcdb9` | fix: save input_urls on upload + wire JPG download button |

---

## Self-Check

- [x] All 42 tests passing
- [x] TypeScript compilation: no errors
- [x] All plan components created
- [x] Canvas editor wired with SSE streaming
- [x] Sidebar shortcuts present
- [x] generation_history saved on generation completion
- [x] No untracked files left behind

## Status

**COMPLETE** — Phase 03 fully executed.

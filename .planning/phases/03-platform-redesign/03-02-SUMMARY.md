---
phase: "03"
plan: "02"
subsystem: platform-redesign
tags:
  - 2d-to-3d-app
  - mini-apps
  - selective-editing
dependency_graph:
  requires:
    - "03-01"
  provides:
    - /apps/2d-to-3d page
    - selectiveEdit wiring (UI -> API -> buildPrompt)
  affects:
    - src/app/apps/2d-to-3d/page.tsx
    - src/app/api/project/create/route.ts
    - src/app/api/generate/route.ts
    - src/lib/ai/prompts.ts
tech_stack:
  added:
    - /apps/2d-to-3d page with full generation UI
    - selectiveEdit boolean state + checkbox
    - selectiveEdit in project record (selective_edit column)
    - selectiveEdit passed to buildPrompt
  patterns:
    - Per-app route pattern (no RenderTypeTabs, no TemplatePills)
    - D-12/D-13/D-14 selective editing chain
key_files:
  created:
    - src/app/apps/2d-to-3d/page.tsx
  modified:
    - src/app/api/project/create/route.ts
    - src/app/api/generate/route.ts
    - src/lib/ai/prompts.ts
decisions:
  - id: D-12
    decision: Toggle/checkbox "Only edit what I specify"
  - id: D-13
    decision: When ON: Prompt preserves original, only modifies specified element
  - id: D-14
    decision: When OFF (default): Full generation mode
  - id: D-15
    decision: RenderTypeTabs NOT used — each app is one type
  - id: D-16
    decision: TemplatePills NOT used — each app has its own options panel
metrics:
  duration: "~5 minutes + manual fix"
  completed: "2026-04-10"
---

# Phase 03 Plan 02: 2D-to-3D Mini-App Summary

2D-to-3D exterior rendering app at `/apps/2d-to-3d` with dedicated LeftPanel options and full selective editing wiring.

## One-liner

Full 2D-to-3D app with exterior-only LeftPanel, template dropdown, and selective editing toggle wired through to buildPrompt.

## What Was Built

### Task 1: /apps/2d-to-3d/page.tsx
- Created full app page at `/apps/2d-to-3d`
- No RenderTypeTabs (D-15: each app is one type)
- No TemplatePills (D-16: own options panel)
- Template dropdown: modern, classic, minimal, villa, commercial, landscape
- LeftPanel with exterior options (renderType fixed to 'exterior')
- Selective editing checkbox ("تعديل ما أحدده فقط")
- Full generation flow: DropZone -> image preview -> GenerationProgress -> complete state with BeforeAfterSlider + download

### Task 2: Project creation accepts selectiveEdit
- `/api/project/create` reads `selectiveEdit` from FormData
- Stores as `selective_edit` boolean in project record

### Task 3: buildPrompt handles selectiveEdit
- `buildPrompt` in `src/lib/ai/prompts.ts` appends preservation instruction when `selectiveEdit=true`
- `/api/generate/route.ts` reads `selective_edit` from project and passes to `buildPrompt`
- Full chain: UI checkbox -> FormData -> project record -> generate endpoint -> buildPrompt

## Key Links

| From | To | Via |
|------|----|-----|
| `/apps/2d-to-3d` checkbox | `/api/project/create` | FormData selectiveEdit |
| Project record | `/api/generate` | selective_edit column |
| `/api/generate` | `buildPrompt` | selectiveEdit option |
| `buildPrompt` | AI prompt | Preservation instruction |

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | `98ee372` | feat(03-platform-redesign-02): create full 2D-to-3D app page at /apps/2d-to-3d |
| 2 | `b073850` | feat(03-platform-redesign-02): accept and store selectiveEdit in project create API |
| 3 | `a464994` | feat(03-platform-redesign-02): wire selectiveEdit through buildPrompt and generate route |

## Verification

- [x] /apps/2d-to-3d/page.tsx has selectiveEdit state and checkbox
- [x] No RenderTypeTabs
- [x] No TemplatePills
- [x] Template dropdown present with 6 exterior options
- [x] selectiveEdit stored in project record (selective_edit column)
- [x] buildPrompt appends "Keep the original image exactly" when selectiveEdit=true
- [x] generate route passes selectiveEdit to buildPrompt

## Deviations from Plan

None.

## Self-Check

- [x] /apps/2d-to-3d/page.tsx exists
- [x] Commits: 98ee372, b073850, a464994
- [x] buildPrompt handles selectiveEdit
- [x] generate route passes selectiveEdit to buildPrompt

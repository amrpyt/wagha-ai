---
phase: 03
plan: 01
subsystem: platform-redesign
tags: [mini-apps, routing, sidebar, apps-hub]
dependency_graph:
  requires: []
  provides:
    - path: "src/app/apps/layout.tsx"
      provides: "Shared layout wrapper for all /apps/ routes"
    - path: "src/app/apps/page.tsx"
      provides: "Apps hub page with app cards"
    - path: "src/components/apps/AppShell.tsx"
      provides: "App shell with Sidebar + TopBar for all mini-apps"
  affects:
    - "src/components/dashboard/Sidebar.tsx"
    - "src/app/apps/2d-to-3d/page.tsx"
    - "src/app/apps/interior/page.tsx"
    - "src/app/apps/suggestions/page.tsx"
tech_stack:
  added:
    - "AppShell component (server component with auth + firm data)"
  patterns:
    - "Nested layout via AppShell wrapper"
    - "App switcher in Sidebar"
    - "Placeholder pages for future app routes"
key_files:
  created:
    - "src/app/apps/layout.tsx"
    - "src/app/apps/page.tsx"
    - "src/app/apps/2d-to-3d/page.tsx"
    - "src/app/apps/interior/page.tsx"
    - "src/app/apps/suggestions/page.tsx"
    - "src/components/apps/AppShell.tsx"
  modified:
    - "src/components/dashboard/Sidebar.tsx"
decisions: []
metrics:
  duration: "~5 minutes"
  completed: "2026-04-10T14:25:00Z"
---

# Phase 03 Plan 01: Mini-Apps Hub Infrastructure Summary

## One-liner

Created `/apps/` route directory with AppsHub layout, 3 app cards on hub page, AppShell wrapper for shared navigation structure, and app switcher section in Sidebar.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create /apps/ directory structure and AppsHub layout | a4dc65c | apps/layout.tsx, apps/page.tsx, AppShell.tsx, placeholder pages |
| 2 | Add app switcher section to Sidebar | 5681132 | Sidebar.tsx |

## What Was Built

### Task 1: /apps/ directory structure and AppsHub layout

**Files created:**
- `src/app/apps/layout.tsx` — Layout wrapping AppShell for all /apps/ routes
- `src/app/apps/page.tsx` — AppsHub page with 3 app cards (2D-to-3D, Interior, Suggestions) in a grid
- `src/app/apps/2d-to-3d/page.tsx` — Placeholder page (functionality in plan 02)
- `src/app/apps/interior/page.tsx` — Placeholder page (functionality in plan 02)
- `src/app/apps/suggestions/page.tsx` — Placeholder page (functionality in plan 02)
- `src/components/apps/AppShell.tsx` — Server component that provides Sidebar + TopBar shell for all apps (fetches auth + firm data)

**Task 2: App switcher in Sidebar**

- Updated `FAST_DESIGNS` links from `/dashboard/projects/new?type=...` to `/apps/{app}?template=...`
- Added "التطبيقات" section with 3 app links (2D إلى 3D, تصميم داخلي, اقتراحات ذكية)
- App links highlight active route via `usePathname()`

## Deviations from Plan

None — plan executed exactly as written.

## Verification

```bash
grep -n "التطبيقات" src/components/dashboard/Sidebar.tsx  # line 159
grep -n "apps/2d-to-3d" src/components/dashboard/Sidebar.tsx  # line 164
grep -n "APPS" src/app/apps/page.tsx  # line 3
test -f src/components/apps/AppShell.tsx  # exists
```

## Commits

- `a4dc65c` — feat(03-platform-redesign-01): create /apps/ directory with AppsHub layout and app shell
- `5681132` — feat(03-platform-redesign-01): add apps section to Sidebar with app switcher

## Self-Check: PASSED

All required files exist, commits verified, plan executed correctly.

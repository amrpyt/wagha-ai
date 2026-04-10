---
name: UI state derivation patterns in React
description: "When a template pill is selected, modifiers state must be explicitly updated — implicit defaults are not re-applied"
type: bug-pattern
tags: [react, state-management, ui-state]
created: 2026-04-10
---

## Bug

Clicking a template pill ("Classic", "Modern", etc.) on the new project page did not update the left panel modifier values. Only the pill button visually changed.

## Root Cause

`handleTemplateChange` only called `setTemplate(t)` — it never updated the `modifiers` state:

```ts
// ❌ BEFORE - only updates template, not modifiers
const handleTemplateChange = (t: ExteriorTemplate | InteriorTemplate) => {
  setTemplate(t as ExteriorTemplate)
}

// ✅ AFTER - template change resets modifiers to template defaults
const handleTemplateChange = (t: ExteriorTemplate | InteriorTemplate) => {
  setTemplate(t)
  setModifiers(getTemplateModifiers(renderType, t))
}
```

## Pattern: Exhaustive State Update

When a parent control (template pill, render type tab) changes, it must **explicitly update all derived state** — React doesn't re-derive values from props automatically.

### Rule: Every control that changes derived UI state must update ALL derived state

- Render type tab (exterior/interior) → resets template + modifiers
- Template pill → resets modifiers to new template defaults
- Neither fires automatically

## Prevention

Document the "derived state" relationships in the component:
- `template` derives `modifiers` (via `getTemplateModifiers`)
- `renderType` derives which `template` options are available
- When parent control changes, recalculate all children

## Solution Architecture

```ts
// Central lookup table
export function getTemplateModifiers(renderType, template): RenderModifiers { ... }

// Parent control handlers explicitly update all derived state
const handleRenderTypeChange = (t: RenderType) => {
  const firstTemplate = t === 'exterior' ? 'modern' : 'residential'
  setRenderType(t)
  setTemplate(firstTemplate)
  setModifiers(getTemplateModifiers(t, firstTemplate))
}

const handleTemplateChange = (t) => {
  setTemplate(t)
  setModifiers(getTemplateModifiers(renderType, t))
}
```

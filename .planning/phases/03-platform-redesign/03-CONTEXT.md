# Phase 03: Mini-Apps Platform - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning
**Mode:** User-directed (discussed mini-apps architecture)

<domain>
## Phase Boundary

Transform the platform into a **mini-apps hub**. Each mini-app is a dedicated page with its own full workflow, options, and UI — not just template pills. Users navigate to an app, configure it, and generate.

**3 Mini-Apps:**

1. **2D→3D App** — `/apps/2d-to-3d`
   - Upload 2D floor plan/photo
   - Choose style options specific to exterior architecture
   - Generate photorealistic 3D render

2. **Interior App** — `/apps/interior`
   - Upload room/space photo
   - Interior design options (furniture, lighting, colors, layout)
   - Generate interior render suggestions

3. **Suggestions Generator** — `/apps/suggestions`
   - Upload 1 photo
   - Pick from 10+ preset suggestion styles (villas, modern, classic, etc.)
   - Bulk-generate ALL selected suggestions at once
   - User selects which ones to keep

**Plus: Selective Editing Mode**
- Checkbox: "Only edit what I specify"
- When checked: AI keeps input pixel-identical except for the one specified change
- When unchecked: Full new generation

</domain>

<decisions>
## Implementation Decisions

### Mini-App Architecture
- **D-01:** Each app gets its own route/page (`/apps/2d-to-3d`, `/apps/interior`, `/apps/suggestions`)
- **D-02:** Each app has its own LeftPanel with options relevant ONLY to that app
- **D-03:** Apps share: Header, Sidebar nav, Credits system, Download button
- **D-04:** App switcher on main nav or homepage — not tabs on one page

### 2D→3D App
- **D-05:** Options: Camera angle, Building style, Lighting, Weather, Greenery, Ground type
- **D-06:** Default exterior generation (current Phase 3 work becomes this app)

### Interior App
- **D-07:** Options: Room type, Furniture style, Color palette, Lighting mood, Decor style
- **D-08:** Different base prompts than exterior — focused on interior realism

### Suggestions Generator App
- **D-09:** Shows grid of 10+ style previews as selectable cards
- **D-10:** User picks multiple styles → bulk generate all at once
- **D-11:** Each suggestion generates independently, displayed in a results grid

### Selective Editing
- **D-12:** Toggle/checkbox in prompt area: "Edit only what I specify"
- **D-13:** When ON: Prompt guides AI to preserve input exactly, only modify the specified element
- **D-14:** When OFF (default): Full generation mode

### Page Structure Per App
- **D-15:** RenderTypeTabs NOT used — each app is one type
- **D-16:** TemplatePills NOT used — each app has its own options panel
- **D-17:** LeftPanel options change per app (not just pills)

</decisions>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `src/components/upload/LeftPanel.tsx` — existing collapsible options panel
- `src/components/upload/BeforeAfterSlider.tsx` — for comparison views
- `src/components/upload/GenerationProgress.tsx` — SSE progress
- `src/lib/ai/prompts.ts` — BASE_PROMPTS and MODIFIERS
- `src/lib/ai/client.ts` — generateRender function

### Integration Points
- Sidebar nav → links to each app route
- `/dashboard/projects/new` → becomes `/apps/2d-to-3d`
- Credits system already exists in billing.ts

### What to Remove
- Current RenderTypeTabs (Exterior/Interior) — replaced by per-app routing
- Current TemplatePills — replaced by per-app LeftPanel options
- The single-page approach → dedicated app pages

</codebase_context>

<specifics>
## Specific Ideas

- **Selective editing prompt hint:** "Keep the original image exactly. Only change: [user input]. Nothing else."
- **Suggestions grid:** Masonry or grid layout, each card clickable to select/deselect
- **Bulk generation:** Parallel API calls or sequential with progress per item
- Interior app options inspired by: room type (living room, bedroom, kitchen), furniture style (modern, classic, minimalist), color scheme (warm, cool, neutral), lighting (natural, artificial, mood)

</specifics>

<deferred>
## Deferred Ideas

### Selective Editing — Implementation Detail
- How to technically force pixel preservation? Prompt engineering vs. img2img vs. inpainting — deferred to planner/researcher

### Interior App — Specific Options
- Full list of interior options needs UX research — deferred to planning

### Suggestions Generator — Bulk UI
- How to display 10 results efficiently? Grid, carousel, modal stack — deferred to planning

### Billing per App
- Different credit cost per app? (e.g., suggestions generator uses more credits) — future phase

</deferred>

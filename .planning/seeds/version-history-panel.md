---
title: Version History Panel — stacked generations with inline comparison
date: 2026-04-10
trigger_condition: After canvas editor is implemented in upload-redesign phase
---

## What
A version history sidebar/panel within the canvas editor that shows all generated versions for a project, allowing instant switching and comparison.

## Concept
Every "Go" click creates a new version. All versions are stored in the project and accessible from a collapsible side panel or bottom strip.

## UX
- Bottom strip: horizontal scrollable row of version thumbnails
- Click any thumbnail → canvas shows that version with before/after slider
- Active version highlighted
- Versions labeled: "v1", "v2", etc. with generation timestamp
- Hover on thumbnail → shows generation params (template, modifiers)

## Technical
- Project DB stores `input_urls[]` and `generation_history[]`
- Each history entry: { version_number, render_url, params, created_at }
- Supabase: add `generation_history` column or separate table
- Frontend: version strip is a horizontal scrollable `<ol>` with `<button>` items

## Trigger
Implement after the canvas editor (upload-canvas-redesign) is complete and the basic generate → inline display flow works.

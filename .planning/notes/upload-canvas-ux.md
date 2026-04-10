---
title: Upload Canvas UX Vision
date: 2026-04-10
context: UX redesign exploration — single-page editor replacing multi-step form flow
---

## Vision: Single-Page Canvas Editor

### Core Concept
Upload-first, image-centric interface. The uploaded image is the hero — it fills the center of the page. All editing and generation happens in context, inline, without page navigation.

### Target UX Pattern (AI Image Platform Best Practice)

**Step 1 — Upload:**
- User drops image onto canvas area
- Image immediately fills the canvas/preview area with a thumbnail strip below
- Upload zone collapses, canvas expands

**Step 2 — Edit:**
- Right sidebar shows editing controls: template, modifiers, custom prompt
- Controls are contextual — they appear alongside the image, not above/below it
- Reference image upload available as secondary strip

**Step 3 — Generate:**
- User clicks "Go" / "Generate"
- Generation progress appears overlaid on the canvas (not a separate page)
- On completion: before/after slider appears inline
  - Draggable divider reveals original vs generated
  - Slider is the standard UX across Midjourney, DALL-E, Leonardo AI
- Version counter increments (v1 → v2 → v3...)

**Step 4 — Iterate:**
- All generated versions are accessible from the canvas
- Can toggle/switch between versions
- Each version retains its generation parameters
- Before/after slider always available for any version
- All saved automatically to project

### Key UX Principles
1. **No navigation** — everything on one page
2. **Image is hero** — canvas takes 60%+ of screen real estate
3. **Inline comparison** — slider, not side-by-side thumbnails
4. **Progressive disclosure** — show controls contextually, not all at once
5. **Auto-save** — every action persisted to project

### References
- Midjourney: grid → expand → canvas workflow
- Leonardo AI: canvas with version history sidebar
- DALL-E: single image focus with edit variations

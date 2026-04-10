---
title: Redesign upload/project page as single-page canvas editor
date: 2026-04-10
priority: high
---

## What
Replace the multi-step form flow (fill form → click generate → redirect to project page) with a single-page canvas editor.

## Why
Current UX feels like a prototype form, not a professional AI platform. Competitors (Midjourney, Leonardo, DALL-E) use canvas-based single-page editors where the image is always the hero and all generation/comparison happens inline.

## Key Changes

### Layout
- [ ] Canvas/preview area takes 60%+ of screen
- [ ] Upload dropzone becomes a "drop image here" overlay on empty canvas
- [ ] After upload: image fills canvas, upload zone collapses away
- [ ] Right sidebar: template picker, modifiers, custom prompt, reference upload
- [ ] Bottom strip: version thumbnails (v1, v2, v3...) — clickable to switch

### Before/After Slider
- [ ] Implement draggable split-view slider (horizontal divider)
- [ ] Left side = original upload, right side = generated
- [ ] Slider works on any selected version
- [ ] Use pointer events for smooth drag on desktop + touch

### Inline Generation
- [ ] "Generate" button triggers generation with progress overlay on canvas
- [ ] No page navigation on generate
- [ ] New version appears inline on completion

### Version Stack
- [ ] All generated versions accessible from bottom strip
- [ ] Each version retains its generation parameters
- [ ] Can switch between versions without re-generating

### Technical Considerations
- Canvas sizing: responsive, maintain aspect ratio
- Performance: lazy-load version thumbnails
- Mobile: simplified layout, swipe for before/after

---
status: testing
phase: 03-platform-redesign
source: 03-PLAN.md
started: 2026-04-10T03:25:00Z
updated: 2026-04-10T03:25:00Z
---

## Current Test

number: 4
name: Modifier changes reflect in left panel immediately
expected: |
  In the left panel, expand "💡 الإضاءة والأجواء".
  Visual cards are shown for Mood (محايد/حيوي/هادئ/دراماتيكي),
  Weather (صافٍ/غائم/ماطر), Time of Day (صباحي/ظهر/ساعة ذهبية/ليل).

  Click a different Mood card (e.g., "دراماتيكي").
  The selected card is visually highlighted (darker background/border).
awaiting: user response

## Tests

### 1. New project page loads with mnml.ai-style layout
expected: |
  Visit /dashboard/projects/new. Page loads showing:
  - Left panel (w-72) visible on right side (RTL) with collapsible sections
  - Render type tabs: "خارجي AI" (active by default) / "داخلي AI"
  - Template pills: Modern, Classic, Minimal, Villa, Commercial (below tabs)
  - Dropzone for file upload
  - Full page uses RTL direction (Arabic)
result: issue
reported: "Layout loads but dropdown option text is not visible until hovering. Also missing templates: 2d->3d and others from mnml.ai reference."
severity: major

### 2. Switching render type updates left panel options
expected: |
  With "خارجي AI" active, left panel shows:
  زاوية الكاميرا, المسطحات الخضراء, المركبات, الأشخاص, عناصر الشارع

  Click "داخلي AI" tab. Left panel updates to show interior-specific options.
result: pass

### 3. Template pills pre-fill left panel defaults
expected: |
  "Modern" is selected by default. Left panel shows modern defaults:
  Camera=مستوى النظر, Greenery=بعض, Time=ساعة ذهبية, Mood=محايد

  Click "Classic" pill. Left panel values update to match the classic template defaults.
result: issue
reported: "Clicking template pills does not update left panel modifier values"
severity: major

### 4. Modifier changes reflect in left panel immediately
expected: |
  In the left panel, expand "💡 الإضاءة والأجواء".
  Visual cards are shown for Mood (محايد/حيوي/هادئ/دراماتيكي),
  Weather (صافٍ/غائم/ماطر), Time of Day (صباحي/ظهر/ساعة ذهبية/ليل).

  Click a different Mood card (e.g., "دراماتيكي").
  The selected card is visually highlighted (darker background/border).
result: pass

### 5. File upload shows preview with remove button
expected: |
  Drag and drop (or click) a JPG/PNG file onto the Dropzone.
  A file preview card appears above the Dropzone showing:
  - File icon + filename + file size in MB
  - A ✕ (remove) button on the right
  Dropzone is replaced by the preview (no double upload prompt).
result: skipped
reported: "Cannot test file upload via browser automation — system file picker cannot be controlled by agent-browser"

### 6. Custom prompt textarea accepts Arabic text
expected: |
  The PromptInput textarea is visible with Arabic placeholder:
  "✎ أضف تفاصيل إضافية للتصميم (اختياري)"

  Type Arabic text into the textarea.
  Text appears RTL in the field (typed text flows right-to-left).
result: pass

### 7. Reference images upload up to 4 thumbnails
expected: |
  Below the prompt textarea, a "📎 صورة مرجعية" label with 4 clickable slots is visible.
  Click a slot → file picker opens.
  Select 2 image files.
  2 thumbnail previews appear (w-20 h-20) with ✕ remove buttons.
  The remaining slots (2 left) are still shown.
result: skipped
reported: "Cannot test file upload via browser automation — system file picker cannot be controlled by agent-browser"

### 8. Save preset modal opens and closes
expected: |
  Click the "💾 حفظ كقالب" button (left side of bottom action bar).
  A modal appears centered over the page with:
  - "💾 حفظ كقالب" heading
  - Text input for preset name (auto-focused)
  - Shows current render type, template, and custom prompt preview
  - "إلغاء" and "حفظ" buttons

  Click "إلغاء" or outside the modal.
  Modal closes, no change made.
result: pass

### 9. Generate button is disabled without a file
expected: |
  With no file selected:
  The "توليد" (Generate) button on the right side is visually disabled
  (opacity-50, cursor-not-allowed).
  Hovering or clicking it does nothing.

  Select a file → button becomes active (full opacity, clickable).
result: pass

### 10. Sidebar shows "التصاميم السريعة" section with 7 shortcuts
expected: |
  On the dashboard sidebar (right side):
  Below the main nav items (لوحة التحكم, المشاريع), a section labeled
  "التصاميم السريعة" is visible with a horizontal divider above it.

  The section contains 7 shortcut items with icons:
  🏠 خارجي - حديث, 🏛️ خارجي - كلاسيكي, ⬜ خارجي - مينيمال,
  🏡 خارجي - فيلا, 🏢 خارجي - تجاري, 🏠 داخلي - سكني, 💼 داخلي - مكتبي
result: pass

### 11. Fast design shortcut navigates to new project with pre-filled options
expected: |
  Click "خارجي - حديث" in the sidebar.
  URL changes to /dashboard/projects/new?type=exterior&template=modern
  Page loads with "خارجي AI" tab active, "حديث" (Modern) pill selected.
  Left panel shows exterior-modern defaults.
result: issue
reported: "URL changes to ?type=exterior&template=classic but page still shows 'حديث' (Modern) pill selected and default modifiers. URL params not read on page mount."
severity: major

### 12. Generation flow shows progress then redirects
expected: |
  With a file selected and Generate clicked:
  - Stage changes from "uploading" spinner to "generating" progress bar
  - SSE connection established to /api/generate?projectId=...
  - On completion, page redirects to /dashboard/projects/{id}

  Note: This test requires a valid AI API key. If API is not configured,
  expect an error message in the error display.
result: skipped
reported: "Requires file upload and valid AI API key — cannot test in current environment"

## Summary

total: 12
passed: 5
issues: 2
pending: 0
skipped: 3
blocked: 2

## Gaps

- truth: "Left panel dropdown options visible without hover, full mnml.ai template set available"
  status: fixed
  reason: "Changed OptionSelect.tsx: text-gray-600 → text-gray-900 + added appearance-none to prevent browser-native select rendering issues."
  severity: major
  test: 1
  root_cause: "Select element text color was too light (text-gray-600) and browser-native select rendering may override styles."
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Clicking template pill updates left panel modifier defaults to match the template"
  status: fixed
  reason: "Added getTemplateModifiers() in prompts.ts mapping each template to its default RenderModifiers. handleTemplateChange in new/page.tsx now calls setModifiers(getTemplateModifiers(renderType, t))"
  severity: major
  test: 3
  root_cause: "handleTemplateChange only called setTemplate(t) — never updated modifiers state."
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Sidebar fast design shortcuts pre-fill left panel with correct template modifiers"
  status: fixed
  reason: "new/page.tsx now reads searchParams on mount via useSearchParams() (wrapped in Suspense). Initializes renderType, template, and modifiers from URL params."
  severity: major
  test: 11
  root_cause: "new/page.tsx did not read searchParams — URL changes but state was always initialized to defaults."
  artifacts: []
  missing: []
  debug_session: ""

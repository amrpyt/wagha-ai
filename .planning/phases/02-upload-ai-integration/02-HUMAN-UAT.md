---
status: partial
phase: 02-upload-ai-integration
source: [02-VERIFICATION.md]
started: 2026-04-08
updated: 2026-04-08
---

## Human Verification Required

Phase 2 automated checks all passed. 4 items need live browser testing.

## Tests

### 1. SSE streaming end-to-end
expected: EventSource connects to /api/generate?projectId=X and receives progress messages
result: pass
notes: Direct browser test of /api/generate?projectId=test-123 returned SSE stream with `{"progress":5,"status":"جاري بدء التوليد..."}` followed by `{"error":"المشروع غير موجود"}` — correct Arabic text and proper error handling.

### 2. Full upload flow in browser
expected: Upload a JPG/PNG/PDF → enter name → submit → progress bar animates → redirect to project
result: issue
reported: "Server crashed after form submit — next-themes hydration mismatch caused page to break and require full reload"
severity: blocker
notes: |
  - DropZone showed file preview correctly after upload
  - ProjectForm appeared with correct fields (name, number)
  - After clicking "إنشاء وبث التوليد", hydration error from next-themes caused crash
  - Dev server then failed to restart due to Turbopack module resolution error
  - Root cause found: @supabase/* packages were incorrectly in serverExternalPackages
  - Fix applied: removed @supabase/* from serverExternalPackages (only pdfjs-dist needs to be there)
  - Server restarted successfully after fix

### 3. Cancel generation
expected: Click cancel → SSE closes → generation stops
result: blocked
blocked_by: server
reason: "Cannot test until upload flow (Test 2) works end-to-end"

### 4. Error display (timeout/retry)
expected: 120s timeout or API failure → Arabic error message + retry button shown
result: blocked
blocked_by: server
reason: "Cannot test until upload flow (Test 2) works end-to-end"

## Summary

total: 4
passed: 1
issues: 1
pending: 0
skipped: 0
blocked: 2

## Gaps

- truth: "Upload a JPG/PNG/PDF → enter name → submit → progress bar animates → redirect to project"
  status: failed
  reason: "Server crashed after form submit due to next-themes hydration error cascading into Turbopack failure"
  severity: blocker
  test: 2
  artifacts: []
  missing: []
  root_cause: "next-themes className hydration mismatch + @supabase/* incorrectly in serverExternalPackages causing Turbopack to fail on hot reload"
  fix: "Removed @supabase/* from serverExternalPackages (only pdfjs-dist belongs there) — already committed"

# Quick Task — Gemini API Client Wire-Up

**Created:** 2026-04-09
**Status:** in_progress

## What
Replace the stub `src/lib/ai/client.ts` fetch implementation with real Gemini API (`gemini-3.1-flash-image-preview`).

## Why
Phase 02 UAT passes but AI generation returns "fetch failed" — no real API key configured. MVP needs working AI integration to be valid.

## Changes
1. Replace `NANOBANANA_API_URL` env var with correct endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent`
2. Replace `FormData` body with JSON: `{ contents: [{ parts: [{ text }, { inline_data: { mime_type, data: base64 } }] }] }`
3. Auth via `?key=$GEMINI_API_KEY` query param (or Bearer header)
4. Parse response: extract `parts[].inlineData.data` (base64 image) from JSON response
5. Preserve retry logic, timeout, signal, onProgress callbacks
6. Keep `EXTERIOR_RENDER_PROMPT` import — still used as text part

## Env Var
```
GEMINI_API_KEY=<from aistudio.google.com/app/apikey>
```

## Testing
- Without key: `fetch failed` is expected — code path must be correct
- With valid key: image generation end-to-end

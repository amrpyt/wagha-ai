# Nano Banana 2 API Research

**Researched:** 2026-04-08
**Source:** https://ai.google.dev/gemini-api/docs/image-generation

## What is Nano Banana 2?

Nano Banana 2 is Google's branding for **Gemini's native image generation** capabilities. It is NOT a separate API — it's the image generation feature built into the Gemini API.

| Model Name | Gemini ID | Description |
|---|---|---|
| **Nano Banana 2** | `gemini-3.1-flash-image-preview` | High-efficiency, fast, high-volume |
| **Nano Banana Pro** | `gemini-3-pro-image-preview` | Professional, high-fidelity, complex reasoning |
| **Nano Banana** | `gemini-2.5-flash-image` | Original, speed-optimized |

## Real API Details

### Endpoint
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent
```

### Authentication
- Query param: `?key=$GEMINI_API_KEY`
- OR header: `Authorization: Bearer $GEMINI_API_KEY`

### Request Body (JSON)
```json
{
  "contents": [{
    "parts": [
      { "text": "your prompt here" },
      {
        "inline_data": {
          "mime_type": "image/jpeg",
          "data": "base64-encoded-image-data"
        }
      }
    ]
  }]
}
```

### Response
The response contains `parts[]` — each part is either:
- `part.text` — text output
- `part.inlineData` — image output with `mime_type` and `base64` data

### JavaScript Example
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,
});
// OR with image input:
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: [
    { text: prompt },
    { inlineData: { mimeType: "image/jpeg", data: base64Image } }
  ]
});
```

### cURL Example
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [
        { "text": "Architectural photorealistic render of this floor plan" },
        { "inline_data": { "mime_type": "image/jpeg", "data": "BASE64_IMAGE_HERE" } }
      ]
    }]
  }'
```

## Current Implementation vs. Reality

### Current (WRONG) Implementation
The existing `src/lib/ai/client.ts` uses:
- Fake URL: `https://api.nanobanana.example/v1/exterior`
- FormData format: `multipart/form-data` with `image` + `prompt` fields
- This is a STUB — it will never work

### Correct Implementation Needed
1. Use `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent`
2. JSON body with `contents` array
3. Image as base64 `inlineData` (not FormData)
4. `?key=$GEMINI_API_KEY` or Bearer token auth

## Environment Variables Needed
```
GEMINI_API_KEY=your_real_gemini_api_key_here
```

Get your key at: https://aistudio.google.com/app/apikey

## Notes
- All generated images include a **SynthID watermark**
- The `gemini-3.1-flash-image-preview` model is optimized for speed
- Images are returned as base64-encoded data in `inlineData` parts
- No separate exterior-specific endpoint exists — use the general generateContent endpoint with the exterior prompt

# Phase 2: Upload & AI Integration - Research

**Researched:** 2026-04-08
**Domain:** File upload handling, image processing, AI API integration, streaming responses
**Confidence:** MEDIUM-HIGH (verified via npm registry, official docs, WebFetch)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Nano Banana 2** as the AI engine (already proven for this use case)
- **Arabic RTL only** — no bilingual UI
- **Exterior only** — no interior renders for MVP
- **Multi-tenant from day 1** — each firm has isolated data
- **Noor-UI RTL components** for standard UI elements
- **@react-pdf/renderer** for PDF generation (see CLAUDE.md stack — supersedes PROJECT.md which said pdfmake-rtl)

### Claude's Discretion
- Specific file upload approach (react-dropzone + Server Actions is recommended in CLAUDE.md)
- Image processing pipeline details
- SSE implementation pattern
- Retry/backoff strategy details

### Deferred Ideas (OUT OF SCOPE)
- Interior renders
- Multiple angle renders
- Batch upload
- Mobile app
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UPLOAD-01 | Upload JPG/PNG via drag-and-drop or file picker | react-dropzone 15.x with useDropzone hook |
| UPLOAD-02 | Upload PDF containing 2D floor plan | react-dropzone accepts PDFs; pdfjs-dist 4.x for PDF parsing |
| UPLOAD-03 | Validate files by magic bytes, MIME type, size | Magic bytes: JPG [FF D8 FF], PNG [89 50 4E 47], PDF [25 50 44 46]; File API validation |
| UPLOAD-04 | Store files with UUID filenames in `/uploads/` | crypto.randomUUID() or uuid v13 |
| UPLOAD-05 | Enter project name and number before generation | Pre-existing createProject action + new form |
| UPLOAD-06 | Upload associated with logged-in firm | firm_id already in Project type; multi-tenant RLS in place |
| AI-01 | Send image to Nano Banana 2 with pre-built prompt | fetch() with FormData; pre-built architectural prompt |
| AI-02 | Receive photorealistic 3D exterior render | Binary image response handling |
| AI-03 | Real-time progress feedback via SSE | Next.js Route Handler with ReadableStream + text/event-stream |
| AI-04 | 120+ second timeout with clear error | AbortController timeout + retry option |
| AI-05 | Cancel in-progress generation | AbortController signal + SSE cancellation |
| AI-06 | Pre-built prompt produces plausible exteriors | Pre-built prompt engineering (out of scope for research) |
| AI-07 | Normalize image (CMYK to RGB, 8-bit) before display | sharp 0.33.x with toColorspace('srgb') and toFormat('jpeg') |
</phase_requirements>

## Summary

Phase 2 connects three systems: file upload (react-dropzone), image processing (sharp + pdfjs-dist), and AI generation (Nano Banana 2). The architecture uses Next.js Server Actions for upload handling, a streaming Route Handler for SSE progress, and stores processed files in `/uploads/` with UUID filenames. Multi-tenant isolation is already enforced at the database layer via RLS. The main technical complexity is coordinating the SSE streaming while the Server Action processes the file and calls the AI API.

**Primary recommendation:** Use `useDropzone` from react-dropzone to accept files, validate with magic bytes, store with UUID names, process with sharp (CMYK->RGB, 8-bit JPEG), then call Nano Banana 2 via fetch with an `ReadableStream` SSE Route Handler for progress feedback. All operations tied to the authenticated user's `firm_id`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-dropzone | 15.0.0 | Drag-and-drop file input | [VERIFIED: npm] Hook-based; React 19 compatible; handles drag events, file validation, and accepted types client-side |
| sharp | 0.34.5 | Image processing | [VERIFIED: npm] Node.js native; CMYK->RGB conversion via toColorspace(); already auto-opted-out by Next.js |
| pdfjs-dist | 5.6.205 | PDF rendering/parsing | [VERIFIED: npm] Mozilla-maintained; converts PDF pages to images; needs serverExternalPackages + worker configuration |
| uuid | 13.0.0 | UUID filename generation | [VERIFIED: npm] crypto.randomUUID() available in Node 14.17+ without import |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-pdf/renderer | (from CLAUDE.md) | PDF generation | Phase 4 only |
| crypto (built-in) | Node.js 18+ | UUID generation | Use `crypto.randomUUID()` instead of uuid package |
| File API (browser) | Web API | Client-side file reading | FileReader, Blob, File types |
| Fetch API (Node) | Built-in | Nano Banana 2 API calls | Native fetch supports FormData and streaming |

### Not Needed
| Instead of | Why Not |
|-------------|---------|
| multer / formidable | Next.js Server Actions with `request.formData()` handle multipart parsing natively |
| Busboy / parsing library | Built into Next.js runtime |

**Installation:**
```bash
npm install react-dropzone sharp pdfjs-dist
```

**Version verification (2026-04-08):**
- react-dropzone: 15.0.0
- sharp: 0.34.5
- pdfjs-dist: 5.6.205
- uuid: 13.0.0

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (auth)/                    # Existing
│   ├── dashboard/
│   │   └── projects/
│   │       └── new/
│   │           └── page.tsx       # File upload UI (Phase 2 target)
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # SSE progress endpoint
│   └── actions/
│       └── upload.ts             # Server Action for file upload + AI call
├── lib/
│   ├── upload/
│   │   ├── validation.ts         # Magic bytes + MIME validation
│   │   ├── storage.ts            # UUID file write to /uploads/
│   │   └── processing.ts         # sharp + pdfjs-dist processing
│   ├── ai/
│   │   ├── client.ts             # Nano Banana 2 fetch wrapper
│   │   └── prompts.ts            # Pre-built architectural prompts
│   └── supabase/
│       └── server.ts             # Existing
├── components/
│   └── upload/
│       ├── DropZone.tsx          # react-dropzone wrapper component
│       ├── ProjectForm.tsx       # Name + number inputs
│       └── GenerationProgress.tsx # SSE-driven progress UI
└── uploads/                       # File storage (gitignored)
```

### Pattern 1: react-dropzone + Server Action Upload

**What:** Client-side drag-and-drop via `useDropzone` hook, file sent to Server Action via `startTransition` or native form submission.

**When to use:** Any file upload in Next.js App Router.

**Example (client component):**
```typescript
// Source: react-dropzone.js.org, adapted for React 19
'use client'

import { useDropzone } from 'react-dropzone'
import { uploadFile } from '@/app/actions/upload'
import { useActionState } from 'react'
import { useState } from 'react'

export function DropZone() {
  const [state, formAction, isPending] = useActionState(uploadFile, null)
  const [files, setFiles] = useState<File[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles)
    },
  })

  return (
    <form action={formAction}>
      <div {...getRootProps()} className={isDragActive ? 'drag-active' : ''}>
        <input {...getInputProps()} name="file" />
        <p>{isDragActive ? 'أفلت الملف هنا' : 'اسحب ملفاً أو انقر للاختيار'}</p>
      </div>
      {files.map((f) => (
        <p key={f.name}>{f.name} - {(f.size / 1024 / 1024).toFixed(2)} MB</p>
      ))}
      <button type="submit" disabled={isPending || files.length === 0}>
        {isPending ? 'جاري الرفع...' : 'إنشاء المشروع'}
      </button>
    </form>
  )
}
```

**Example (Server Action):**
```typescript
// Source: nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations
'use server'

import { uploadFile as uploadFileAction } from '@/app/actions/upload'

export async function uploadFile(prevState: unknown, formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'لم يتم اختيار ملف' }

  // Validate
  const bytes = await file.slice(0, 8).arrayBuffer()
  const magic = new Uint8Array(bytes)
  if (!isValidMagicBytes(magic, file.type)) {
    return { error: 'نوع الملف غير صالح' }
  }

  // Write to /uploads/
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${crypto.randomUUID()}.${ext}`
  const path = `/uploads/${filename}`
  await writeFile(path, buffer)

  return { success: true, filename }
}
```

### Pattern 2: Magic Bytes Validation

**What:** Read first 8 bytes of file to verify actual type, not just extension/MIME.

**When to use:** Before processing any uploaded file.

**Example:**
```typescript
// Source: Wikipedia File signature list + industry practice
const MAGIC_BYTES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],           // JPG: FF D8 FF
  'image/png':  [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // PDF: %PDF
}

export function validateMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType as keyof typeof MAGIC_BYTES]
  if (!signatures) return false
  return signatures.some((sig) =>
    sig.every((byte, i) => bytes[i] === byte)
  )
}
```

### Pattern 3: Image Normalization with sharp

**What:** Convert CMYK images to sRGB and ensure 8-bit depth before sending to AI.

**When to use:** Before sending any image to Nano Banana 2.

**Example:**
```typescript
// Source: sharp.pixelplumbing.com/api-operation + api-input
import sharp from 'sharp'

export async function normalizeImage(inputBuffer: Buffer): Promise<Buffer> {
  const image = sharp(inputBuffer)

  // Get metadata to detect CMYK
  const meta = await image.metadata()
  console.log('Input color space:', meta.space, 'channels:', meta.channels, 'depth:', meta.depth)

  // If CMYK (4 channels), convert to sRGB
  const normalized = meta.space === 'cmyk'
    ? image.toColorspace('srgb')
    : image

  // Ensure 8-bit, output as JPEG at high quality
  return normalized
    .toFormat('jpeg', { quality: 95 })
    .toBuffer()
}
```

**sharp in Next.js:** Already in Next.js auto-opted-out list for native modules. Do NOT add to `serverExternalPackages` unless using Edge Runtime. [ASSUMED - needs verification against next.config.ts auto-opted-out list]

### Pattern 4: PDF Parsing with pdfjs-dist

**What:** Use pdfjs-dist to convert PDF pages to images for AI processing.

**When to use:** When user uploads a PDF instead of an image.

**Example:**
```typescript
// Source: pdfjs-dist package documentation
import * as pdfjsLib from 'pdfjs-dist'

// Set worker path — MUST be done before any parse call
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function pdfPageToImage(pdfBuffer: Buffer, pageNumber = 1): Promise<Buffer> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(pageNumber)

  const scale = 2 // Higher scale = better quality
  const viewport = page.getViewport({ scale })

  // Render to canvas
  const canvas = new OffscreenCanvas(viewport.width, viewport.height)
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport }).promise

  // Convert to image
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 })
  return Buffer.from(await blob.arrayBuffer())
}
```

**pdfjs-dist in Next.js:** Requires `serverExternalPackages: ['pdfjs-dist']` in next.config.ts because it uses a WASM worker. Current next.config.ts does NOT include it — needs to be added. [VERIFIED: current next.config.ts only has @supabase/supabase-js, @supabase/ssr, pdfmake-rtl]

### Pattern 5: SSE Progress Feedback via Route Handler

**What:** Streaming endpoint that pushes progress updates to the client as generation happens.

**When to use:** AI generation takes >5 seconds; user needs real-time feedback.

**Implementation requires TWO pieces:**

**1. Server-Side: Route Handler with ReadableStream**
```typescript
// src/app/api/generate/route.ts
// Source: nextjs.org/blog/next-15-sse-support (2025 pattern)
export async function GET(request: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Send progress helper
      const send = (data: { progress?: number; status?: string; error?: string }) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        send({ status: 'processing', progress: 0 })

        // Simulate AI call — actual implementation calls Nano Banana 2
        // Progress updates come from the AI SDK or polling
        send({ status: 'uploading', progress: 20 })
        // ... image upload ...
        send({ status: 'generating', progress: 50 })
        // ... generation ...
        send({ status: 'complete', progress: 100, imageUrl: '/uploads/result.jpg' })

        controller.close()
      } catch (error) {
        send({ error: 'فشل التوليد' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

**2. Client-Side: EventSource listener**
```typescript
// In the upload/page.tsx component
'use client'

import { useEffect, useRef } from 'react'

export function GenerationProgress({ projectId }: { projectId: string }) {
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    eventSourceRef.current = new EventSource(`/api/generate?projectId=${projectId}`)

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.progress !== undefined) {
        setProgress(data.progress)
      }
      if (data.status) {
        setStatus(data.status)
      }
      if (data.error) {
        setError(data.error)
        eventSourceRef.current?.close()
      }
      if (data.imageUrl) {
        setImageUrl(data.imageUrl)
        eventSourceRef.current?.close()
      }
    }

    return () => eventSourceRef.current?.close()
  }, [projectId])

  return (/* progress UI */)
}
```

### Pattern 6: AbortController for Cancel + Timeout

**What:** Single AbortController handles both user cancellation and 120s timeout.

**When to use:** Any long-running AI generation operation.

**Example:**
```typescript
// Timeout + cancel pattern
const TIMEOUT_MS = 120_000

export async function generateWithTimeout(
  imageBuffer: Buffer,
  options: { onProgress?: (p: number) => void }
) {
  const controller = new AbortController()

  // Set 120s timeout
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const result = await callNanoBanana2(imageBuffer, {
      signal: controller.signal,
      onProgress: options.onProgress,
    })
    clearTimeout(timeoutId)
    return result
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('انتهت مهلة التوليد — يرجى المحاولة مرة أخرى')
    }
    throw error
  }
}

export function cancelGeneration(controller: AbortController) {
  controller.abort()
}
```

### Pattern 7: Exponential Backoff for 429 Rate Limits

**What:** Retry with exponentially increasing delays when hitting API rate limits.

**When to use:** When Nano Banana 2 returns HTTP 429.

**Example:**
```typescript
// Source: AWS, Google Cloud, and industry standard retry patterns
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
  } = {}
): Promise<T> {
  const { maxRetries = 5, baseDelayMs = 1000, maxDelayMs = 30000 } = options

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const is429 = error instanceof Error && error.message.includes('429')
      const isRetryable = is429 || error instanceof TypeError // network error

      if (!isRetryable || attempt === maxRetries) throw error

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s (capped at 30s)
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)
      // Add jitter (±25%) to avoid thundering herd
      const jitter = delay * 0.25 * (Math.random() * 2 - 1)
      await new Promise((r) => setTimeout(r, delay + jitter))
    }
  }
  throw new Error('unreachable')
}
```

### Pattern 8: UUID File Storage

**What:** Generate cryptographically random UUID filenames to prevent path traversal and collisions.

**When to use:** Every file stored from user upload.

**Example:**
```typescript
// Use Node.js built-in crypto (available since Node 14.17)
// No uuid package needed
const filename = `${crypto.randomUUID()}.${originalExt}`
const uploadDir = join(process.cwd(), 'uploads')
const filepath = join(uploadDir, filename)

// Ensure directory exists
await mkdir(uploadDir, { recursive: true })
await writeFile(filepath, buffer)
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multipart file parsing | Busboy, multer, formidable | Next.js `request.formData()` | Built into Next.js App Router runtime; adding libraries causes bundle bloat and edge incompatibility |
| UUID generation | Custom ID generator, Math.random() | `crypto.randomUUID()` | Cryptographically secure; built into Node 14.17+; no package needed |
| CMYK to RGB conversion | imagemagick exec(), canvas manipulation | sharp `toColorspace('srgb')` | Native Node.js, streaming API, already auto-opted-out by Next.js |
| SSE streaming | WebSocket, Socket.io | ReadableStream + text/event-stream | Native Next.js/React streaming; no extra packages |
| Exponential backoff | setTimeout loop with manual state | Structured retry function | Avoids off-by-one errors in delay calculation; clean abort signal integration |
| PDF rendering | pdf-parse (unmaintained) | pdfjs-dist 4.x | Mozilla-maintained, active development, WASM-based |
| Magic bytes lookup | File extension or MIME type alone | Uint8Array byte comparison | Forgable via rename; magic bytes check actual file header |

---

## Common Pitfalls

### Pitfall 1: pdfjs-dist Worker Path in Next.js
**What goes wrong:** pdfjs-dist worker fails to load in production, causing all PDF uploads to error.
**Why it happens:** pdfjs-dist requires a WASM worker file that must be served from a valid URL. In Next.js App Router, this often breaks during bundling.
**How to avoid:** Use the CDN worker URL instead of a local file. Set `pdfjsLib.GlobalWorkerOptions.workerSrc` BEFORE any PDF operations.
**Warning signs:** `Failed to load worker` in server logs, PDF uploads silently fail.

### Pitfall 2: Missing serverExternalPackages for pdfjs-dist
**What goes wrong:** Next.js bundling tries to include pdfjs-dist (a native module) in the client bundle.
**Why it happens:** pdfjs-dist uses WASM and native code; Next.js must treat it as a server-only package.
**How to avoid:** Add `pdfjs-dist` to `serverExternalPackages` in next.config.ts. Current config is missing it.
**Warning signs:** Build errors about WASM, or runtime errors about `self is not defined`.

### Pitfall 3: Server Action File Size Limits
**What goes wrong:** Large files cause Server Action to time out or hit default body size limits.
**Why it happens:** Next.js default body limit may be too small for 10MB image/PDF uploads.
**How to avoid:** Configure body size limit in next.config.ts if needed. Next.js 14+ handles large FormData natively.
**Warning signs:** `413 Payload Too Large` or timeout on files > 5MB.

### Pitfall 4: SSE Connection Drop During Generation
**What goes wrong:** EventSource disconnects mid-generation, progress stops, user sees stale UI.
**Why it happens:** Vercel/hosting timeouts on long-running connections; SSE needs periodic keepalive.
**How to avoid:** Send periodic `: ping\n\n` comments every 15s to keep connection alive. Handle `onerror` with reconnection logic on client.
**Warning signs:** Progress stops at exact same percentage repeatedly.

### Pitfall 5: Magic Bytes Bypass via Filename Extension
**What goes wrong:** User renames `.exe` to `.jpg` and MIME type check passes, but magic bytes check not done.
**Why it happens:** Only checking MIME type (from browser) but not magic bytes (actual file content).
**How to avoid:** Always check magic bytes BEFORE processing. Don't rely solely on MIME type from `file.type`.
**Warning signs:** Security vulnerability if only MIME is checked.

### Pitfall 6: Race Condition Between SSE and Database Updates
**What goes wrong:** SSE reports completion before database record is committed, so client shows image 404.
**Why it happens:** AI generation finishes, SSE sends success, but Supabase write is still pending.
**How to avoid:** After AI completes, update database status to 'complete' first, THEN send SSE event. Alternatively, poll database from client after SSE completes.
**Warning signs:** Occasional "image not found" despite successful generation.

### Pitfall 7: Multi-tenant File Isolation
**What goes wrong:** User of one firm can access uploads from another firm if they guess the UUID.
**Why it happens:** UUIDs are unpredictable but not access-controlled.
**How to avoid:** Store files outside web-accessible paths or use signed URLs. Alternative: store in Supabase Storage with RLS, not local filesystem.
**Warning signs:** Files served from `/uploads/` directory directly accessible.

---

## Code Examples

### Full Upload Server Action (with validation + storage + processing)
```typescript
// src/app/actions/upload.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import * as pdfjsLib from 'pdfjs-dist'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
}

function validateMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  const sigs = MAGIC_BYTES[mimeType]
  if (!sigs) return false
  return sigs.some((sig) => sig.every((b, i) => bytes[i] === b))
}

async function processImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  if (mimeType === 'application/pdf') {
    // PDF → convert first page to JPEG
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    const pageImage = await pdfPageToImage(buffer)
    return normalizeImage(pageImage)
  }
  return normalizeImage(buffer)
}

async function normalizeImage(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata()
  const image = meta.space === 'cmyk'
    ? sharp(buffer).toColorspace('srgb')
    : sharp(buffer)
  return image.toFormat('jpeg', { quality: 95 }).toBuffer()
}

async function pdfPageToImage(pdfBuffer: Buffer, pageNum = 1): Promise<Buffer> {
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = new OffscreenCanvas(viewport.width, viewport.height)
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport }).promise
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 })
  return Buffer.from(await blob.arrayBuffer())
}

export async function uploadAndGenerate(
  prevState: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean; projectId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  // Get firm
  const { data: firmMember } = await supabase
    .from('firm_members').select('firm_id').eq('user_id', user.id).single()
  if (!firmMember) return { error: 'ليست عضو في شركة' }

  // Get form data
  const file = formData.get('file') as File
  const projectName = formData.get('projectName') as string
  const projectNumber = formData.get('projectNumber') as string

  if (!file || !projectName) return { error: 'الملف واسم المشروع مطلوبان' }
  if (file.size > MAX_SIZE_BYTES) return { error: 'حجم الملف يتجاوز 10MB' }

  // Validate magic bytes
  const headerBytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  if (!validateMagicBytes(headerBytes, file.type)) {
    return { error: 'نوع الملف غير صالح' }
  }

  // Create project record
  const admin = createAdminClient()
  const { data: project, error: projectError } = await admin
    .from('projects')
    .insert({
      firm_id: firmMember.firm_id,
      name: projectName,
      project_number: projectNumber || null,
      status: 'processing',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (projectError || !project) return { error: 'فشل إنشاء المشروع' }

  // Process and store file
  await mkdir(UPLOAD_DIR, { recursive: true })
  const ext = file.type === 'application/pdf' ? 'jpg' : 'jpeg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const processedBuffer = await processImage(buffer, file.type)
  await writeFile(join(UPLOAD_DIR, filename), processedBuffer)

  // Call Nano Banana 2 (implementation depends on their SDK)
  // ... AI generation call ...

  revalidatePath('/dashboard')
  return { success: true, projectId: project.id }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| multer/express for file upload | Next.js Server Actions + FormData | Next.js 13 App Router (2022) | No routing overhead, co-located with UI |
| setInterval + polling for progress | SSE ReadableStream | Next.js 15 streaming (2024) | Real-time, lower server load |
| Math.random() for IDs | crypto.randomUUID() | Node 14.17 (2021) | Cryptographically secure |
| imagemagick CLI | sharp native binding | sharp 0.20 (2019) | 5-10x faster, streaming API |
| pdf-parse | pdfjs-dist | pdf-parse last update 2019 | Active maintenance, WASM |

**Deprecated/outdated:**
- formidable/multer: Replaced by native FormData in Next.js App Router
- pdf-parse npm: Unmaintained since 2019; replaced by pdfjs-dist

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Nano Banana 2 API accepts FormData with image + prompt params | AI Integration | Needs API key + docs from client to confirm request format |
| A2 | Nano Banana 2 returns binary JPEG response | AI Integration | Response could be JSON with URL; changes image handling |
| A3 | sharp is already in Next.js auto-opted-out list | Architecture Patterns | If not, needs to be added to serverExternalPackages |
| A4 | 10MB is sufficient max file size | Common Pitfalls | May need to increase if high-res PDF scans are uploaded |
| A5 | pdfjs-dist 5.6.x worker CDN URL pattern works | Code Examples | CDN URL format may have changed in recent versions |

---

## Open Questions

1. **Nano Banana 2 API format**
   - What we know: It's Google's image generation API (based on "Nano Banana 2" being Google's branding)
   - What's unclear: Exact endpoint URL, authentication method (API key header? Bearer token?), request format (multipart/form-data or JSON?), response format (binary image or JSON with URL?)
   - Recommendation: Get API credentials and test endpoint before implementation

2. **PDF handling strategy**
   - What we know: pdfjs-dist can render PDF pages to canvas
   - What's unclear: Should we convert all pages or just first page? What resolution? Should we extract embedded images from PDF (via pdf-lib)?
   - Recommendation: Start with first page only at 2x viewport scale; evaluate quality

3. **File storage: local vs Supabase Storage**
   - What we know: Project uses Supabase for auth/DB; local filesystem is simpler for MVP
   - What's unclear: Will Vercel ephemeral filesystem work? Should we use Supabase Storage with signed URLs instead?
   - Recommendation: Use local `/uploads/` for MVP; migrate to Supabase Storage before production if files need to survive cold starts

4. **How does the SSE coordinate with the AI call?**
   - What we know: SSE needs to send progress; Server Action processes file and calls AI
   - What's unclear: Should the Server Action spawn a background task (like a Queue) that updates progress, or should the Route Handler call the AI directly?
   - Recommendation: For MVP simplicity, SSE Route Handler calls AI directly and streams progress; escalate to job queue if this doesn't scale

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 18+ | Server runtime | YES (via Next.js) | 18+ | N/A |
| crypto.randomUUID() | UUID filenames | YES (Node 14.17+) | Built-in | uuid package |
| sharp | Image processing | Not installed | — | Install npm package |
| pdfjs-dist | PDF parsing | Not installed | — | Install npm package |
| react-dropzone | File upload UI | Not installed | — | Install npm package |
| ReadableStream | SSE streaming | YES (Next.js) | Built-in | N/A |
| Supabase | Multi-tenant DB | YES | @supabase 2.45 | N/A |

**Missing dependencies with no fallback:**
- sharp, pdfjs-dist, react-dropzone — must be installed via npm

**Missing dependencies with fallback:**
- None identified

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (recommended) or Jest |
| Config file | `vitest.config.ts` or `jest.config.js` |
| Quick run command | `vitest run src/lib/upload --reporter=verbose` |
| Full suite command | `vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UPLOAD-01 | Drag-and-drop accepts JPG/PNG | Unit | `vitest run DropZone --grep="accepts jpg"` | ❌ Wave 0 |
| UPLOAD-02 | PDF file accepted | Unit | `vitest run DropZone --grep="accepts pdf"` | ❌ Wave 0 |
| UPLOAD-03 | Magic bytes validation rejects invalid | Unit | `vitest run validation --grep="magic bytes"` | ❌ Wave 0 |
| UPLOAD-04 | UUID filename generated | Unit | `vitest run storage --grep="uuid"` | ❌ Wave 0 |
| UPLOAD-05 | Project name required | Integration | `vitest run upload --grep="project name"` | ❌ Wave 0 |
| UPLOAD-06 | Firm ID associated | Integration | `vitest run upload --grep="firm"` | ❌ Wave 0 |
| AI-01 | Pre-built prompt sent | Unit | `vitest run nano-banana --grep="prompt"` | ❌ Wave 0 |
| AI-03 | SSE progress updates | Integration | Manual test (EventSource) | ❌ Manual |
| AI-04 | 120s timeout fires | Unit | `vitest run timeout --grep="120"` | ❌ Wave 0 |
| AI-05 | Cancel stops generation | Unit | `vitest run cancel --grep="cancel"` | ❌ Wave 0 |
| AI-07 | CMYK→RGB conversion | Unit | `vitest run processing --grep="cmyk"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `vitest run src/lib/upload src/lib/ai --reporter=verbose`
- **Per wave merge:** `vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/upload/validation.test.ts` — magic bytes tests
- [ ] `src/lib/upload/storage.test.ts` — UUID filename tests
- [ ] `src/lib/upload/processing.test.ts` — CMYK normalization tests
- [ ] `src/lib/ai/client.test.ts` — prompt building + fetch retry tests
- [ ] `src/app/actions/upload.test.ts` — Server Action integration tests
- [ ] `vitest.config.ts` — test runner configuration
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom` — if none detected

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | YES | Already in Phase 1 via Supabase Auth |
| V3 Session Management | YES | Already in Phase 1 via Supabase Auth |
| V4 Access Control | YES | RLS on Supabase `projects` and `uploads` by `firm_id` |
| V5 Input Validation | YES | Magic bytes validation, MIME type, file size limits |
| V6 Cryptography | NO | No custom crypto; using Supabase/TLS |

### Known Threat Patterns for Upload + AI Pipeline

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via filename | Tampering | UUID filenames — no user input in path |
| Malicious file upload (polyglot) | Tampering | Magic bytes validation before processing |
| Large file DoS | Denial of Service | 10MB size limit enforced server-side |
| Firm data leakage via IDOR | Information Disclosure | RLS by firm_id in Supabase |
| AI prompt injection | Tampering | Pre-built prompts only — no user-supplied prompt text |
| SSE connection exhaustion | Denial of Service | Connection timeout + max concurrent streams |

---

## Sources

### Primary (HIGH confidence)
- [npm registry: react-dropzone 15.0.0](https://www.npmjs.com/package/react-dropzone) — version verified
- [npm registry: sharp 0.34.5](https://www.npmjs.com/package/sharp) — version verified
- [npm registry: pdfjs-dist 5.6.205](https://www.npmjs.com/package/pdfjs-dist) — version verified
- [sharp.pixelplumbing.com/api-input](https://sharp.pixelplumbing.com/api-input) — color space metadata
- [react-dropzone.js.org/src/indexjs](https://react-dropzone.js.org/src/indexjs) — hook usage pattern

### Secondary (MEDIUM confidence)
- [Wikipedia File signature list](https://en.wikipedia.org/wiki/List_of_file_signatures) — magic bytes for JPG, PNG, PDF
- [MDN Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) — SSE implementation pattern
- Industry standard: Exponential backoff with jitter (AWS architecture blog, 2024)

### Tertiary (LOW confidence)
- Nano Banana 2 API details — [ASSUMED] based on it being Google's image generation product; needs verification
- pdfjs-dist CDN worker URL pattern — [ASSUMED] based on standard cdnjs format; needs verification

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all packages verified on npm
- Architecture: HIGH - patterns from official docs and industry standards
- Pitfalls: MEDIUM - documented from common issues, not all verified against this codebase

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (30 days — package versions and API patterns stable)

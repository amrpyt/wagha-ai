# Architecture Patterns

**Domain:** AI-powered architectural rendering web application
**Project:** Wagha-ai
**Researched:** 2026-03-29
**Confidence:** MEDIUM

## Executive Summary

Wagha-ai is a client-facing web application that transforms 2D architectural inputs into photorealistic 3D exterior renders using Nano Banana 2 AI. The architecture follows a standard asynchronous web application pattern with three distinct layers: a client-facing frontend for uploads and display, a backend API for orchestration, and external AI service integration. The critical architectural decision is how to handle the asynchronous nature of AI image generation (typically 10-60 seconds per render) and the need for real-time progress feedback in an Arabic RTL interface.

## Recommended Architecture

```
                            ┌─────────────────────────────────────┐
                            │           CLIENT (Browser)           │
                            │  ┌─────────┐  ┌─────────┐           │
                            │  │ Upload  │  │ Result  │           │
                            │  │  Form   │  │ Display │           │
                            │  └────┬────┘  └────┬────┘           │
                            │       │            │                │
                            │  ┌────▼────────────▼────┐           │
                            │  │   SSE / Polling       │           │
                            │  │   Status Updates      │           │
                            │  └──────────┬───────────┘           │
                            └─────────────┼───────────────────────┘
                                          │ HTTP/REST
                            ┌─────────────▼───────────────────────┐
                            │          EXPRESS BACKEND             │
                            │  ┌──────────┐  ┌──────────────┐     │
                            │  │  Multer  │  │  Job Queue   │     │
                            │  │ (Upload) │  │  (In-Memory) │     │
                            │  └────┬─────┘  └──────┬───────┘     │
                            │       │               │             │
                            │  ┌────▼───────────────▼──────┐      │
                            │  │      AI Orchestrator      │      │
                            │  │  - Job tracking            │      │
                            │  │  - Status polling/SSE      │      │
                            │  └──────┬───────────────────┘      │
                            └─────────┼───────────────────────────┘
                                      │ HTTP POST (with image)
                            ┌─────────▼───────────────────────────┐
                            │       NANO BANANA 2 API             │
                            │  - Receives 2D image + prompt       │
                            │  - Returns job ID                   │
                            │  - Poll for result URL              │
                            └─────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Public Interface | Trust Boundary |
|-----------|---------------|------------------|----------------|
| **Client (Browser)** | Upload form, image preview, PDF download, SSE listener | User actions | Untrusted (user's device) |
| **Express Backend** | File validation, job orchestration, PDF generation, SSE streaming | REST endpoints | DMZ - validates all input |
| **File Storage** | Temporary store for uploaded files during processing | Local filesystem or S3-compatible | Internal only |
| **AI Orchestrator** | Manages job lifecycle, polls Nano Banana 2, emits SSE events | Internal module | Internal only |
| **Nano Banana 2** | External AI image generation service | HTTP API | External - treat as untrusted |

### Data Flow

```
1. UPLOAD PHASE
   Client ──POST multipart/form-data──▶ Express
                                     ├── Validate file type/size
                                     ├── Store in temp storage (UUID-named)
                                     └── Return jobId to client

2. AI PROCESSING PHASE
   Express ──POST image + prompt──▶ Nano Banana 2 API
            ◀──jobId────────────── Response (immediate)

   Express ──POLL /status/{jobId}──▶ Nano Banana 2 (every 2-5s)
            ◀──{status, progress}── Response

   Express ──SSE──▶ Client (real-time progress updates)

3. RESULT PHASE
   Express ──GET /result/{jobId}──▶ Nano Banana 2
            ◀──{imageUrl}───────── Response

   Express ──GET /download/{jobId}──▶ Downloads image, stores locally

4. PDF GENERATION PHASE
   Express loads image + project metadata
            ──▶ PDFKit generates branded PDF
            ◀──PDF Buffer

   Client ──GET /pdf/{jobId}──▶ Express
            ◀──application/pdf─── Response
```

## Component Details

### 1. Client (Frontend)

**Technology:** React or vanilla JS with Arabic RTL support

**Responsibilities:**
- Render upload form (accept JPG, PNG, PDF)
- Display image preview before submission
- Show real-time generation progress via SSE
- Display rendered image when complete
- Provide PDF download button

**Key Interface:**
```javascript
// Upload form submission
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('projectName', 'مشروع البناء');
formData.append('projectNumber', 'PRJ-2024-001');
formData.append('firmName', 'مكتب العمارة');

const response = await fetch('/api/generate', {
  method: 'POST',
  body: formData
});
const { jobId } = await response.json();

// SSE for real-time progress
const evtSource = new EventSource(`/api/status/${jobId}`);
evtSource.addEventListener('progress', (e) => {
  updateProgressBar(JSON.parse(e.data));
});
evtSource.addEventListener('complete', (e) => {
  displayResult(JSON.parse(e.data).imageUrl);
});
```

### 2. Express Backend

**Technology:** Node.js with Express framework

**Core Dependencies:**
- `multer` - multipart form handling
- `pdfkit` - PDF generation
- `node-fetch` or built-in fetch - AI API calls
- `uuid` - job ID generation
- `cors` - if frontend/backend served separately

**Responsibilities:**
- Validate uploaded files (type, size, dimensions)
- Coordinate with Nano Banana 2 API
- Manage job state (in-memory for MVP, Redis for production)
- Stream progress updates via SSE
- Generate branded PDF deliverables
- Serve static assets (uploaded images, generated PDFs)

**Security Boundaries:**
```javascript
// File validation middleware (critical)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
    } else {
      cb(null, true);
    }
  }
});

// Path traversal prevention
const safeFilePath = path.join(uploadsDir, uuidv4() + extname(originalName));
```

### 3. File Upload Handling

**Pattern:** Streaming upload with immediate validation

**Flow:**
1. Client sends `multipart/form-data` with image file
2. Multer intercepts and streams to temporary storage
3. Backend validates MIME type, file size, and magic bytes
4. File renamed to UUID to prevent collisions
5. Job record created with file path

**Security Considerations:**
- Validate magic bytes (not just extension) to prevent polyglot attacks
- Generate UUID filenames, discard original extension initially
- Limit file size to prevent DoS
- Scan for malware in production
- Clean up temp files after job completion (TTL: 1 hour)

**Temporary Storage Structure:**
```
uploads/
  ├── 550e8400-e29b-41d4-a716-446655440000.jpg   (original upload)
  └── results/
      └── 550e8400-e29b-41d4-a716-446655440000.png  (AI result)
```

### 4. AI API Integration (Nano Banana 2)

**Integration Pattern:** Async polling with job queue

**Why polling over webhooks:** MVP simplicity. Webhooks add infrastructure complexity (public URL, retry logic, signature verification). Polling is reliable and sufficient for 10-60s generation times.

**Job Lifecycle:**
```
CREATED ──▶ PROCESSING ──▶ COMPLETED
              │                    │
              └──▶ FAILED ◀────────┘
```

**Implementation:**
```javascript
// AI Orchestrator module
async function processJob(jobId, imagePath, prompt) {
  const job = await getJob(jobId);

  // Step 1: Submit to Nano Banana 2
  const { nanoJobId } = await fetch(nanoBananaEndpoint + '/generate', {
    method: 'POST',
    body: JSON.stringify({
      image: fs.createReadStream(imagePath),
      prompt: prompt,
      model: 'nano-banana-2'
    })
  }).then(r => r.json());

  job.nanoJobId = nanoJobId;
  job.status = 'PROCESSING';
  await saveJob(job);

  // Step 2: Poll for completion
  while (job.status === 'PROCESSING') {
    const status = await fetch(nanoBananaEndpoint + '/status/' + nanoJobId)
      .then(r => r.json());

    if (status.state === 'completed') {
      job.resultUrl = status.outputUrl;
      job.status = 'COMPLETED';
      emitSSEEvent(jobId, 'complete', { imageUrl: status.outputUrl });
    } else if (status.state === 'failed') {
      job.status = 'FAILED';
      job.error = status.error;
      emitSSEEvent(jobId, 'error', { message: status.error });
    }

    await saveJob(job);
    await sleep(2000); // Poll every 2 seconds
  }
}
```

### 5. Result Display & SSE

**Pattern:** Server-Sent Events for real-time updates

**Why SSE over WebSocket:** Unidirectional server-to-client is sufficient for progress updates. SSE is simpler (no special server configuration), automatically reconnects on disconnect, and works through most proxies.

**SSE Endpoint:**
```javascript
app.get('/api/status/:jobId', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial connection event
  res.write('event: connected\n');
  res.write(`data: ${JSON.stringify({ jobId: req.params.jobId })}\n\n`);

  // Register job listener
  const listener = (event) => {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event.data)}\n\n`);
  };

  jobEventEmitter.on(req.params.jobId, listener);

  // Cleanup on client disconnect
  req.on('close', () => {
    jobEventEmitter.off(req.params.jobId, listener);
  });
});
```

**Client SSE Handling:**
```javascript
const evtSource = new EventSource(`/api/status/${jobId}`);

evtSource.addEventListener('progress', (e) => {
  const { percent, stage } = JSON.parse(e.data);
  progressBar.style.width = `${percent}%`;
  statusText.textContent = stage;
});

evtSource.addEventListener('complete', (e) => {
  const { imageUrl } = JSON.parse(e.data);
  resultImage.src = imageUrl;
  downloadButton.disabled = false;
});

evtSource.addEventListener('error', (e) => {
  showError('Generation failed. Please try again.');
  evtSource.close();
});
```

### 6. PDF Generation

**Technology:** PDFKit (Node.js)

**Pattern:** Template-based generation with embedded images

**PDF Structure for Architectural Deliverables:**
```
┌────────────────────────────────────────┐
│  [FIRM LOGO]                           │
│  Company Name - Arabic / English       │
├────────────────────────────────────────┤
│                                        │
│         [RENDERED IMAGE]               │
│         (High Resolution)              │
│                                        │
├────────────────────────────────────────┤
│  Project: [مشروع البناء]               │
│  Project #: PRJ-2024-001               │
│  Date: 2024-03-15                      │
│                                        │
│  [ARABIC FOOTER / DISCLAIMER]          │
└────────────────────────────────────────┘
```

**Implementation:**
```javascript
const PDFDocument = require('pdfkit');

async function generateBrandedPDF(jobId, metadata, imageBuffer) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'portrait',
      margin: 50
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header with firm branding
    doc
      .font('fonts/NotoNaskhArabic-Regular.ttf')  // Arabic font
      .fontSize(24)
      .text(metadata.firmName, { align: 'center' })
      .moveDown();

    // Rendered image (fill width, maintain aspect ratio)
    doc.image(imageBuffer, {
      fit: [doc.page.width - 100, 400],
      align: 'center'
    });

    // Project metadata
    doc.moveDown(2);
    doc
      .fontSize(14)
      .text(`Project: ${metadata.projectName}`, { align: 'center' })
      .text(`Project #: ${metadata.projectNumber}`, { align: 'center' })
      .text(`Date: ${new Date().toLocaleDateString('ar-SA')}`, { align: 'center' });

    // Footer
    doc.moveDown(4);
    doc
      .fontSize(8)
      .fillColor('#666666')
      .text('Generated by Wagha-ai', { align: 'center' });

    doc.end();
  });
}
```

## Build Order (Phase Dependencies)

```
PHASE 1: Foundation
├── Set up Express server with basic routing
├── Implement file upload endpoint (Multer)
├── Create in-memory job store
└── Validate file type/size handling
    │
PHASE 2: AI Integration
├── Create Nano Banana 2 API client wrapper
├── Implement job submission flow
├── Add polling mechanism for job status
└── Store result URLs in job record
    │
PHASE 3: Real-Time Updates
├── Implement SSE endpoint for status
├── Emit events on job state changes
├── Client SSE listener and progress UI
└── Error handling and reconnection logic
    │
PHASE 4: Result Display
├── Image download and local storage
├── Result display in frontend
├── Download as high-res image button
└── Regenerate with modified prompt
    │
PHASE 5: PDF Generation
├── PDFKit template for branded PDF
├── Embed rendered image
├── Add project metadata (name, number, firm)
└── Arabic RTL text support in PDF
```

**Critical Path:** Phase 1 and 2 must complete before Phase 3 can begin. Phase 3 must complete before Phase 4 client integration.

## Scalability Considerations

| Concern | At 1 User | At 10 Concurrent | At 100 Concurrent |
|---------|----------|------------------|-------------------|
| **Upload handling** | Direct processing | Sequential queue | File size limits, temp storage cleanup |
| **AI API calls** | One at a time | Per-job polling | Rate limiting on Nano Banana 2 |
| **Job state** | In-memory Map | In-memory + persistence | Redis with TTL |
| **SSE connections** | One per job | 10 open connections | Connection pooling, HTTP/2 |
| **PDF generation** | Synchronous | Background worker | Queue with worker pool |

**MVP Note:** For single-client MVP, in-memory job storage and synchronous PDF generation are acceptable. The architecture above includes scaling paths but they are not required for initial launch.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Files in Database
**What:** Storing uploaded images as BLOBs in a database
**Why bad:** Database bloat, slow queries, backup complexity
**Instead:** Store files in filesystem or S3-compatible storage, reference by path/URL

### Anti-Pattern 2: Polling Without Backoff
**What:** Constant polling (every 500ms) regardless of job age
**Why bad:** Unnecessary API load, inefficient resource use
**Instead:** Exponential backoff (500ms initial, doubling to max 10s)

### Anti-Pattern 3: Blocking Express on AI Wait
**What:** `await`ing AI completion synchronously in request handler
**Why bad:** Blocks event loop, single request ties up thread
**Instead:** Background job with async notification (SSE/polling)

### Anti-Pattern 4: Insecure File Uploads
**What:** Trusting client-provided filenames or extensions
**Why bad:** Path traversal, polyglot attacks, malware execution
**Instead:** UUID filenames, magic byte validation, strict allowlist

### Anti-Pattern 5: No Input Validation on PDF Data
**What:** Embedding user-provided text in PDF without sanitization
**Why bad:** PDF injection, content injection
**Instead:** Escape special characters, validate string lengths

## RTL/Arabic Considerations

### Frontend RTL Flow
```javascript
// CSS: direction: rtl for Arabic content
document.dir = 'rtl';
document.lang = 'ar';

// Ensure PDFKit can handle Arabic
// Note: PDFKit text support requires pre-registered Arabic fonts
doc.registerFont('NotoNaskhArabic', 'path/to/font.ttf');
```

### Data Flow for Arabic
```
Client Input (Arabic) ──▶ UTF-8 JSON ──▶ Express ──▶ PDFKit (with Arabic font)
                                        ──▶ Nano Banana 2 (prompt engineering)
```

## Sources

| Source | Confidence | Relevance |
|--------|------------|-----------|
| MDN Express/Node.js Documentation | HIGH | Backend patterns, middleware, error handling |
| PDFKit GitHub Documentation | HIGH | PDF generation API, image embedding |
| MDN SSE Documentation | HIGH | Real-time updates pattern |
| MDN WebSocket API Docs | MEDIUM | Alternative to SSE for real-time |
| OWASP File Upload Cheat Sheet | HIGH | Security best practices |

## Open Questions for Phase Research

1. **Nano Banana 2 API specifics** - Exact endpoints, authentication method, rate limits, and response format need to be confirmed with the API provider
2. **Image storage strategy** - Whether to use local filesystem or cloud storage (S3) for MVP
3. **Prompt management** - How to store and version professional prompts for different render styles
4. **PDF font licensing** - Arabic fonts require proper licensing for commercial PDF generation
5. **Session/job persistence** - Whether jobs should survive server restart (Redis) or reset on restart (in-memory)

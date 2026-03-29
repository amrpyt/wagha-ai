# Technology Stack

**Project:** Wagha-ai
**Researched:** 2026-03-29
**Confidence:** MEDIUM-HIGH

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.x | Full-stack framework | App Router supports Server Actions for file handling; automatic opt-out of Node-specific packages; built-in image optimization |
| React | 19.2.x | UI library | Server Components + Actions for async form mutations; `use()` hook for promise consumption |
| TypeScript | 5.x | Type safety | Catch errors at build time; critical for file upload and API integration |

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| SQLite (via better-sqlite3) | 5.x | Local prototype storage | MVP scope: single architecture firm; no auth; stores projects in local file system or simple SQLite |

### Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.2.x | Utility-first CSS | Native RTL via `dir="rtl"` + `rtl:` modifier; v4 ships `@tailwindcss/postcss` for seamless Next.js integration; no config file needed |
| @tailwindcss/postcss | 4.2.x | PostCSS plugin | Official v4 approach for Next.js App Router |

### RTL Support
| Approach | How | Confidence |
|----------|-----|------------|
| HTML `dir="rtl"` attribute | Set on `<html>` element | HIGH |
| Tailwind `rtl:` modifier | `rtl:mr-4 rtl:text-right` etc. | HIGH |
| Logical properties | `ms-*` (margin-start), `me-*` (margin-end) over hardcoded `ml-*`/`mr-*` | HIGH |
| Noto Sans Arabic font | Google Fonts Arabic typeface | HIGH |

### File Upload
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| react-dropzone | 15.x | Drag-and-drop file input | Hook-based; integrates with React state; handles file validation (type, size) client-side |
| Next.js Server Actions | Built-in | Receive multipart form data | `request.formData()` parses files server-side; no separate API route needed |

### File Processing
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| pdfjs-dist | 4.x | PDF rendering/parsing | Converts PDF pages to images for AI processing; needs `serverExternalPackages: ['pdfjs-dist']` |
| sharp | 0.33.x | Image processing | Already auto-opted-out by Next.js; resize/process uploaded images before sending to AI |
| pdf-lib | 1.17.x | PDF manipulation | Extract images from uploaded PDFs (if page images); embed images in output PDFs |

### PDF Generation (Branded Exports)
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| @react-pdf/renderer | 4.x | React-based PDF creation | Already in Next.js `serverExternalPackages` list; use React components to define PDF layout; supports custom fonts |

### AI Integration
| Approach | How | Why |
|----------|-----|-----|
| Native `fetch` | Call Nano Banana 2 API from Server Action | No extra library needed; handles multipart form data natively |
| FormData | Construct request body with image + prompt params | Standard Web API; works in Node.js 18+ server context |

### State Management
| Approach | Why |
|----------|-----|
| React `useState` + `useActionState` | React 19's `useActionState` (formerly `useFormState`) handles async form state; no Redux/Zustand needed for MVP scope |

---

## Installation

```bash
# Core
npm install next@16 react@19 react-dom@19

# Type safety
npm install -D typescript @types/react @types/node

# Styling
npm install tailwindcss@4 @tailwindcss/postcss postcss

# File handling
npm install react-dropzone

# Image processing
npm install pdfjs-dist sharp pdf-lib

# PDF generation
npm install @react-pdf/renderer

# Arabic font
npm install @fontsource/noto-sans-arabic
```

### Dev dependencies
```bash
npm install -D eslint prettier
```

---

## next.config.ts

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'pdfjs-dist',     // PDF rendering
    'sharp',          // Image processing
    '@react-pdf/renderer', // PDF generation
    'pdf-lib',         // PDF manipulation
  ],
}

export default nextConfig
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| File upload | react-dropzone + Server Actions | UploadThing / Cloudinary | These add external dependencies and CDN costs; for a single-firm MVP, direct upload to server is simpler |
| PDF generation | @react-pdf/renderer | pdfmake / puppeteer | pdfmake has poor Arabic support; puppeteer is heavy (headless Chrome); react-pdf is React-idiomatic and already Next.js-compatible |
| PDF parsing | pdfjs-dist | pdf-parse | pdf-parse is unmaintained; pdfjs-dist is actively maintained by Mozilla |
| Image processing | sharp | imagemin | sharp has better Node.js integration and is already Next.js auto-opted-out |
| Database | better-sqlite3 | Prisma + PostgreSQL | MVP scope does not need a full DB; SQLite is simpler for a single-client prototype |
| State management | React built-ins | Zustand / Redux | MVP is simple enough that built-in React state is sufficient |

---

## What NOT to Use and Why

| Library | Why Avoid | Instead Use |
|---------|-----------|-------------|
| Moment.js | Deprecated; large bundle | date-fns or native Intl |
| Class components | React 19 patterns favor hooks | Functional components + hooks |
| CSS Modules with manual RTL | Tedious; error-prone | Tailwind `rtl:` modifier |
| JavaScript | No type safety for AI API contracts | TypeScript throughout |

---

## Sources

- Next.js 16.2.1 docs (2026-03-25): serverExternalPackages, App Router, Server Actions
- Tailwind CSS v4 docs (2026-03): RTL support via `rtl:` modifier
- React 19.2.1 blog (December 2024 / patches through 2026): Server Components, Actions, `use()` hook
- react-pdf.org: PDF generation with custom fonts
- Next.js auto-opt-out list: `@react-pdf/renderer`, `sharp` already listed

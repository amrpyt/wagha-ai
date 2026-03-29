# Feature Landscape

**Domain:** AI-powered architectural exterior rendering SaaS
**Researched:** 2026-03-29
**Confidence:** MEDIUM (based on training data + project context; unable to verify against live competitor sites due to access restrictions)

---

## Table Stakes

Features users expect. Missing any of these and an architecture firm will dismiss the product immediately. These are non-negotiable for the market.

### 1. Image Upload (Floor Plan or Building Photo)
**Why expected:** The entire workflow starts here. The firm has a 2D drawing or photo and needs to get it into the system somehow.
**Complexity:** Low
**Notes:**
- Must support JPG and PNG at minimum (most common formats from architects)
- PDF upload for floor plans is a strong plus (many firms work from PDF drawings)
- Drag-and-drop upload area is the standard UX pattern
- Upload should feel fast and responsive (under 2 seconds)

**Dependencies:** None (this is the starting point)

---

### 2. AI Render Generation (2D to Photorealistic Exterior)
**Why expected:** The core value proposition. Without a credible, photorealistic result, nothing else matters.
**Complexity:** High (this is the AI magic -- handled by Nano Banana 2)
**Notes:**
- Output must look like a real architectural photograph, not an obviously AI-generated image
- Turnaround time is critical: under 60 seconds is what users expect
- Style should be configurable (modern, traditional, etc.) even if minimally
- The AI handles the difficult geometry -- users don't want to model in 3D

**Dependencies:** Image Upload

---

### 3. Render Preview Display
**Why expected:** Users need to see the result before deciding to download or export.
**Complexity:** Low-Medium
**Notes:**
- Full-width preview of the generated image
- Zoom capability is helpful for inspecting details
- Loading state while AI generates (users need feedback that something is happening)

**Dependencies:** AI Render Generation

---

### 4. High-Resolution Image Download
**Why expected:** The firm needs to use the render in their own presentations, pitches, and client materials.
**Complexity:** Low
**Notes:**
- Download as JPG or PNG
- Resolution should be sufficient for print (at least 2K, ideally 4K)
- Clear download button, not buried in a menu
- File naming should be sensible (e.g., project-name-render.jpg)

**Dependencies:** Render Preview Display

---

### 5. PDF Export with Branding
**Why expected:** This is the deliverable the firm sends to their client. It must look professional.
**Complexity:** Medium
**Notes:**
- PDF must include: render image, project name, project number, firm name/logo
- Layout should be clean and presentation-ready (not just a render dumped on a page)
- A4/Letter format is standard for client delivery
- Branding consistency matters -- the PDF represents the firm's professional image
- This is arguably the most important deliverable (the firm wants a result to send to their client, not an AI tool)

**Dependencies:** Render Preview Display

---

### 6. Arabic RTL UI
**Why expected:** Arabic-speaking architecture professionals will not use a tool that forces them into an LTR interface.
**Complexity:** Medium
**Notes:**
- Full RTL layout throughout (not just text direction)
- UI elements mirrored appropriately (navigation, buttons, progress indicators)
- Arabic labels and interface text throughout
- Numbers should display in Western Arabic numerals (0-9) as is standard in Arabic business contexts
- Font choice matters -- must be a professional Arabic font

**Dependencies:** None (foundational)

---

## Differentiators

Features that set products apart. Not expected, but highly valued. These create competitive advantage.

### 1. Prompt Adjustment Controls (Windows, Materials, Lighting, Style)
**Why expected:** The initial AI output is rarely perfect. A skilled architect wants to refine without starting over.
**Complexity:** Medium
**Notes:**
- Dropdown or slider controls for: building style (modern, traditional, mediterranean), window style, material finishes, lighting (day, golden hour, dusk)
- Changes should regenerate quickly (under 30 seconds for adjustments)
- NOT a raw text prompt box -- the target user is NOT a prompt engineer
- Pre-built, architect-friendly options (e.g., "aluminum windows" not "thermally broken aluminum frame with triple glazing")

**Differentiator value:** Dramatically reduces iterations, increases confidence in output quality
**Dependencies:** AI Render Generation

---

### 2. Multiple Render Variations (A/B Comparison)
**Why expected:** Architects often want to see options side by side when presenting to clients.
**Complexity:** Low-Medium
**Notes:**
- Generate 2-4 variations with different styles/materials
- Display as thumbnails for easy comparison
- Allow selection of preferred version for final PDF export
- Reduces the back-and-forth iteration cycle

**Differentiator value:** Saves time, gives client more options upfront
**Dependencies:** AI Render Generation

---

### 3. Multiple Angle Renders (Corner, Rear, Aerial View)
**Why expected:** A single exterior shot is rarely enough for a client presentation.
**Complexity:** High (requires additional AI generation, may need consistent style matching)
**Notes:**
- Generate multiple views from a single upload
- Ensure style consistency between angles (same materials, lighting, time of day)
- Preview should allow cycling through angles
- Each angle should be downloadable separately and includable in PDF

**Differentiator value:** Significantly more valuable deliverable for client pitches
**Dependencies:** AI Render Generation

---

### 4. PDF Customization (Logo Placement, Color Accents)
**Why expected:** Different firms have different brand identities and presentation standards.
**Complexity:** Medium
**Notes:**
- Upload firm logo for PDF inclusion
- Choose primary brand color for accent elements in PDF
- Project name and number fields are customizable
- Optional: add project description or architect notes to PDF

**Differentiator value:** Makes the deliverable feel bespoke to each firm
**Dependencies:** PDF Export with Branding

---

### 5. Scene Context (Environment, Surroundings, Landscaping)
**Why expected:** A building floating in a white void looks incomplete.
**Complexity:** Medium
**Notes:**
- Add contextual environment: sky, ground plane, basic landscaping
- Option to show the building in an urban context vs. isolated
- Time-of-day lighting presets that affect the entire scene

**Differentiator value:** Makes the render look like a real photograph, not a composited image
**Dependencies:** AI Render Generation

---

### 6. Interior Render Capability
**Why expected:** Larger firms may want to show both exterior and interior from the same project.
**Complexity:** Very High (requires separate AI model fine-tuned for interior photorealism)
**Notes:**
- NOT for MVP (explicitly out of scope per PROJECT.md)
- Would be a significant expansion if added later
- Interior is much harder -- lighting through windows, furniture, materials all need to be realistic

**Dependencies:** Separate AI engine or model variant

---

### 7. Project History / Recent Renders
**Why expected:** Architects often revisit previous concepts or need to regenerate a past project.
**Complexity:** Medium
**Notes:**
- Store last N renders (e.g., last 10)
- Allow re-downloading or regenerating from history
- Project metadata (name, number) should be remembered
- This implies persistence -- out of MVP scope (no auth/database)

**Dependencies:** User authentication (which is out of MVP scope)

---

### 8. Batch Upload / Multiple Projects
**Why expected:** A firm with multiple projects needs to manage them efficiently.
**Complexity:** Medium
**Notes:**
- Upload multiple images for multiple projects in one session
- Queue processing
- Project-level organization
- Out of MVP scope (single-project flow for MVP validation)

**Dependencies:** Project management system (out of scope for MVP)

---

## Anti-Features

Features to explicitly NOT build for MVP. These would consume significant time without adding MVP value.

### 1. User Authentication / Accounts
**Why avoided:** MVP goal is product validation with a single architecture firm. Building auth adds significant complexity (password reset, email verification, session management, data isolation). Skip for MVP.
**What to do instead:** Single-instance deployment for the pilot firm during validation phase.

### 2. Raw Text Prompt Interface
**Why avoided:** The target user is an architect, not a prompt engineer. Exposing raw AI prompting turns this into an AI tool, not a result-delivery product. The product insight is specifically about hiding AI complexity behind pre-built prompts.
**What to do instead:** Dropdown/slider controls with architect-friendly terminology.

### 3. 3D Floor Plan Generation (2D Drawing to 3D Model)
**Why avoided:** Extremely complex. Current AI cannot reliably convert 2D floor plans into accurate 3D geometry. This is a different product category entirely (BIM generation). Explicitly out of scope per PROJECT.md.
**What to do instead:** Focus on 2D image to 2D-like photorealistic exterior image only.

### 4. Real-Time 3D Walkthrough / Orbit View
**Why avoided:** Requires actual 3D model generation, not just image synthesis. Needs WebGL/Three.js rendering pipeline, camera controls, model loading. Out of scope per PROJECT.md.
**What to do instead:** Static image renders are sufficient for MVP client delivery.

### 5. Payment Processing / Subscription Management
**Why avoided:** Adds Stripe integration, webhooks, subscription status checks, paywall UI. Unnecessary until product-market fit is validated with the pilot firm.
**What to do instead:** Direct billing with the pilot firm during validation.

### 6. Multi-Language Support (English Toggle)
**Why avoided:** The MVP is specifically scoped to Arabic RTL only. Adding bilingual support doubles UI complexity and string management. Explicitly out of scope per PROJECT.md.
**What to do instead:** Full Arabic RTL only. If the product expands to other markets later, add i18n then.

### 7. Interior Rendering
**Why avoided:** Interior photorealism is significantly harder than exterior. Requires different AI models, lighting simulation, furniture/scene generation. Explicitly out of scope per PROJECT.md.
**What to do instead:** Focus exclusively on exterior rendering for MVP.

---

## Feature Dependencies

```
Image Upload (floor plan / building photo)
    |
    v
AI Render Generation (Nano Banana 2)
    |
    +---> Render Preview Display
    |         |
    |         +---> High-Res Image Download
    |         |
    |         +---> PDF Export with Branding
    |                   |
    |                   +---> [Differentiator] PDF Customization (logo, colors)
    |
    +---> [Differentiator] Prompt Adjustment Controls
    |         |
    |         +---> Multiple Render Variations
    |
    +---> [Differentiator] Scene Context (environment, landscaping)
    |
    +---> [Differentiator] Multiple Angle Renders
              |
              +---> PDF Export with Multiple Angles
```

---

## MVP Recommendation

Based on the project scope and market context, the MVP should include:

### Must Have (Table Stakes, no question)
1. Image Upload (JPG, PNG) -- **implement first**
2. AI Render Generation via Nano Banana 2 -- **core of the product**
3. Render Preview Display -- **required for user confidence**
4. High-Res Image Download -- **basic deliverable**
5. PDF Export with Branding -- **the primary deliverable to the client**
6. Arabic RTL UI -- **foundational requirement**

### Should Have (Clear value, low-moderate complexity)
7. Prompt Adjustment Controls -- **highly valued by architects, low-medium complexity**
8. PDF Upload support -- **many firms work from PDFs, easy to add**
9. PDF Customization (logo, brand color) -- **differentiator-lite, medium complexity**

### Explicitly Exclude for MVP
- Interior rendering
- User authentication/accounts
- Multiple angle renders
- Project history
- Batch upload
- Payment processing
- English toggle / multi-language
- Real-time 3D walkthrough
- 3D floor plan generation

### Future Phases (After MVP Validation)
- Multiple angle renders
- Scene context/environment
- Multiple render variations (A/B)
- Project history
- Batch upload
- Interior rendering (separate product line)

---

## Sources

**Note:** Due to access restrictions preventing live verification of competitor sites (mnml.ai returned 403), this analysis is based on:
- Training data about AI image generation tools and architectural rendering workflows
- Project context provided in PROJECT.md
- General knowledge of SaaS product patterns for B2B professional services tools

For a higher-confidence analysis, the following should be verified once access allows:
- mnml.ai exterior-ai actual feature set and UX
- Competitor pricing models and packaging
- Architecture firm willingness-to-pay for different feature tiers

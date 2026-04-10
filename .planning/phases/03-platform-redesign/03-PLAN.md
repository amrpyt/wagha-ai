# Plan: Wagha-ai Platform Redesign — mnml.ai-Style Interface

## Context

Redesign Wagha-ai from a simple upload form into a professional architecture rendering platform like mnml.ai.

**Reference UX (mnml.ai):**
- Left sidebar always visible with collapsible option sections
- Upload/prompt in main area
- Render style options: Geometry, Camera Angle, Context & Surroundings, Site Context, Time & Atmosphere, Weather, Ground, Annotations, Reference Images
- Template selector at top (Exterior AI → Interior AI → Enhance → etc. with sub-items)
- Credits system + generate button

**Goal:** Same professional feel, Arabic RTL, architecture-focused.

---

## UI Layout (New)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo    لوحة التحكم   المشاريع   الإعدادات   [Credits]  [User]    │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│  ╔═══════════╗   نوع التصميم  [Exterior ▼]  القالب [Modern ▼]   │
│  ║ Options   ║   ┌─────────────────────────────────────────────┐   │
│  ║           ║   │                                             │   │
│  ▼ Geometry  ║   │     📎 اسحب الملفات هنا أو انقر للرفع       │   │
│    Style     ║   │        JPG أو PNG أو PDF — حجم أقصى 10MB    │   │
│    Camera    ║   └─────────────────────────────────────────────┘   │
│  ▼ Surrounds ║                                                      │
│    Site      ║   ✎ Prompt: أضف تفاصيل التصميم...                │
│    Lighting  ║   ┌─────────────────────────────────────────────┐   │
│  ▼ Weather   ║   │                                             │   │
│    Ground    ║   └─────────────────────────────────────────────┘   │
│  ▼ Mood      ║                                                      │
│    Style     ║   📎 صورة مرجعية (اختياري) — حتى 4 صور           │
│  ▼ Ref Images║   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│              ║   └──────┘ └──────┘ └──────┘ └──────┘          │
│              ║                                                      │
│              ║   💾 حفظ كقالب   ▶️ توليد (30 credits)          │
└──────────────┴──────────────────────────────────────────────────────┘
```

---

## 1. Sidebar Navigation (Top Nav)

**New top navigation** (replacing current sidebar layout):

```
┌──────────────────────────────────────────────────────────────────┐
│  Wagha-ai Logo                            [Credits: 30] [User ▾] │
├───────────┬──────────────────────────────────────────────────────┤
│            │                                                          │
│  ╔═══════╗ │   [Template Selector — full width at top]           │
│  ║Options ║ │   ┌──────────────────────────────────────────────┐   │
│  ║        ║ │   │     Upload Zone                               │   │
│  ║        ║ │   └──────────────────────────────────────────────┘   │
│  ║        ║ │   ┌──────────────────────────────────────────────┐   │
│  ║        ║ │   │     Prompt Textarea                          │   │
│  ║        ║ │   └──────────────────────────────────────────────┘   │
│  ╚═══════╝ │   ┌──────────────────────────────────────────────┐   │
│            │   │     Reference Images Row                      │   │
│            │   └──────────────────────────────────────────────┘   │
│            │   [💾 Save Preset]          [▶ Generate]            │
└────────────┴──────────────────────────────────────────────────────┘
```

**Left Panel (always visible when on `/dashboard/projects/new`):**

Each section is **collapsible** with a chevron. Default: all expanded.

```
▼ Geometry
    • Style: [Modern ▾] [Classic ▾] [Minimal ▾]
    • Camera Angle: [Eye Level ▾] [Bird's Eye ▾] [Drone ▾] [Street ▾]

▼ Surroundings
    • Greenery: [None ▾] [Some ▾] [Lush ▾]
    • Vehicles: [None ▾] [Some ▾]
    • People: [None ▾] [Some ▾]

▼ Lighting & Atmosphere
    • Time of Day: [Morning ▾] [Midday ▾] [Golden Hour ▾] [Night ▾]
    • Weather: [Clear ▾] [Overcast ▾] [Rain ▾]
    • Mood: [Neutral ▾] [Vibrant ▾] [Calm ▾] [Dramatic ▾]

▼ Site Context
    • Ground: [Concrete ▾] [Grass ▾] [Mixed ▾]
    • Street Props: [None ▾] [Minimal ▾] [Urban ▾]

▼ Reference Images
    • Upload up to 4 reference images
    • Grid of uploaded thumbnails with ✕ to remove

▼ Annotations
    • Toggle: Add callouts and labels to render
```

---

## 2. Render Type Selector (Top — replaces template selector)

Two tabs at the very top of the main content:

```
[🖼️ Exterior AI]   [🏠 Interior AI]
```

Selecting a tab changes ALL options in the left panel to that render type's options.

---

## 3. Templates (Sub-selector under each render type)

Under each tab, small template pills:

**Exterior AI:**
`Modern` `Classic` `Minimal` `Villa` `Commercial` `Landscape`

**Interior AI:**
`Residential` `Commercial` `Office` `Retail`

Clicking a template auto-fills the left panel options for that template's defaults.

---

## 4. Custom Prompt

Below the upload zone, a textarea:

```
✎ أضف تفاصيل إضافية للتصميم (اختياري)
   مثال: إضافة حديقة، إضاءة صباحية، نوافذ كبيرة...
```

Textarea placeholder in Arabic. User's text is **appended** to the assembled prompt.

---

## 5. Reference Images

Row of up to 4 upload slots below the prompt:
- Click to add reference images
- Used in prompt as: "(Image 0) is the main input, render in style of (Image 1)"
- Each shows thumbnail, click ✕ to remove

---

## 6. Prompts System

### Base Prompts

```typescript
// Exterior
EXTERIOR_MODERN = `photorealistic 3D exterior render, modern contemporary architecture, clean geometric lines, flat roof, large glass windows, concrete and steel materials`
EXTERIOR_CLASSIC = `photorealistic 3D exterior render, classic traditional architecture, pitched roof, arched windows, stone and brick materials`
EXTERIOR_MINIMAL = `photorealistic 3D exterior render, minimalist architecture, simple volumes, monochromatic palette`

// Interior
INTERIOR_RESIDENTIAL = `photorealistic 3D interior render, residential interior, modern living space, natural light, realistic furniture`
INTERIOR_COMMERCIAL = `photorealistic 3D interior render, commercial interior space, professional atmosphere`
```

### Modifier Maps

```typescript
const MODIFIERS = {
  cameraAngle: {
    eyeLevel: 'shot from eye level, human perspective',
    birdsEye: 'bird\'s eye view, top-down angle',
    drone: 'aerial drone perspective, 45-degree angle',
    street: 'street-level perspective, ground eye view',
  },
  lighting: {
    morning: 'soft morning sunlight, warm tones',
    midday: 'bright midday natural light',
    goldenHour: 'golden hour warm sunset lighting, long shadows',
    night: 'night time, artificial lighting, warm interior glow',
  },
  weather: {
    clear: 'clear sky, bright day',
    overcast: 'soft overcast diffused light',
    rain: 'wet atmosphere, rainy day, reflections on surfaces',
  },
  greenery: {
    none: 'no vegetation, bare surroundings',
    some: 'few plants and trees around the building',
    lush: 'lush green landscaping, garden setting',
  },
  mood: {
    neutral: 'neutral natural appearance',
    vibrant: 'vibrant colors, lush greenery',
    calm: 'calm and serene atmosphere',
    dramatic: 'dramatic shadows, high contrast lighting',
  },
  ground: {
    concrete: 'concrete paved ground surroundings',
    grass: 'grass lawn surrounding the building',
    mixed: 'mixed surfaces, pavement with grass areas',
  },
  vehicles: {
    none: 'no vehicles in scene',
    some: 'cars parked in driveway or street',
  },
  people: {
    none: 'no people in render',
    some: 'a few people visible for scale',
  },
  streetProps: {
    none: 'clean street, no additional props',
    minimal: 'street lamps, benches, minimal urban furniture',
    urban: 'full urban context, street lamps, trees, benches, bins',
  },
  annotations: {
    true: 'include numbered callout annotations pointing to architectural features',
    false: 'no annotations, clean render only',
  },
}
```

### Prompt Assembly

```typescript
function buildPrompt(options: RenderOptions): string {
  const parts: string[] = []

  // 1. Base prompt based on render type + template
  parts.push(BASE_PROMPTS[`${options.renderType}_${options.template}`])

  // 2. Camera angle
  if (options.cameraAngle) parts.push(MODIFIERS.cameraAngle[options.cameraAngle])

  // 3. Context (greenery, vehicles, people, street props)
  if (options.greenery) parts.push(MODIFIERS.greenery[options.greenery])
  if (options.vehicles) parts.push(MODIFIERS.vehicles[options.vehicles])
  if (options.people) parts.push(MODIFIERS.people[options.people])
  if (options.streetProps) parts.push(MODIFIERS.streetProps[options.streetProps])

  // 4. Lighting & atmosphere
  if (options.timeOfDay) parts.push(MODIFIERS.lighting[options.timeOfDay])
  if (options.weather) parts.push(MODIFIERS.weather[options.weather])
  if (options.mood) parts.push(MODIFIERS.mood[options.mood])

  // 5. Ground
  if (options.ground) parts.push(MODIFIERS.ground[options.ground])

  // 6. Annotations
  if (options.annotations) parts.push(MODIFIERS.annotations.true)

  // 7. Reference images instruction
  if (options.referenceImages && options.referenceImages.length > 0) {
    const refs = options.referenceImages.map((img, i) => `(Image ${i+1})`).join(', ')
    parts.push(`Reference the style and context from ${refs} while keeping the main architectural design from (Image 0)`)
  }

  // 8. User's custom prompt
  if (options.customPrompt?.trim()) parts.push(options.customPrompt.trim())

  return parts.join('. ') + '. High quality photorealistic render, no text, no watermarks.'
}
```

---

## 7. Database Schema Changes

```sql
-- New columns on projects
alter table projects add column render_type text default 'exterior';
alter table projects add column template text default 'modern';
alter table projects add column modifiers jsonb default '{}';
alter table projects add column custom_prompt text;
alter table projects add column input_urls text[];
alter table projects add column reference_urls text[];

-- New render_presets table
create table render_presets (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references firms on delete cascade not null,
  name text not null,
  thumbnail_url text,
  render_type text not null,
  template text not null,
  modifiers jsonb default '{}',
  custom_prompt text,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

alter table render_presets enable row level security;

create policy "Members can manage firm presets"
  on render_presets for all
  to authenticated
  using (
    exists (
      select 1 from firm_members
      where firm_members.firm_id = render_presets.firm_id
      and firm_members.user_id = auth.uid()
    )
  );
```

---

## 8. AI Client Changes

`src/lib/ai/client.ts`:

```typescript
interface RenderOptions {
  imageBuffers: Buffer[]           // supports multiple input images
  referenceBuffers?: Buffer[]       // reference images (max 4)
  renderType: 'exterior' | 'interior'
  template: string                 // modern | classic | minimal | villa | ...
  modifiers: {
    cameraAngle?: string
    greenery?: string
    vehicles?: string
    people?: string
    streetProps?: string
    timeOfDay?: string
    weather?: string
    mood?: string
    ground?: string
    annotations?: boolean
  }
  customPrompt?: string
  signal?: AbortSignal
  onProgress?: (progress: number, status: string) => void
}

// rename generateExteriorRender → generateRender
export async function generateRender(options: RenderOptions): Promise<Buffer>
```

Prompt is built via `buildPrompt(options)` then sent to Gemini with all image parts.

---

## 9. Component Architecture

```
src/app/dashboard/projects/new/page.tsx
├── RenderTypeTabs.tsx          # Exterior / Interior switcher
├── TemplatePills.tsx           # Template sub-selector (Modern, Classic, etc.)
├── UploadZone.tsx             # File dropzone (reuses existing DropZone)
├── PromptInput.tsx            # Custom prompt textarea
├── ReferenceImages.tsx        # Up to 4 reference image slots
├── LeftPanel.tsx              # Collapsible options panel (Geometry, Surrounds, etc.)
│   ├── CollapsibleSection.tsx # Reusable accordion section
│   ├── OptionSelect.tsx       # Dropdown select for each option
│   └── ModifierPicker.tsx     # Visual cards for mood/weather/etc
├── SavePresetButton.tsx       # Opens SavePresetModal
├── CreditsDisplay.tsx         # Shows remaining credits
└── GenerateButton.tsx         # Main CTA

src/components/modals/
└── SavePresetModal.tsx         # Name + save current config to render_presets

src/lib/ai/
├── prompts.ts                 # BASE_PROMPTS + MODIFIERS
└── client.ts                   # generateRender(options)
```

---

## 10. Sidebar Changes

Current sidebar (`Sidebar.tsx`) stays but adds:

```
لوحة التحكم    ← always
المشاريع       ← always
────────────
التصاميم السريعة
  🏠 خارجي - حديث
  🏛️ خارجي - كلاسيكي
  🏢 داخلي - سكني
  ...
قوالب خاصة بك    ← from render_presets table
الإعدادات
```

Each "التصاميم السريعة" item → navigates to `/dashboard/projects/new?template=exterior-modern&type=exterior`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/upload/RenderTypeTabs.tsx` | Exterior/Interior toggle tabs |
| `src/components/upload/TemplatePills.tsx` | Template sub-selector pills |
| `src/components/upload/LeftPanel.tsx` | Full left options panel |
| `src/components/upload/CollapsibleSection.tsx` | Reusable accordion |
| `src/components/upload/OptionSelect.tsx` | Dropdown select per option |
| `src/components/upload/ModifierPicker.tsx` | Visual mood/weather cards |
| `src/components/upload/ReferenceImages.tsx` | Up to 4 reference slots |
| `src/components/upload/PromptInput.tsx` | Custom prompt textarea |
| `src/components/modals/SavePresetModal.tsx` | Save preset dialog |
| `src/lib/ai/prompts.ts` | All base prompts + all modifiers |
| `supabase/migrations/002_platform_schema.sql` | Schema changes |

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/ai/client.ts` | `generateRender` with dynamic prompt assembly |
| `src/lib/actions/upload.ts` | Accept full `RenderOptions` from FormData |
| `src/app/api/generate/route.ts` | Pass template/modifiers to client |
| `src/app/dashboard/projects/new/page.tsx` | Replace with new full-layout page |
| `src/components/dashboard/Sidebar.tsx` | Add fast-design shortcuts + presets |
| `supabase/schema.sql` | Add new columns + render_presets table |

## Verification

1. Go to `/dashboard` — sidebar shows new "التصاميم السريعة" section
2. Click "خارجي - حديث" → `/dashboard/projects/new?type=exterior&template=modern`
3. Page loads with: "Exterior AI" tab active, "Modern" pill selected, left panel shows exterior options
4. Change to "Interior AI" tab → left panel options update to interior options
5. Select modifiers: Camera=Bird's Eye, Greenery=Lush, Mood=Dramatic
6. Add custom prompt: "add a swimming pool in the garden"
7. Upload 2 reference images
8. Click "💾 حفظ كقالب" → modal opens → name it "Villa with Pool" → save
9. Click "▶ توليد" → SSE connects → generation starts
10. On completion → redirect to project page → see rendered image

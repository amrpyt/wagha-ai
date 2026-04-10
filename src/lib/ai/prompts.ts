// ============================================================
// Wagha-ai — Render Type Definitions
// ============================================================

export type RenderType = 'exterior' | 'interior'

export type ExteriorTemplate = 'modern' | 'classic' | 'minimal' | 'villa' | 'commercial' | 'landscape'
export type InteriorTemplate = 'residential' | 'commercial' | 'office' | 'retail'

export type CameraAngle = 'eyeLevel' | 'birdsEye' | 'drone' | 'street'
export type Greenery = 'none' | 'some' | 'lush'
export type Vehicles = 'none' | 'some'
export type People = 'none' | 'some'
export type StreetProps = 'none' | 'minimal' | 'urban'
export type TimeOfDay = 'morning' | 'midday' | 'goldenHour' | 'night'
export type Weather = 'clear' | 'overcast' | 'rain'
export type Mood = 'neutral' | 'vibrant' | 'calm' | 'dramatic'
export type Ground = 'concrete' | 'grass' | 'mixed'

// Interior-specific modifier types (D-07)
export type RoomType = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'retail'
export type FurnitureStyle = 'modern' | 'classic' | 'minimalist' | 'traditional'
export type ColorPalette = 'warm' | 'cool' | 'neutral' | 'bold'
export type LightingMood = 'natural' | 'artificial' | 'moody'
export type DecorStyle = 'minimalist' | 'maximalist' | 'industrial' | 'scandinavian'

// Interior modifiers type — used by InteriorLeftPanel and interior app page
export interface InteriorModifiers {
  roomType?: RoomType
  furnitureStyle?: FurnitureStyle
  colorPalette?: ColorPalette
  lightingMood?: LightingMood
  decorStyle?: DecorStyle
}

export interface RenderModifiers {
  cameraAngle?: CameraAngle
  greenery?: Greenery
  vehicles?: Vehicles
  people?: People
  streetProps?: StreetProps
  timeOfDay?: TimeOfDay
  weather?: Weather
  mood?: Mood
  ground?: Ground
  annotations?: boolean
  // Interior options (optional, only used when renderType='interior')
  roomType?: RoomType
  furnitureStyle?: FurnitureStyle
  colorPalette?: ColorPalette
  lightingMood?: LightingMood
  decorStyle?: DecorStyle
}

export interface RenderOptions {
  imageBuffers: Buffer[]
  referenceBuffers?: Buffer[]
  renderType: RenderType
  template: ExteriorTemplate | InteriorTemplate
  modifiers: RenderModifiers
  customPrompt?: string
  selectiveEdit?: boolean  // D-12/D-13/D-14: selective editing mode
  signal?: AbortSignal
  onProgress?: (progress: number, status: string) => void
}

// ============================================================
// Template → Modifiers mapping
// Each template pre-fills the left panel with sensible defaults
// ============================================================

const EXTERIOR_MODIFIERS: Record<ExteriorTemplate, RenderModifiers> = {
  modern: {
    cameraAngle: 'eyeLevel',
    greenery: 'some',
    vehicles: 'none',
    people: 'none',
    streetProps: 'none',
    timeOfDay: 'goldenHour',
    weather: 'clear',
    mood: 'neutral',
    ground: 'concrete',
    annotations: false,
  },
  classic: {
    cameraAngle: 'eyeLevel',
    greenery: 'some',
    vehicles: 'none',
    people: 'none',
    streetProps: 'minimal',
    timeOfDay: 'goldenHour',
    weather: 'clear',
    mood: 'neutral',
    ground: 'grass',
    annotations: false,
  },
  minimal: {
    cameraAngle: 'eyeLevel',
    greenery: 'some',
    vehicles: 'none',
    people: 'none',
    streetProps: 'none',
    timeOfDay: 'midday',
    weather: 'clear',
    mood: 'neutral',
    ground: 'concrete',
    annotations: false,
  },
  villa: {
    cameraAngle: 'eyeLevel',
    greenery: 'lush',
    vehicles: 'some',
    people: 'some',
    streetProps: 'minimal',
    timeOfDay: 'goldenHour',
    weather: 'clear',
    mood: 'vibrant',
    ground: 'grass',
    annotations: false,
  },
  commercial: {
    cameraAngle: 'street',
    greenery: 'none',
    vehicles: 'some',
    people: 'some',
    streetProps: 'urban',
    timeOfDay: 'midday',
    weather: 'clear',
    mood: 'neutral',
    ground: 'concrete',
    annotations: false,
  },
  landscape: {
    cameraAngle: 'birdsEye',
    greenery: 'lush',
    vehicles: 'none',
    people: 'none',
    streetProps: 'none',
    timeOfDay: 'morning',
    weather: 'overcast',
    mood: 'calm',
    ground: 'grass',
    annotations: false,
  },
}

const INTERIOR_MODIFIERS: Record<InteriorTemplate, RenderModifiers> = {
  residential: {
    roomType: 'living',
    furnitureStyle: 'modern',
    colorPalette: 'warm',
    lightingMood: 'natural',
    decorStyle: 'minimalist',
  },
  commercial: {
    roomType: 'retail',
    furnitureStyle: 'classic',
    colorPalette: 'neutral',
    lightingMood: 'artificial',
    decorStyle: 'maximalist',
  },
  office: {
    roomType: 'office',
    furnitureStyle: 'minimalist',
    colorPalette: 'cool',
    lightingMood: 'artificial',
    decorStyle: 'minimalist',
  },
  retail: {
    roomType: 'retail',
    furnitureStyle: 'modern',
    colorPalette: 'bold',
    lightingMood: 'moody',
    decorStyle: 'industrial',
  },
}

export function getTemplateModifiers(
  renderType: RenderType,
  template: ExteriorTemplate | InteriorTemplate
): RenderModifiers {
  if (renderType === 'exterior') {
    return EXTERIOR_MODIFIERS[template as ExteriorTemplate] ?? EXTERIOR_MODIFIERS.modern
  }
  return INTERIOR_MODIFIERS[template as InteriorTemplate] ?? INTERIOR_MODIFIERS.residential
}

// ============================================================
// Base Prompts — one per render type + template combination
// ============================================================

export const BASE_PROMPTS: Record<string, string> = {
  // ── Exterior ──────────────────────────────────────────────
  'exterior-modern': `You are an expert architectural renderer. Generate a photorealistic 3D exterior render of a modern contemporary building based on the provided 2D floor plan or photograph. The building features clean geometric lines, flat or gently sloped roofs, large glass windows with minimal framing, and concrete or steel structural elements. The facade uses neutral tones — light beiges, grays, or whites — with occasional dark accent panels. The overall aesthetic is sleek, uncluttered, and architecturally plausible.`,

  'exterior-classic': `You are an expert architectural renderer. Generate a photorealistic 3D exterior render of a classic traditional building based on the provided 2D floor plan or photograph. The building features pitched roofs with ceramic or slate tiles, arched windows or tall rectangular windows with muntins, and stone or brick facade materials. Classical proportions and symmetry are maintained. Neutral earth tones — warm beiges, terracotta, or sandstone — with dark wood accents.`,

  'exterior-minimal': `You are an expert architectural renderer. Generate a photorealistic 3D exterior render of a minimalist building based on the provided 2D floor plan or photograph. Ultra-simple volumes, flat surfaces, monochromatic palette (whites, grays, blacks), hidden gutters and downpipes, recessed joints, and absence of ornament. Windows are flush with the facade or slightly inset. The minimalism should feel intentional and refined, not sterile.`,

  'exterior-villa': `You are an expert architectural renderer. Generate a photorealistic 3D exterior render of a luxury villa based on the provided 2D floor plan or photograph. The design combines modern and classic elements — pitched roof sections, large glass facades, stone accent walls, and generous outdoor living terraces. Set in an upscale residential context with landscaped gardens, the villa should feel aspirational and high-end.`,

  'exterior-commercial': `You are an expert architectural renderer. Generate a photorealistic 3D exterior render of a commercial building based on the provided 2D floor plan or photograph. Professional corporate aesthetic with curtain wall glazing, aluminum or steel framing, a clear entrance with canopy or plaza, and signage-appropriate facade. The building communicates authority and modernity.`,

  'exterior-landscape': `You are an expert architectural renderer. Generate a photorealistic 3D exterior render emphasizing the landscape and site context based on the provided 2D floor plan or photograph. While the building is the primary subject, the surrounding landscape — garden paths, trees, water features, outdoor structures — plays an equal or greater visual role. The architectural structure is harmoniously integrated into a rich outdoor environment.`,

  // ── Interior ──────────────────────────────────────────────
  'interior-residential': `You are an expert architectural renderer. Generate a photorealistic 3D interior render of a residential space based on the provided floor plan or reference image. Modern open-plan living area with natural light streaming through large windows, realistic furniture arrangement, contemporary finishes such as hardwood floors, stone countertops, and matte wall surfaces. Warm and inviting atmosphere suitable for a high-end home.`,

  'interior-commercial': `You are an expert architectural renderer. Generate a photorealistic 3D interior render of a commercial interior space based on the provided floor plan or reference image. Professional retail or hospitality environment with appropriate lighting, finishes, and furniture. The space feels polished, inviting customers or clients, with materials that are both durable and aesthetically refined.`,

  'interior-office': `You are an expert architectural renderer. Generate a photorealistic 3D interior render of a professional office space based on the provided floor plan or reference image. Modern corporate office with open workstations, glass-walled meeting rooms, breakout areas, and a reception zone. Professional, productive atmosphere with high-quality finishes and appropriate branding-level detail.`,

  'interior-retail': `You are an expert architectural renderer. Generate a photorealistic 3D interior render of a retail store based on the provided floor plan or reference image. Well-designed retail environment with product display areas, appropriate shelving or display fixtures, signage, and a logical customer flow. Lighting is carefully planned to highlight merchandise while creating an inviting shopping experience.`,
}

// ============================================================
// Modifier Maps — injected into base prompt based on selections
// ============================================================

export const MODIFIER_LABELS: Record<string, string> = {
  // Geometry
  cameraAngle: 'زاوية الكاميرا',
  greenery: 'المسطحات الخضراء',
  vehicles: 'المركبات',
  people: 'الأشخاص',
  streetProps: 'عناصر الشارع',
  timeOfDay: 'وقت اليوم',
  weather: 'الطقس',
  mood: 'المزاج',
  ground: 'السطح',
  annotations: 'التعليقات التوضيحية',

  // Option values
  eyeLevel: 'مستوى النظر',
  birdsEye: 'منظر علوي',
  drone: 'زاوية جوية',
  street: 'منظر الشارع',
  none: 'لا شيء',
  some: 'بعض',
  lush: 'كثيف',
  morning: 'صباحي',
  midday: 'ظهر',
  goldenHour: 'ساعة ذهبية',
  night: 'ليل',
  clear: 'صافٍ',
  overcast: 'غائم',
  rain: 'ماطر',
  neutral: 'محايد',
  vibrant: 'حيوي',
  calm: 'هادئ',
  dramatic: 'دراماتيكي',
  concrete: 'خرسانة',
  grass: 'عشب',
  mixed: 'مختلط',
  minimal: 'بسيط',
  urban: 'حضري',

  // Interior
  roomType: 'نوع الغرفة',
  furnitureStyle: 'أسلوب الأثاث',
  colorPalette: 'لوحة الألوان',
  lightingMood: 'مزاج الإضاءة',
  decorStyle: 'أسلوب الديكور',
  // Room type values
  living: 'صالة معيشة',
  bedroom: 'غرفة نوم',
  kitchen: 'مطبخ',
  bathroom: 'حمام',
  office: 'مكتب',
  retail: 'متجر',
  // Furniture style values
  modern: 'حديث',
  classic: 'كلاسيكي',
  minimalist: 'مينيمال',
  traditional: 'تقليدي',
  // Color palette values
  warm: 'دافئ',
  cool: 'بارد',
  colorPalette_neutral: 'محايد',
  bold: 'جريء',
  // Lighting mood values
  natural: 'طبيعي',
  artificial: 'صناعي',
  moody: 'خافت',
  // Decor style values
  maximalist: 'غني',
  industrial: 'صناعي',
  scandinavian: 'اسكندنافي',
}

export const MODIFIERS = {
  cameraAngle: {
    eyeLevel: 'Shot from human eye level, pedestrian perspective.',
    birdsEye: "Bird's eye view, top-down overhead angle.",
    drone: 'Aerial drone perspective, 45-degree angle from above.',
    street: 'Street-level ground perspective, looking up slightly.',
  },

  greenery: {
    none: 'No vegetation, bare paved or concrete surroundings.',
    some: 'A few trees and planted areas around the building.',
    lush: 'Lush green landscaping surrounding the building, garden setting.',
  },

  vehicles: {
    none: 'No vehicles visible in the scene.',
    some: 'Cars or SUVs parked in the driveway or street.',
  },

  people: {
    none: 'No people visible, empty scene.',
    some: 'A few people visible for scale — walking or standing.',
  },

  streetProps: {
    none: 'Clean surroundings, no street furniture.',
    minimal: 'Street lamps and a few benches nearby.',
    urban: 'Full urban context: street lamps, trees, benches, bins, and pedestrian infrastructure.',
  },

  timeOfDay: {
    morning: 'Soft morning sunlight, warm golden tones, long gentle shadows.',
    midday: 'Bright midday natural light, short sharp shadows, clear visibility.',
    goldenHour: 'Golden hour sunset lighting, warm amber tones, long dramatic shadows.',
    night: 'Night time scene, interior lights glowing through windows, dark exterior, subtle ambient light.',
  },

  weather: {
    clear: 'Clear sky, bright sunny day, crisp visibility.',
    overcast: 'Soft overcast diffused light, gentle shadows, even illumination.',
    rain: 'Wet atmosphere, rainy day, water droplets on surfaces, subtle reflections on ground and windows.',
  },

  mood: {
    neutral: 'Natural balanced appearance, accurate color representation.',
    vibrant: 'Vibrant saturated colors, lush greenery, energetic atmosphere.',
    calm: 'Calm and serene atmosphere, soft muted tones, peaceful setting.',
    dramatic: 'Dramatic shadows, high contrast, cinematic lighting, moody atmosphere.',
  },

  ground: {
    concrete: 'Concrete paved ground and pathways surrounding the building.',
    grass: 'Green grass lawn surrounding the building on all sides.',
    mixed: 'Mixed surfaces: paved areas and grass sections, garden-like setting.',
  },

  annotations: {
    true: 'Include numbered callout annotations with arrows pointing to key architectural features, labels in Arabic.',
    false: 'Clean render with no annotations, labels, or text overlays.',
  },

  // Interior modifiers (D-07)
  roomType: {
    living: 'Open-plan living room interior with comfortable seating and natural light.',
    bedroom: 'Cozy bedroom interior with bed, nightstands, and soft lighting.',
    kitchen: 'Modern kitchen interior with island, appliances, and functional layout.',
    bathroom: 'Contemporary bathroom interior with fixtures, tiles, and ambient lighting.',
    office: 'Professional home office interior with desk, shelving, and work setup.',
    retail: 'Retail store interior with display shelves, checkout area, and product displays.',
  },

  furnitureStyle: {
    modern: 'Modern contemporary furniture, clean lines, minimal ornamentation.',
    classic: 'Classic traditional furniture with ornate details, warm wood tones.',
    minimalist: 'Minimalist furniture with simple forms, neutral colors.',
    traditional: 'Traditional furniture with rich fabrics and classic silhouettes.',
  },

  colorPalette: {
    warm: 'Warm color palette with beiges, terracotta, warm woods, and amber tones.',
    cool: 'Cool color palette with blues, grays, silvers, and green undertones.',
    neutral: 'Neutral palette with whites, grays, natural woods, and soft beiges.',
    bold: 'Bold accent colors with saturated tones, dramatic contrasts.',
  },

  lightingMood: {
    natural: 'Natural daylight streaming through windows, bright and airy atmosphere.',
    artificial: 'Artificial LED lighting with warm or neutral color temperature.',
    moody: 'Moody low lighting, ambient atmosphere with dramatic shadows.',
  },

  decorStyle: {
    minimalist: 'Minimalist decor with few accessories, clean surfaces, uncluttered.',
    maximalist: 'Maximalist decor with rich textures, layers, and abundant accessories.',
    industrial: 'Industrial style with exposed materials, metal accents, raw finishes.',
    scandinavian: 'Scandinavian design with light woods, whites, and functional simplicity.',
  },
}

// ============================================================
// Prompt Assembly
// ============================================================

const CLOSING = 'High quality photorealistic render suitable for professional architectural presentation. No text, no watermarks, no labels.'

export function buildPrompt(options: RenderOptions): string {
  const { renderType, template, modifiers, referenceBuffers, customPrompt } = options

  const key = `${renderType}-${template}`
  const base = BASE_PROMPTS[key] ?? BASE_PROMPTS[`${renderType}_modern`]

  const parts: string[] = [base]

  if (modifiers.cameraAngle) {
    const val = MODIFIERS.cameraAngle[modifiers.cameraAngle]
    if (val) parts.push(val)
  }

  if (modifiers.greenery) {
    const val = MODIFIERS.greenery[modifiers.greenery]
    if (val) parts.push(val)
  }

  if (modifiers.vehicles) {
    const val = MODIFIERS.vehicles[modifiers.vehicles]
    if (val) parts.push(val)
  }

  if (modifiers.people) {
    const val = MODIFIERS.people[modifiers.people]
    if (val) parts.push(val)
  }

  if (modifiers.streetProps) {
    const val = MODIFIERS.streetProps[modifiers.streetProps]
    if (val) parts.push(val)
  }

  if (modifiers.timeOfDay) {
    const val = MODIFIERS.timeOfDay[modifiers.timeOfDay]
    if (val) parts.push(val)
  }

  if (modifiers.weather) {
    const val = MODIFIERS.weather[modifiers.weather]
    if (val) parts.push(val)
  }

  if (modifiers.mood) {
    const val = MODIFIERS.mood[modifiers.mood]
    if (val) parts.push(val)
  }

  if (modifiers.ground) {
    const val = MODIFIERS.ground[modifiers.ground]
    if (val) parts.push(val)
  }

  if (modifiers.annotations !== undefined) {
    parts.push(MODIFIERS.annotations[String(modifiers.annotations) as 'true' | 'false'])
  }

  // Interior modifiers (only applied when renderType='interior')
  if (renderType === 'interior') {
    if (modifiers.roomType) {
      const val = MODIFIERS.roomType[modifiers.roomType as RoomType]
      if (val) parts.push(val)
    }
    if (modifiers.furnitureStyle) {
      const val = MODIFIERS.furnitureStyle[modifiers.furnitureStyle as FurnitureStyle]
      if (val) parts.push(val)
    }
    if (modifiers.colorPalette) {
      const val = MODIFIERS.colorPalette[modifiers.colorPalette as ColorPalette]
      if (val) parts.push(val)
    }
    if (modifiers.lightingMood) {
      const val = MODIFIERS.lightingMood[modifiers.lightingMood as LightingMood]
      if (val) parts.push(val)
    }
    if (modifiers.decorStyle) {
      const val = MODIFIERS.decorStyle[modifiers.decorStyle as DecorStyle]
      if (val) parts.push(val)
    }
  }

  // Reference images — reference style from extra images, keep design from main image
  if (referenceBuffers && referenceBuffers.length > 0) {
    const refs = referenceBuffers.map((_, i) => `(Image ${i + 1})`).join(', ')
    parts.push(
      `Reference the architectural style, materials, and atmosphere from ${refs} while faithfully preserving the main design from (Image 0).`
    )
  }

  // User's custom prompt
  if (customPrompt?.trim()) {
    parts.push(customPrompt.trim())
  }

  // Selective editing mode — preserve original, only change specified element (D-12/D-13/D-14)
  if (options.selectiveEdit && customPrompt?.trim()) {
    parts.push(
      'Keep the original image exactly as-is. Only change the following element as specified. Do not alter anything else: ' +
      customPrompt.trim() +
      '. Preserve all other architectural elements, materials, colors, and composition unchanged.'
    )
  }

  return parts.join(' ') + '. ' + CLOSING
}

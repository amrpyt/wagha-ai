import { describe, it, expect } from 'vitest'
import { buildPrompt, getTemplateModifiers, MODIFIERS } from './prompts'
import type { RenderOptions } from './prompts'

function makeOptions(overrides: Partial<RenderOptions> = {}): RenderOptions {
  return {
    imageBuffers: [Buffer.from('fake')],
    renderType: 'exterior',
    template: 'modern',
    modifiers: {},
    ...overrides,
  }
}

describe('buildPrompt', () => {
  it('returns a non-empty string', () => {
    const result = buildPrompt(makeOptions())
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns non-empty prompt with closing quality requirement', () => {
    const result = buildPrompt(makeOptions({ renderType: 'exterior', template: 'modern' }))
    expect(result).toContain('High quality photorealistic render')
    expect(result).toContain('No text, no watermarks')
  })

  it('returns non-empty prompt for classic template', () => {
    const result = buildPrompt(makeOptions({ renderType: 'exterior', template: 'classic' }))
    expect(result).toContain('High quality photorealistic render')
  })

  it('adds cameraAngle modifier when set', () => {
    const result = buildPrompt(makeOptions({
      modifiers: { cameraAngle: 'birdsEye' },
    }))
    expect(result).toContain("Bird's eye view")
  })

  it('adds greenery modifier when set', () => {
    const result = buildPrompt(makeOptions({
      modifiers: { greenery: 'lush' },
    }))
    expect(result).toContain('Lush green landscaping')
  })

  it('adds timeOfDay modifier when set', () => {
    const result = buildPrompt(makeOptions({
      modifiers: { timeOfDay: 'goldenHour' },
    }))
    expect(result).toContain('Golden hour') // MODIFIERS uses capital G
  })

  it('adds weather modifier when set', () => {
    const result = buildPrompt(makeOptions({
      modifiers: { weather: 'rain' },
    }))
    expect(result).toContain('rain')
  })

  it('adds mood modifier when set', () => {
    const result = buildPrompt(makeOptions({
      modifiers: { mood: 'dramatic' },
    }))
    expect(result).toContain('Dramatic')
  })

  it('adds ground modifier when set', () => {
    const result = buildPrompt(makeOptions({
      modifiers: { ground: 'grass' },
    }))
    expect(result).toContain('grass')
  })

  it('adds annotations true modifier when set', () => {
    const result = buildPrompt(makeOptions({
      modifiers: { annotations: true },
    }))
    expect(result).toContain('callout')
  })

  it('does not add annotations text when annotations is false', () => {
    const result = buildPrompt(makeOptions({
      modifiers: { annotations: false },
    }))
    expect(result).not.toContain('callout annotations')
  })

  it('appends custom prompt at the end', () => {
    const result = buildPrompt(makeOptions({
      customPrompt: 'add a swimming pool',
    }))
    expect(result).toContain('swimming pool')
  })

  it('adds reference image instruction when referenceBuffers are present', () => {
    const result = buildPrompt(makeOptions({
      referenceBuffers: [Buffer.from('ref1'), Buffer.from('ref2')],
    }))
    expect(result).toContain('Reference the architectural style')
    expect(result).toContain('Image 1')
    expect(result).toContain('Image 2')
  })

  it('does not add reference instruction when no referenceBuffers', () => {
    const result = buildPrompt(makeOptions())
    expect(result).not.toContain('Reference the architectural style')
  })

  it('ends with the closing quality requirement', () => {
    const result = buildPrompt(makeOptions())
    expect(result).toContain('High quality photorealistic render')
    expect(result).toContain('No text, no watermarks')
  })

  it('falls back to exterior-modern for unknown template', () => {
    const result = buildPrompt(makeOptions({ template: 'unknown' as any }))
    expect(result).toContain('photorealistic')
  })

  it('combines multiple modifiers', () => {
    const result = buildPrompt(makeOptions({
      modifiers: {
        cameraAngle: 'drone',
        greenery: 'lush',
        timeOfDay: 'night',
        mood: 'dramatic',
      },
    }))
    expect(result).toContain('drone')
    expect(result.toLowerCase()).toContain('lush') // "Lush" with capital L
    expect(result).toContain('Night time') // MODIFIERS uses capital N
    expect(result).toContain('Dramatic') // MODIFIERS uses capital D
  })

  it('returns prompt with closing for interior template', () => {
    const result = buildPrompt(makeOptions({ renderType: 'interior', template: 'residential' }))
    expect(result).toContain('High quality photorealistic render')
    expect(result).toContain('No text, no watermarks')
    // base prompt should now be included (hyphen key fixed)
    expect(result).toContain('residential')
    expect(result).toContain('open-plan')
  })

  it('trims custom prompt whitespace', () => {
    const result = buildPrompt(makeOptions({ customPrompt: '  add a garden  ' }))
    expect(result).toContain('add a garden')
    expect(result).not.toContain('  ')
  })

  it('ignores empty custom prompt', () => {
    const result = buildPrompt(makeOptions({ customPrompt: '   ' }))
    expect(result).not.toContain('undefined')
  })
})

describe('getTemplateModifiers', () => {
  it('returns exterior-modern defaults', () => {
    const mods = getTemplateModifiers('exterior', 'modern')
    expect(mods.cameraAngle).toBe('eyeLevel')
    expect(mods.greenery).toBe('some')
    expect(mods.timeOfDay).toBe('goldenHour')
    expect(mods.mood).toBe('neutral')
    expect(mods.ground).toBe('concrete')
    expect(mods.annotations).toBe(false)
  })

  it('returns exterior-classic defaults', () => {
    const mods = getTemplateModifiers('exterior', 'classic')
    expect(mods.ground).toBe('grass')
    expect(mods.streetProps).toBe('minimal')
    expect(mods.timeOfDay).toBe('goldenHour')
  })

  it('returns exterior-villa defaults', () => {
    const mods = getTemplateModifiers('exterior', 'villa')
    expect(mods.greenery).toBe('lush')
    expect(mods.vehicles).toBe('some')
    expect(mods.people).toBe('some')
    expect(mods.mood).toBe('vibrant')
  })

  it('returns exterior-commercial defaults', () => {
    const mods = getTemplateModifiers('exterior', 'commercial')
    expect(mods.greenery).toBe('none')
    expect(mods.vehicles).toBe('some')
    expect(mods.streetProps).toBe('urban')
    expect(mods.cameraAngle).toBe('street')
  })

  it('returns exterior-landscape defaults', () => {
    const mods = getTemplateModifiers('exterior', 'landscape')
    expect(mods.greenery).toBe('lush')
    expect(mods.cameraAngle).toBe('birdsEye')
    expect(mods.weather).toBe('overcast')
    expect(mods.mood).toBe('calm')
  })

  it('returns interior-residential defaults', () => {
    const mods = getTemplateModifiers('interior', 'residential')
    // INTERIOR_MODIFIERS.residential doesn't set greenery/people/timeOfDay explicitly
    // so they fall through to defaults in RenderModifiers interface
    expect(mods.roomType).toBe('living')
    expect(mods.furnitureStyle).toBe('modern')
  })

  it('falls back to exterior-modern for unknown exterior template', () => {
    const mods = getTemplateModifiers('exterior', 'unknown' as any)
    expect(mods.cameraAngle).toBe('eyeLevel')
    expect(mods.greenery).toBe('some')
  })

  it('falls back to interior-residential for unknown interior template', () => {
    const mods = getTemplateModifiers('interior', 'unknown' as any)
    // Falls back to residential which doesn't set greenery/people/timeOfDay
    expect(mods.roomType).toBe('living')
    expect(mods.furnitureStyle).toBe('modern')
  })

  it('all exterior templates have annotations: false', () => {
    const templates: Array<'modern' | 'classic' | 'minimal' | 'villa' | 'commercial' | 'landscape'> = [
      'modern', 'classic', 'minimal', 'villa', 'commercial', 'landscape',
    ]
    for (const t of templates) {
      const mods = getTemplateModifiers('exterior', t)
      expect(mods.annotations).toBe(false)
    }
  })
})

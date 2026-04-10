import { describe, it, expect } from 'vitest'
import { validateMagicBytes, validateFile } from './validation'

describe('validateMagicBytes', () => {
  it('returns true for JPEG magic bytes', () => {
    const jpegBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46])
    expect(validateMagicBytes(jpegBytes, 'image/jpeg')).toBe(true)
  })

  it('returns true for PNG magic bytes', () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    expect(validateMagicBytes(pngBytes, 'image/png')).toBe(true)
  })

  it('returns true for PDF magic bytes', () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34])
    expect(validateMagicBytes(pdfBytes, 'application/pdf')).toBe(true)
  })

  it('returns false for mismatched type', () => {
    const jpegBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46])
    expect(validateMagicBytes(jpegBytes, 'image/png')).toBe(false)
  })

  it('returns false for unknown MIME type', () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07])
    expect(validateMagicBytes(bytes, 'image/webp')).toBe(false)
  })

  it('returns false for short byte array', () => {
    const shortBytes = new Uint8Array([0xFF, 0xD8])
    expect(validateMagicBytes(shortBytes, 'image/jpeg')).toBe(false)
  })

  it('returns false for non-matching bytes', () => {
    const wrongBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    expect(validateMagicBytes(wrongBytes, 'image/jpeg')).toBe(false)
  })
})

describe('validateFile', () => {
  it('returns valid for a small JPEG', () => {
    const file = { size: 1024, type: 'image/jpeg' } as File
    expect(validateFile(file)).toEqual({ valid: true })
  })

  it('returns error for file over 10MB', () => {
    const file = { size: 11 * 1024 * 1024, type: 'image/jpeg' } as File
    expect(validateFile(file)).toEqual({ valid: false, error: 'حجم الملف يتجاوز 10MB' })
  })

  it('returns error for unsupported MIME type', () => {
    const file = { size: 1024, type: 'image/webp' } as File
    expect(validateFile(file)).toEqual({ valid: false, error: 'نوع الملف غير مدعوم — JPG أو PNG أو PDF فقط' })
  })

  it('returns valid for PNG file under 10MB', () => {
    const file = { size: 5 * 1024 * 1024, type: 'image/png' } as File
    expect(validateFile(file)).toEqual({ valid: true })
  })

  it('returns valid for PDF file at exactly 10MB', () => {
    const file = { size: 10 * 1024 * 1024, type: 'application/pdf' } as File
    expect(validateFile(file)).toEqual({ valid: true })
  })

  it('returns error for file at exactly 10MB + 1 byte', () => {
    const file = { size: 10 * 1024 * 1024 + 1, type: 'image/jpeg' } as File
    expect(validateFile(file)).toEqual({ valid: false, error: 'حجم الملف يتجاوز 10MB' })
  })
})

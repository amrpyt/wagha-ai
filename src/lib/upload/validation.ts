const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
}

export function validateMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  const sigs = MAGIC_BYTES[mimeType]
  if (!sigs) return false
  return sigs.some((sig) => sig.every((b, i) => bytes[i] === b))
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'حجم الملف يتجاوز 10MB' }
  }
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم — JPG أو PNG أو PDF فقط' }
  }
  return { valid: true }
}

export { MAX_SIZE_BYTES }

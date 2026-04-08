import { EXTERIOR_RENDER_PROMPT } from './prompts'

const NANOBANANA_API_URL = process.env.NANOBANANA_API_URL || 'https://api.nanobanana.example/v1/exterior'
const NANOBANANA_API_KEY = process.env.NANOBANANA_API_KEY || ''
const TIMEOUT_MS = 120_000

interface GenerationOptions {
  imageBuffer: Buffer
  signal?: AbortSignal
  onProgress?: (progress: number, status: string) => void
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; maxDelayMs?: number } = {}
): Promise<T> {
  const { maxRetries = 5, baseDelayMs = 1000, maxDelayMs = 30000 } = options
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const is429 = error instanceof Error && error.message.includes('429')
      const isRetryable = is429 || error instanceof TypeError
      if (!isRetryable || attempt === maxRetries) throw error
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)
      const jitter = delay * 0.25 * (Math.random() * 2 - 1)
      await new Promise((r) => setTimeout(r, delay + jitter))
    }
  }
  throw new Error('unreachable')
}

export async function generateExteriorRender(
  options: GenerationOptions
): Promise<Buffer> {
  const { imageBuffer, signal, onProgress } = options

  onProgress?.(10, 'uploading')

  const formData = new FormData()
  formData.append('image', new Blob([imageBuffer], { type: 'image/jpeg' }), 'input.jpg')
  formData.append('prompt', EXTERIOR_RENDER_PROMPT)
  formData.append('resolution', '1024')

  onProgress?.(25, 'generating')

  const response = await fetchWithRetry(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      // If caller passed a signal, wire it to our controller
      if (signal) {
        signal.addEventListener('abort', () => controller.abort())
      }

      try {
        const res = await fetch(NANOBANANA_API_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${NANOBANANA_API_KEY}` },
          body: formData,
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!res.ok) {
          if (res.status === 429) throw new Error('429: Rate limit exceeded')
          throw new Error(`API error: ${res.status} ${res.statusText}`)
        }
        return res
      } catch (e) {
        clearTimeout(timeoutId)
        throw e
      }
    },
    { maxRetries: 5, baseDelayMs: 1000, maxDelayMs: 30000 }
  )

  onProgress?.(75, 'processing')

  const arrayBuffer = await response.arrayBuffer()
  const resultBuffer = Buffer.from(arrayBuffer)

  onProgress?.(100, 'complete')
  return resultBuffer
}

import { EXTERIOR_RENDER_PROMPT } from './prompts'

const PYTHON_GEMINI_URL = process.env.PYTHON_GEMINI_URL || 'http://localhost:8000'
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

  if (!PYTHON_GEMINI_URL) {
    throw new Error('PYTHON_GEMINI_URL environment variable is not set')
  }

  onProgress?.(10, 'uploading')

  const base64Image = imageBuffer.toString('base64')

  onProgress?.(25, 'generating')

  const response = await fetchWithRetry(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      if (signal) {
        signal.addEventListener('abort', () => controller.abort())
      }

      try {
        const res = await fetch(`${PYTHON_GEMINI_URL}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: EXTERIOR_RENDER_PROMPT,
            image_base64: base64Image,
          }),
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!res.ok) {
          if (res.status === 429) throw new Error('429: Rate limit exceeded')
          const text = await res.text()
          throw new Error(`API error ${res.status} ${res.statusText}: ${text}`)
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

  const json = await response.json()
  const resultBuffer = Buffer.from(json.image_base64, 'base64')

  onProgress?.(100, 'complete')
  return resultBuffer
}

import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  RenderOptions,
  buildPrompt,
} from './prompts'

const TIMEOUT_MS = 120_000

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

export async function generateRender(
  options: RenderOptions
): Promise<Buffer> {
  const { imageBuffers, referenceBuffers, signal, onProgress } = options

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-image-preview' })

  // Build the text prompt from options
  const textPrompt = buildPrompt(options)

  // Assemble all image parts — first image is the main input, rest are references
  const imageParts = imageBuffers.map((buf, i) => ({
    inlineData: {
      data: buf.toString('base64'),
      mimeType: 'image/jpeg',
    },
  }))

  // Reference images come after the main image
  if (referenceBuffers && referenceBuffers.length > 0) {
    const refParts = referenceBuffers.map((buf) => ({
      inlineData: {
        data: buf.toString('base64'),
        mimeType: 'image/jpeg',
      },
    }))
    imageParts.push(...refParts)
  }

  onProgress?.(10, 'uploading')

  const result = await fetchWithRetry(
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

      if (signal) {
        signal.addEventListener('abort', () => controller.abort())
      }

      try {
        const response = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                ...imageParts,
                { text: textPrompt },
              ],
            },
          ],
        })
        clearTimeout(timeoutId)
        return response
      } catch (e) {
        clearTimeout(timeoutId)
        throw e
      }
    },
    { maxRetries: 5, baseDelayMs: 1000, maxDelayMs: 30000 }
  )

  onProgress?.(75, 'processing')

  const response = result.response
  const imageResultParts = response.candidates
    ?.flatMap((c) => c.content.parts)
    ?.filter((p) => p.inlineData?.data)

  if (!imageResultParts || imageResultParts.length === 0) {
    const text = response.text()
    throw new Error(`No image generated. Model response: ${text}`)
  }

  const resultBuffer = Buffer.from(
    imageResultParts[0].inlineData!.data,
    'base64'
  )

  onProgress?.(100, 'complete')
  return resultBuffer
}

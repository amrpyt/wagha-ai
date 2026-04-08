import sharp from 'sharp'
import * as pdfjsLib from 'pdfjs-dist'
import { saveUploadedFile } from './storage'

// Initialize pdfjs-dist worker from CDN (must be done before any parse call)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

async function pdfPageToImage(pdfBuffer: Buffer, pageNum = 1): Promise<Buffer> {
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = new OffscreenCanvas(Math.floor(viewport.width), Math.floor(viewport.height))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = canvas.getContext('2d') as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.render({ canvas, viewport } as any).promise
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 })
  return Buffer.from(await blob.arrayBuffer())
}

async function normalizeImage(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata()
  // If CMYK (4 channels with cmyk colorspace), convert to sRGB
  const image = meta.space === 'cmyk'
    ? sharp(buffer).toColorspace('srgb')
    : sharp(buffer)
  return image.toFormat('jpeg', { quality: 95 }).toBuffer()
}

export async function processUploadedFile(
  buffer: Buffer,
  mimeType: string
): Promise<{ filename: string; path: string }> {
  let processedBuffer: Buffer
  if (mimeType === 'application/pdf') {
    // Convert first page of PDF to JPEG, then normalize
    const pageImage = await pdfPageToImage(buffer)
    processedBuffer = await normalizeImage(pageImage)
  } else {
    // Normalize image (CMYK -> RGB, ensure 8-bit JPEG)
    processedBuffer = await normalizeImage(buffer)
  }
  return saveUploadedFile(processedBuffer, 'image/jpeg')
}

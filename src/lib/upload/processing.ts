import sharp from 'sharp'
import { saveUploadedFile } from './storage'

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
  if (mimeType === 'application/pdf') {
    // PDF processing requires pdfjs-dist + canvas (DOMMatrix) which is browser-only.
    // For now, reject PDFs at upload time. TODO: implement server-safe PDF→image conversion.
    throw new Error('PDF processing is not yet available. Please upload a JPG or PNG image.')
  }
  // Normalize image (CMYK -> RGB, ensure 8-bit JPEG)
  const processedBuffer = await normalizeImage(buffer)
  return saveUploadedFile(processedBuffer, 'image/jpeg')
}

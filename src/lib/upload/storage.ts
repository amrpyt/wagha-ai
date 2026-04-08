import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export async function saveUploadedFile(
  buffer: Buffer,
  mimeType: string
): Promise<{ filename: string; path: string }> {
  await mkdir(UPLOAD_DIR, { recursive: true })
  const ext = mimeType === 'application/pdf' ? 'jpg' : 'jpeg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const filepath = join(UPLOAD_DIR, filename)
  await writeFile(filepath, buffer)
  return { filename, path: `/uploads/${filename}` }
}

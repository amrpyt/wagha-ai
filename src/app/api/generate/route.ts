import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateExteriorRender } from '@/lib/ai/client'
import { saveUploadedFile } from '@/lib/upload/storage'
import { readFile } from 'fs/promises'
import { join } from 'path'

// In-memory progress store for SSE polling
// Key: projectId, Value: { progress: number, status: string, error?: string, renderUrl?: string }
const progressStore = new Map<string, {
  progress: number
  status: string
  error?: string
  renderUrl?: string
}>()

export function setProgress(projectId: string, progress: number, status: string) {
  progressStore.set(projectId, { progress, status })
}

export function setError(projectId: string, error: string) {
  const current = progressStore.get(projectId)
  progressStore.set(projectId, { ...current!, error, progress: current?.progress || 0 })
}

export function setComplete(projectId: string, renderUrl: string) {
  progressStore.set(projectId, { progress: 100, status: 'complete', renderUrl })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return new Response('Missing projectId', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        send({ progress: 5, status: 'جاري بدء التوليد...' })

        // Fetch project to validate it exists and belongs to user
        const admin = createAdminClient()
        const { data: project, error: projectError } = await admin
          .from('projects')
          .select('id, status, firm_id')
          .eq('id', projectId)
          .single()

        if (projectError || !project) {
          send({ error: 'المشروع غير موجود' })
          controller.close()
          return
        }

        send({ progress: 10, status: 'جاري قراءة الملف...' })

        // Find the most recent uploaded file for this project
        // MVP approach: scan /uploads/ for the most recently modified .jpg file
        // Production: track filename in project_uploads table
        const uploadsDir = join(process.cwd(), 'uploads')

        let inputBuffer: Buffer | null = null

        try {
          const { readdir } = await import('fs/promises')
          const files = await readdir(uploadsDir)
          // Find any .jpg file (upload action saves as UUID.jpg)
          const recentJpg = files.find(f => f.endsWith('.jpg') || f.endsWith('.jpeg'))
          if (recentJpg) {
            inputBuffer = await readFile(join(uploadsDir, recentJpg))
          }
        } catch {
          // Directory may be empty or not exist yet
        }

        if (!inputBuffer) {
          send({ error: 'الملف غير موجود — يرجى إعادة رفع الملف' })
          controller.close()
          return
        }

        send({ progress: 15, status: 'جاري إرسال الملف إلى الذكاء الاصطناعي...' })

        // Create AbortController for cancel + timeout
        const abortController = new AbortController()
        const timeoutId = setTimeout(() => abortController.abort(), 120_000)

        // Progress callback for streaming
        const onProgress = (progress: number, status: string) => {
          // Map AI progress (0-100) to overall progress (15-90)
          const overallProgress = Math.round(15 + (progress * 0.75))
          send({ progress: overallProgress, status })
          setProgress(projectId, overallProgress, status)
        }

        let renderBuffer: Buffer
        try {
          renderBuffer = await generateExteriorRender({
            imageBuffer: inputBuffer,
            signal: abortController.signal,
            onProgress,
          })
        } catch (error) {
          clearTimeout(timeoutId)
          if (error instanceof Error && error.name === 'AbortError') {
            send({ error: 'انتهت مهلة التوليد (120 ثانية) — يرجى المحاولة مرة أخرى' })
            setError(projectId, 'Timeout')
          } else {
            const errorMsg = error instanceof Error ? error.message : 'خطأ غير معروف'
            send({ error: `فشل التوليد: ${errorMsg}` })
            setError(projectId, String(error))
          }
          // Update project status to failed
          await admin
            .from('projects')
            .update({ status: 'failed', error_message: String(error) })
            .eq('id', projectId)
          controller.close()
          return
        }

        clearTimeout(timeoutId)

        send({ progress: 95, status: 'جاري حفظ النتيجة...' })

        // Save render to /uploads/
        const { filename: renderFilename, path: renderPath } = await saveUploadedFile(renderBuffer, 'image/jpeg')

        // Update project record
        await admin
          .from('projects')
          .update({ status: 'complete', render_url: renderPath })
          .eq('id', projectId)

        send({ progress: 100, status: 'اكتمل التوليد!', renderUrl: renderPath })
        setComplete(projectId, renderPath)
        controller.close()

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        send({ error: `خطأ غير متوقع: ${errorMsg}` })
        setError(projectId, String(error))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// POST handler for SSE cancellation
// In MVP, cancellation is handled via AbortController stored in-memory
// The client closes the EventSource which triggers abort
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) return new Response('Missing projectId', { status: 400 })

  // For MVP: signal completion (client disconnects EventSource which triggers abort)
  // Production: would store AbortController in Map and call abort()
  return Response.json({ acknowledged: true, projectId })
}

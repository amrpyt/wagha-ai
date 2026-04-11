'use server'

import { createClient, getUserFromCookie } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { validateMagicBytes, validateFile, MAX_SIZE_BYTES } from '@/lib/upload/validation'
import { processUploadedFile } from '@/lib/upload/processing'
import { saveUploadedFile } from '@/lib/upload/storage'
import type { Database } from '@/types/database.types'
import type { UploadState } from '@/types/upload'

export async function uploadAndGenerate(
  prevState: UploadState,
  formData: FormData
): Promise<UploadState> {
  // Decode JWT from cookie directly — bypasses auth-js getUser() which has Bearer null bug
  const user = await getUserFromCookie()
  if (!user) return { error: 'غير مصرح' }

  // Get firm membership
  const supabase = await createClient()
  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single() as { data: { firm_id: string } | null }
  if (!firmMember) return { error: 'ليست عضو في شركة' }

  // Extract form fields
  const file = formData.get('file') as File | null
  const projectName = (formData.get('projectName') as string | null)?.trim()
  const projectNumber = (formData.get('projectNumber') as string | null)?.trim() || null

  if (!file) return { error: 'لم يتم اختيار ملف' }
  if (!projectName) return { error: 'اسم المشروع مطلوب' }

  // Validate file size and MIME type
  const fileValidation = validateFile(file)
  if (!fileValidation.valid) return { error: fileValidation.error! }

  // Validate magic bytes (actual file content)
  const headerBytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  if (!validateMagicBytes(headerBytes, file.type)) {
    return { error: 'نوع الملف غير صالح — الملف تالف أو تم تغيير امتداده' }
  }

  // Process and store uploaded file (normalize image)
  const buffer = Buffer.from(await file.arrayBuffer())
  const { filename: inputFilename, path: inputPath } = await processUploadedFile(buffer, file.type)

  // Create project record in 'processing' state
  const admin = createAdminClient()
  const { data: project, error: projectError } = await admin
    .from('projects')
    .insert({
      firm_id: firmMember.firm_id,
      name: projectName,
      project_number: projectNumber,
      status: 'processing',
      created_by: user.id,
      input_urls: [inputPath],
    })
    .select('id')
    .single()

  if (projectError || !project) {
    return { error: 'فشل إنشاء المشروع' }
  }

  revalidatePath('/dashboard')
  return { success: true, projectId: project.id }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { processUploadedFile } from '@/lib/upload/processing'
import { validateFile } from '@/lib/upload/validation'
import type { Database } from '@/lib/supabase/database.types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Get firm membership
    type FirmMemberRow = Database['public']['Tables']['firm_members']['Row']
    const { data: firmMember } = await supabase
      .from('firm_members')
      .select('firm_id')
      .eq('user_id', user.id)
      .single() as { data: FirmMemberRow | null }
    if (!firmMember) {
      return NextResponse.json({ error: 'ليست عضو في شركة' }, { status: 403 })
    }

    const formData = await request.formData()

    const file = formData.get('file') as File | null
    const projectName = (formData.get('projectName') as string | null)?.trim() || 'مشروع جديد'
    const projectNumber = (formData.get('projectNumber') as string | null)?.trim() || null
    const renderType = (formData.get('renderType') as string || 'exterior') as 'exterior' | 'interior'
    const template = (formData.get('template') as string || 'modern')
    const modifiersRaw = formData.get('modifiers') as string | null
    const customPrompt = (formData.get('customPrompt') as string | null)?.trim() || null

    let modifiers: Record<string, unknown> = {}
    if (modifiersRaw) {
      try {
        modifiers = JSON.parse(modifiersRaw)
      } catch {
        modifiers = {}
      }
    }

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 })
    }

    // Validate file
    const fileValidation = validateFile(file)
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 })
    }

    // Process and store uploaded file
    const buffer = Buffer.from(await file.arrayBuffer())
    const { filename: inputFilename, path: inputPath } = await processUploadedFile(buffer, file.type)

    // Create project record
    const admin = createAdminClient()
    type ProjectsInsert = Database['public']['Tables']['projects']['Insert']
    const { data: project, error: projectError } = await admin
      .from('projects')
      .insert({
        firm_id: firmMember.firm_id,
        name: projectName,
        project_number: projectNumber,
        status: 'processing',
        created_by: user.id,
        render_type: renderType,
        template,
        modifiers,
        custom_prompt: customPrompt,
        input_urls: [inputPath],
      } as ProjectsInsert)
      .select('id')
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'فشل إنشاء المشروع' }, { status: 500 })
    }

    return NextResponse.json({ projectId: project.id })
  } catch (error) {
    console.error('Project create error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطأ غير معروف' },
      { status: 500 }
    )
  }
}

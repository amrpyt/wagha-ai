'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project } from '@/types/database.types'

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get user's firm
  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single() as { data: { firm_id: string } | null }

  if (!firmMember) return []

  // Query projects for this firm (RLS will enforce)
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*, folders(name)')
    .eq('firm_id', firmMember.firm_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return projects || []
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: project, error } = await supabase
    .from('projects')
    .select('*, folders(name)')
    .eq('id', id)
    .single() as { data: (Project & { folders: { name: string } }) | null; error: null }

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return project
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id) as unknown as { error: { message: string } | null }

  if (error) {
    return { success: false, error: 'فشل حذف المشروع' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/projects')
  return { success: true }
}

interface CreateProjectInput {
  name: string
  projectNumber?: string
  folderId?: string
}

export async function createProject(
  data: CreateProjectInput
): Promise<{ success: boolean; project?: Project; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'غير مصرح' }
  }

  // Get user's firm
  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single() as { data: { firm_id: string } | null }

  if (!firmMember) {
    return { success: false, error: 'ليست عضو في شركة' }
  }

  const { data: project, error } = await (supabase.from('projects') as any)
    .insert({
      firm_id: firmMember.firm_id,
      name: data.name,
      project_number: data.projectNumber || null,
      folder_id: data.folderId || null,
      status: 'pending',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: 'فشل إنشاء المشروع' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/projects')
  return { success: true, project: project ?? undefined }
}

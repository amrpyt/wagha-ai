'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database.types'
import type { FirmMember, Invitation } from '@/types/database.types'
import { createAdminClient } from '@/lib/supabase/admin'

type FirmMemberRow = Database['public']['Tables']['firm_members']['Row']
type FirmRow = Database['public']['Tables']['firms']['Row']
type InvitationRow = Database['public']['Tables']['invitations']['Row']

type SettingsState = { success?: boolean; error?: string; needsVerification?: boolean }

// ================================================
// ACCOUNT SETTINGS
// ================================================
export async function updateAccount(
  prevState: SettingsState | undefined,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'غير مصرح' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string

  const updates: { data?: { full_name?: string }; email?: string } = {}

  if (name) {
    updates.data = { full_name: name }
  }

  if (email && email !== user.email) {
    const { error } = await supabase.auth.updateUser({
      email,
    })

    if (error) {
      return { error: error.message }
    }
    return { success: true, needsVerification: true }
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.auth.updateUser(updates)
    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function changePassword(
  prevState: SettingsState | undefined,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string

  if (newPassword.length < 8) {
    return { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return { error: 'غير مصرح' }
  }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'كلمة المرور الحالية غير صحيحة' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// ================================================
// FIRM SETTINGS
// ================================================
export async function updateFirm(
  prevState: SettingsState | undefined,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'غير مصرح' }
  }

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id, role')
    .eq('user_id', user.id)
    .single() as { data: FirmMemberRow | null }

  if (!firmMember) {
    return { error: 'ليست عضو في شركة' }
  }

  if (firmMember.role !== 'admin') {
    return { error: 'فقط المشرف يمكنه تحديث إعدادات الشركة' }
  }

  const name = formData.get('name') as string
  const brandColor = formData.get('brandColor') as string
  const logoUrl = formData.get('logoUrl') as string | null

  const updates: Record<string, string> = {}
  if (name) updates.name = name
  if (brandColor) updates.brand_color = brandColor
  if (logoUrl !== null) updates.logo_url = logoUrl

  const { error } = await supabase
    .from('firms')
    .update(updates as never)
    .eq('id', firmMember.firm_id)

  if (error) {
    return { error: 'فشل تحديث إعدادات الشركة' }
  }

  revalidatePath('/settings')
  revalidatePath('/settings/firm')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function uploadLogo(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'غير مصرح' }
  }

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single() as { data: FirmMemberRow | null }

  if (!firmMember) {
    return { success: false, error: 'ليست عضو في شركة' }
  }

  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'يجب أن يكون الملف صورة' }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: 'حجم الملف يجب أن يكون أقل من 2 ميجابايت' }
  }

  const ext = file.name.split('.').pop()
  const filename = `${firmMember.firm_id}/logo-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('firm-logos')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    return { success: false, error: 'فشل رفع الشعار' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('firm-logos')
    .getPublicUrl(filename)

  return { success: true, url: publicUrl }
}

// ================================================
// TEAM INVITES
// ================================================
export async function inviteTeamMember(
  prevState: SettingsState | undefined,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'غير مصرح' }
  }

  const email = formData.get('email') as string
  const role = (formData.get('role') as string) || 'member'

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id, role')
    .eq('user_id', user.id)
    .single() as { data: FirmMemberRow | null }

  if (!firmMember || firmMember.role !== 'admin') {
    return { error: 'فقط المشرف يمكنه دعوة أعضاء الفريق' }
  }

  // Generate invite token
  const token = crypto.randomUUID()

  const { error: inviteError } = await supabase
    .from('invitations')
    .insert({
      firm_id: firmMember.firm_id,
      email,
      role: role as 'admin' | 'member',
      invited_by: user.id,
      token,
    } as never)

  if (inviteError) {
    return { error: 'فشل إرسال الدعوة' }
  }

  // Send invite email
  const adminClient = createAdminClient()
  const { error: authError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: {
      firm_id: firmMember.firm_id,
      role,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/invite/accept?token=${token}`,
  })

  if (authError) {
    await supabase.from('invitations').delete().eq('token', token)
    return { error: 'فشل إرسال البريد الإلكتروني للدعوة' }
  }

  revalidatePath('/settings/team')
  return { success: true }
}

type TeamMember = FirmMember & { auth: { users: { email: string } } }

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single() as { data: FirmMemberRow | null }

  if (!firmMember) return []

  const { data: members } = await supabase
    .from('firm_members')
    .select('*, auth.users(email)')
    .eq('firm_id', firmMember.firm_id) as { data: FirmMemberRow[] | null }

  return (members || []) as unknown as TeamMember[]
}

export async function getInvitations(): Promise<Invitation[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single() as { data: FirmMemberRow | null }

  if (!firmMember) return []

  const { data: invitations } = await supabase
    .from('invitations')
    .select('*')
    .eq('firm_id', firmMember.firm_id)
    .eq('status', 'pending') as { data: InvitationRow[] | null }

  return invitations || []
}

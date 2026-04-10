'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type AuthState = { error?: string; success?: boolean; needsVerification?: boolean } | undefined

// ================================================
// SIGN UP - creates user + firm + firm_member
// ================================================
export async function signUp(prevState: AuthState, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firmName = formData.get('firmName') as string

  // Validate inputs
  if (!email || !password || !firmName) {
    return { error: 'جميع الحقول مطلوبة' }
  }

  if (password.length < 8) {
    return { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }
  }

  if (!email.includes('@')) {
    return { error: 'البريد الإلكتروني غير صالح' }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firm_name: firmName,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'فشل إنشاء الحساب' }
  }

  // Create firm record using admin client (bypasses RLS - user has no session yet after signup)
  // Note: Requires SUPABASE_SERVICE_ROLE_KEY in env
  let firmId: string | null = null
  try {
    const admin = createAdminClient()
    const { data: firm, error: firmError } = await admin
      .from('firms')
      .insert({
        name: firmName,
        owner_id: authData.user.id,
        brand_color: '#1E3A5F',
      })
      .select('id')
      .single()

    if (firmError) {
      await admin.auth.admin.deleteUser(authData.user.id)
      return { error: 'فشل إنشاء الشركة' }
    }
    firmId = firm?.id ?? null

    // Add user as admin firm_member
    await admin.from('firm_members').insert({
      firm_id: firmId,
      user_id: authData.user.id,
      role: 'admin',
    })
  } catch (err) {
    console.error('Signup firm creation error:', err)
    return { error: 'فشل إنشاء الشركة' }
  }

  // Supabase sends verification email automatically
  return { success: true, needsVerification: true }
}

// ================================================
// SIGN IN
// ================================================
export async function signIn(prevState: AuthState, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ================================================
// SIGN OUT
// ================================================
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
  redirect('/login')
}

// ================================================
// RESET PASSWORD
// ================================================
export async function resetPassword(prevState: AuthState, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    return { error: 'البريد الإلكتروني مطلوب' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/confirm`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// ================================================
// VERIFY EMAIL (backup for manual token verification)
// ================================================
export async function verifyEmail(email: string, token: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    type: 'email',
    email,
    token,
  })

  if (error) {
    return { error: 'فشل التحقق من البريد الإلكتروني' }
  }

  return { success: true }
}

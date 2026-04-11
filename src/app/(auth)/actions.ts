'use server'

import { createClient, setSessionCookies } from '@/lib/supabase/server'
import { createAdminClient, createUserWithSession, signInWithPassword } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type AuthState = { error?: string; success?: boolean; needsVerification?: boolean } | undefined

// ================================================
// SIGN UP - creates user + firm + firm_member
// Uses direct GoTrue API to bypass auth-js Bearer-null bug
// ================================================
export async function signUp(prevState: AuthState, formData: FormData) {
  const admin = createAdminClient()

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

  // Create user and session via direct GoTrue API (bypasses auth-js Bearer null bug)
  let authResult: Awaited<ReturnType<typeof createUserWithSession>>
  try {
    authResult = await createUserWithSession(email, password, { firm_name: firmName })
  } catch (err) {
    console.error('createUserWithSession error:', err)
    return { error: 'فشل إنشاء الحساب' }
  }

  const { user, session } = authResult

  if (!session || !session.access_token) {
    return { error: 'فشل إنشاء الجلسة' }
  }

  // Create firm record using admin client (bypasses RLS)
  let firmId: string | null = null
  try {
    const { data: firm, error: firmError } = await admin
      .from('firms')
      .insert({
        name: firmName,
        owner_id: user.id,
        brand_color: '#1E3A5F',
      })
      .select('id')
      .single()

    if (firmError) {
      // Try to delete the user we just created
      await admin.auth.admin.deleteUser(user.id)
      return { error: 'فشل إنشاء الشركة' }
    }
    firmId = firm?.id ?? null

    // Add user as admin firm_member
    await admin.from('firm_members').insert({
      firm_id: firmId,
      user_id: user.id,
      role: 'admin',
    })
  } catch (err) {
    console.error('Signup firm creation error:', err)
    return { error: 'فشل إنشاء الشركة' }
  }

  // Set session cookies directly (bypasses auth-js setSession which has Bearer null bug)
  await setSessionCookies(session.access_token, session.refresh_token)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ================================================
// SIGN IN
// ================================================
export async function signIn(prevState: AuthState, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }
  }

  let session: { access_token: string; refresh_token: string }
  try {
    session = await signInWithPassword(email, password)
  } catch {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
  }

  if (!session?.access_token) {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
  }

  // Set session cookies directly
  await setSessionCookies(session.access_token, session.refresh_token)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ================================================
// SIGN OUT
// ================================================
export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.set('supabase.auth.token', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  })
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

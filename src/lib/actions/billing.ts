'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createPaymobOrder as createPaymobOrderClient, verifyPaymobWebhook } from '@/lib/paymob/client'
import type { Subscription } from '@/types/database.types'
import { PLANS } from '@/lib/billing-plans'

// ================================================
// SUBSCRIPTION MANAGEMENT
// ================================================
export async function getSubscription(): Promise<Subscription | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single()

  if (!firmMember) return null

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('firm_id', firmMember.firm_id)
    .single()

  return subscription
}

export async function checkRenderAccess(): Promise<{
  allowed: boolean
  reason?: string
  subscription?: Subscription | null
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { allowed: false, reason: 'غير مصرح' }
  }

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single()

  if (!firmMember) {
    return { allowed: false, reason: 'ليست عضو في شركة' }
  }

  // Check if free render was used
  const { data: firm } = await supabase
    .from('firms')
    .select('free_render_used')
    .eq('id', firmMember.firm_id)
    .single()

  if (!firm?.free_render_used) {
    // First render is free - mark it as used
    await supabase
      .from('firms')
      .update({ free_render_used: true })
      .eq('id', firmMember.firm_id)

    return { allowed: true, subscription: null }
  }

  // Check active subscription
  const subscription = await getSubscription()

  if (!subscription || subscription.status !== 'active') {
    return {
      allowed: false,
      reason: 'upgrade_required',
      subscription,
    }
  }

  if (subscription.credits_remaining <= 0) {
    return {
      allowed: false,
      reason: 'no_credits',
      subscription,
    }
  }

  return { allowed: true, subscription }
}

export async function deductCredit(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'غير مصرح' }

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single()

  if (!firmMember) return { success: false, error: 'ليست عضو في شركة' }

  // Atomically deduct credit (race condition prevention)
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('credits_remaining')
    .eq('firm_id', firmMember.firm_id)
    .eq('status', 'active')
    .single()

  if (!sub || sub.credits_remaining <= 0) {
    return { success: false, error: 'لا يوجد رصيد متبقي' }
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({ credits_remaining: sub.credits_remaining - 1 })
    .eq('firm_id', firmMember.firm_id)
    .eq('credits_remaining', sub.credits_remaining) // Atomic check

  if (error) {
    return { success: false, error: 'خطأ في تحديث الرصيد' }
  }

  return { success: true }
}

// ================================================
// PAYMOB CHECKOUT
// ================================================
export async function createPaymobOrder(plan: string): Promise<{
  success: boolean
  checkoutUrl?: string
  error?: string
}> {
  if (!PLANS[plan as keyof typeof PLANS]) {
    return { success: false, error: 'خطة غير صالحة' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'غير مصرح' }
  }

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single()

  if (!firmMember) {
    return { success: false, error: 'ليست عضو في شركة' }
  }

  const planConfig = PLANS[plan as keyof typeof PLANS]
  const merchantOrderId = `wagha-${firmMember.firm_id}-${Date.now()}`
  const fullName = (user.user_metadata as Record<string, unknown>)?.full_name as string || 'Customer'
  const firstName = fullName.split(' ')[0] || 'Customer'
  const lastName = fullName.split(' ').slice(1).join(' ') || 'Customer'

  try {
    const { iframeUrl } = await createPaymobOrderClient({
      amount: planConfig.price,
      email: user.email || '',
      firstName,
      lastName,
      phone: (user.user_metadata as Record<string, unknown>)?.phone as string || 'NA',
      planName: `Wagha-ai ${planConfig.nameAr} Plan`,
      planDescription: planConfig.description,
    })

    // Store order info for webhook verification
    await supabase
      .from('pending_orders')
      .insert({
        firm_id: firmMember.firm_id,
        plan,
        merchant_order_id: merchantOrderId,
        amount: planConfig.price,
        status: 'pending',
      })

    // Return iframe URL (already contains payment_token)
    return {
      success: true,
      checkoutUrl: iframeUrl,
    }
  } catch (error) {
    console.error('Paymob order creation failed:', error)
    return { success: false, error: 'فشل إنشاء طلب الدفع' }
  }
}

// ================================================
// SUBSCRIPTION CANCELLATION
// ================================================
export async function cancelSubscription(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'غير مصرح' }

  const { data: firmMember } = await supabase
    .from('firm_members')
    .select('firm_id')
    .eq('user_id', user.id)
    .single()

  if (!firmMember) return { success: false, error: 'ليست عضو في شركة' }

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('firm_id', firmMember.firm_id)
    .eq('status', 'active')

  if (error) {
    return { success: false, error: 'فشل إلغاء الاشتراك' }
  }

  revalidatePath('/settings/billing')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getBillingPortalUrl(): Promise<{ url?: string; error?: string }> {
  // Paymob doesn't have a customer portal like Stripe
  // For now, return the billing settings page
  return { url: '/settings/billing' }
}

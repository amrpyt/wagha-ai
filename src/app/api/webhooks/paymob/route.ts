import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPaymobWebhook } from '@/lib/paymob/client'
import type { Database } from '@/types/database.types'
import type { PendingOrder } from '@/types/database.types'

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row']
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
type PendingOrderInsert = Database['public']['Tables']['pending_orders']['Insert']

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const hmacHeader = req.headers.get('hmac')

  // Verify HMAC signature
  if (hmacHeader) {
    const isValid = verifyPaymobWebhook(hmacHeader, payload)
    if (!isValid) {
      console.error('Invalid Paymob webhook HMAC')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  const { type, data } = payload

  console.log('Paymob webhook received:', type, data)

  switch (type) {
    case 'TRANSACTION_CREATED':
    case 'PAYMENT_KEY_REQUEST':
      // Initial transaction - will be followed by TRANSACTION_APPROVED
      break

    case 'TRANSACTION_APPROVED':
      await handleSuccessfulPayment(data)
      break

    case 'TRANSACTION_REFUSED':
      await handleFailedPayment(data)
      break

    case 'ORDER_PLACE_CHANGED':
      // Order status changed - could be refund, etc.
      break

    default:
      console.log('Unhandled Paymob webhook type:', type)
  }

  return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(data: Record<string, unknown>) {
  const supabase = await createClient()

  const merchantOrderId = data.merchant_order_id as string
  if (!merchantOrderId) return

  // Parse firm_id from merchant_order_id (format: wagha-{firm_id}-{timestamp})
  const parts = merchantOrderId.split('-')
  if (parts.length < 3) return

  const firmId = parts[1]

  // Get pending order
  const { data: pendingOrder } = await supabase
    .from('pending_orders')
    .select('*')
    .eq('merchant_order_id', merchantOrderId)
    .eq('status', 'pending')
    .single() as { data: PendingOrder | null }

  if (!pendingOrder) {
    console.log('No pending order found for:', merchantOrderId)
    return
  }

  // Plan credits mapping
  const planCredits: Record<string, number> = {
    starter: 10,
    business: 30,
    pro: 100,
  }

  const credits = planCredits[pendingOrder.plan] || 0

  // Idempotency check - was subscription already created?
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('firm_id', firmId)
    .single() as { data: SubscriptionRow | null }

  if (existingSub) {
    // Update existing subscription
    await supabase
      .from('subscriptions')
      // @ts-expect-error Supabase RLS types conflict with runtime data
      .update({
        plan: pendingOrder.plan,
        credits_remaining: credits,
        paymob_transaction_id: String(data.id || ''),
        billing_cycle_start: new Date().toISOString(),
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('firm_id', firmId)
  } else {
    // Create new subscription
    // @ts-expect-error Supabase RLS types conflict with runtime data
    await supabase.from('subscriptions').insert({
      firm_id: firmId,
      plan: pendingOrder.plan,
      paymob_subscription_id: data.id ? String(data.id) : null,
      credits_remaining: credits,
      billing_cycle_start: new Date().toISOString(),
      status: 'active',
    })
  }

  // Mark pending order as completed
  await supabase
    .from('pending_orders')
    // @ts-expect-error Supabase RLS types conflict with runtime data
    .update({ status: 'completed' })
    .eq('merchant_order_id', merchantOrderId)
}

async function handleFailedPayment(data: Record<string, unknown>) {
  const supabase = await createClient()

  const merchantOrderId = data.merchant_order_id as string
  if (!merchantOrderId) return

  // Mark pending order as failed
  await supabase
    .from('pending_orders')
    // @ts-expect-error Supabase RLS types conflict with runtime data
    .update({ status: 'failed' })
    .eq('merchant_order_id', merchantOrderId)
}

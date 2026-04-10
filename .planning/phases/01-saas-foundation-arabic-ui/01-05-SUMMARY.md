# Plan 01-05 Summary: Billing & Pricing

## Goal
Implement billing and pricing system with Paymob payment integration, subscription management, and Arabic RTL UI.

## What Was Built

### Config: `src/lib/billing-plans.ts`
- PLANS constant with three tiers: Starter (250EGP/10), Business (750EGP/30), Pro (2000EGP/100)
- Separated from billing.ts to avoid 'use server' export issue

### Paymob Client: `src/lib/paymob/client.ts`
- `getPaymobToken()` — Authenticate with Paymob API
- `createPaymobOrder()` — Create order and get payment key for iframe checkout
- `verifyPaymobWebhook()` — HMAC signature verification stub

### Billing Server Actions: `src/lib/actions/billing.ts`
- `getSubscription()` — Get firm's active subscription
- `checkRenderAccess()` — Returns allowed/reason based on free render + subscription status
- `deductCredit()` — Atomically decrement credits (race condition safe)
- `createPaymobOrder(plan)` — Initiate Paymob checkout, create pending_order
- `cancelSubscription()` — Mark subscription as cancelled
- `getBillingPortalUrl()` — Returns /settings/billing (Paymob has no portal)

### Webhook: `src/app/api/webhooks/paymob/route.ts`
- Handles `TRANSACTION_APPROVED` → creates/updates subscription, marks pending_order completed
- Handles `TRANSACTION_REFUSED` → marks pending_order failed
- Idempotent: checks existing subscription before insert vs update

### Pricing Page: `src/app/dashboard/pricing/page.tsx`
- Shows all 3 plans with Arabic names, EGP prices, credit counts
- Popular plan highlighted with "الأكثر شعبية" badge
- Free render notice displayed

### Components
- `PricingClient` — Client wrapper with useTransition for subscribe action
- `PricingCard` — Plan card with subscribe button, popular badge, feature list
- `CancelSubscriptionForm` — Client component for cancel action

### Billing Settings: `src/app/settings/billing/page.tsx`
- Shows current plan name, status badge, credits remaining with progress bar
- Billing cycle start date formatted in Arabic
- Cancel subscription button
- Empty state for no subscription with link to pricing

## Key Decisions

1. **PLANS in non-server file**: `'use server'` files can only export async functions. PLANS moved to `lib/billing-plans.ts` (no 'use server') so it can be imported by both server actions and client components.

2. **Atomic credit deduction**: `deductCredit()` uses `.eq('credits_remaining', sub.credits_remaining)` as a compare-and-swap to prevent race conditions.

3. **Idempotent webhook**: Checks `existingSub` before insert vs update to handle duplicate webhook deliveries safely.

4. **React 19 forms**: All forms use `useState + useTransition` instead of `useActionState`.

## Files Created
- `src/lib/billing-plans.ts`
- `src/lib/paymob/client.ts`
- `src/lib/actions/billing.ts`
- `src/app/api/webhooks/paymob/route.ts`
- `src/app/dashboard/pricing/page.tsx`
- `src/app/settings/billing/page.tsx`
- `src/components/billing/PricingCard.tsx`
- `src/components/billing/PricingClient.tsx`
- `src/components/billing/CancelSubscriptionForm.tsx`

## Next
Phase 01 root plan execution and verification.

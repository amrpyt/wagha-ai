import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSubscription } from '@/lib/actions/billing'
import { PLANS } from '@/lib/billing-plans'
import { CancelSubscriptionForm } from '@/components/billing/CancelSubscriptionForm'

export default async function BillingSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const subscription = await getSubscription()

  const planNames: Record<string, string> = {
    starter: 'المبتدئ (Starter)',
    business: 'الأعمال (Business)',
    pro: 'احترافي (Pro)',
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'ملغي', color: 'bg-gray-100 text-gray-800' },
    past_due: { label: 'متأخر الدفع', color: 'bg-red-100 text-red-800' },
    trial: { label: 'تجريبي', color: 'bg-blue-100 text-blue-800' },
  }

  const currentPlanCredits = subscription
    ? PLANS[subscription.plan as keyof typeof PLANS]?.credits || 0
    : 0

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-right">
          الفوترة
        </h1>
        <p className="text-gray-500 text-right mt-1">
          إدارة اشتراكك وفواتيرك
        </p>
      </div>

      {subscription ? (
        <>
          {/* Current Plan */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-right mb-4">
              خطتك الحالية
            </h2>

            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xl font-medium text-gray-900 text-right">
                  {planNames[subscription.plan] || subscription.plan}
                </p>
                <p className="text-gray-500 text-right">
                  {currentPlanCredits} تصاميم شهرياً
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                statusLabels[subscription.status]?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {statusLabels[subscription.status]?.label || subscription.status}
              </span>
            </div>

            {/* Credits */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">الرصيد المتبقي</span>
                <span className="text-xl font-semibold text-[#1E3A5F]">
                  {subscription.credits_remaining} / {currentPlanCredits}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1E3A5F] rounded-full"
                  style={{
                    width: `${(subscription.credits_remaining / currentPlanCredits) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Billing cycle */}
            <p className="text-sm text-gray-500 text-right">
              دورة الفوترة بدأت: {
                new Intl.DateTimeFormat('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }).format(new Date(subscription.billing_cycle_start))
              }
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-right mb-4">
              إدارة الاشتراك
            </h2>

            <div className="space-y-4">
              <CancelSubscriptionForm />
            </div>
          </div>
        </>
      ) : (
        /* No subscription */
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              لا يوجد لديك اشتراك نشط
            </h2>
            <p className="text-gray-500 mb-6">
              اختر خطة للاستمرار في استخدام Wagha-ai
            </p>
            <a
              href="/dashboard/pricing"
              className="inline-block px-6 py-2.5 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#1E3A5F' }}
            >
              عرض الخطط
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

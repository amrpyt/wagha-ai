import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSubscription } from '@/lib/actions/billing'
import { PLANS } from '@/lib/billing-plans'
import { PricingClient } from '@/components/billing/PricingClient'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const subscription = await getSubscription()
  const isActive = subscription?.status === 'active'
  const currentPlan = isActive ? subscription?.plan : null

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          اختر خطتك
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          ابدأ بتصميم مجاني، ثم اختر الخطة التي تناسب احتياجاتك المعمارية
        </p>
      </div>

      {/* Free render badge */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-8 text-center">
        <p className="text-green-700 font-medium">
          تصمم مجاني واحد متاح عند التسجيل
        </p>
      </div>

      {/* Pricing Cards */}
      <PricingClient
        plans={{
          starter: {
            nameAr: PLANS.starter.nameAr,
            name: PLANS.starter.name,
            price: PLANS.starter.price,
            credits: PLANS.starter.credits,
            description: PLANS.starter.description,
          },
          business: {
            nameAr: PLANS.business.nameAr,
            name: PLANS.business.name,
            price: PLANS.business.price,
            credits: PLANS.business.credits,
            description: PLANS.business.description,
          },
          pro: {
            nameAr: PLANS.pro.nameAr,
            name: PLANS.pro.name,
            price: PLANS.pro.price,
            credits: PLANS.pro.credits,
            description: PLANS.pro.description,
          },
        }}
        currentPlan={currentPlan}
      />

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <p>جميع الأسعار بالجنيه المصري • لا توجد رسوم خفية</p>
        <p className="mt-2">يمكنك إلغاء اشتراكك في أي وقت</p>
      </div>
    </div>
  )
}

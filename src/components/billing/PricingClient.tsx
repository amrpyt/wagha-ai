'use client'

import { useTransition } from 'react'
import { createPaymobOrder } from '@/lib/actions/billing'
import { PricingCard } from './PricingCard'

interface PricingClientProps {
  plans: {
    starter: { nameAr: string; name: string; price: number; credits: number; description: string }
    business: { nameAr: string; name: string; price: number; credits: number; description: string }
    pro: { nameAr: string; name: string; price: number; credits: number; description: string }
  }
  currentPlan: string | null
}

export function PricingClient({ plans, currentPlan }: PricingClientProps) {
  const [isPending, startTransition] = useTransition()

  function handleSubscribe(planId: string) {
    return new Promise<{ success: boolean; checkoutUrl?: string; error?: string }>((resolve) => {
      startTransition(async () => {
        const result = await createPaymobOrder(planId)
        resolve(result)
      })
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PricingCard
        planId="starter"
        nameAr={plans.starter.nameAr}
        nameEn={plans.starter.name}
        price={plans.starter.price}
        credits={plans.starter.credits}
        description={plans.starter.description}
        currentPlan={currentPlan === 'starter'}
        onSubscribe={handleSubscribe}
      />

      <PricingCard
        planId="business"
        nameAr={plans.business.nameAr}
        nameEn={plans.business.name}
        price={plans.business.price}
        credits={plans.business.credits}
        description={plans.business.description}
        isPopular
        currentPlan={currentPlan === 'business'}
        onSubscribe={handleSubscribe}
      />

      <PricingCard
        planId="pro"
        nameAr={plans.pro.nameAr}
        nameEn={plans.pro.name}
        price={plans.pro.price}
        credits={plans.pro.credits}
        description={plans.pro.description}
        currentPlan={currentPlan === 'pro'}
        onSubscribe={handleSubscribe}
      />
    </div>
  )
}

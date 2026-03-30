// Plan configuration - shared between client and server
// No 'use server' needed - this is just data

const PLANS = {
  starter: {
    name: 'Starter',
    nameAr: 'المبتدئ',
    price: 250, // EGP
    credits: 10,
    description: '10 تصاميم شهرياً',
  },
  business: {
    name: 'Business',
    nameAr: 'الأعمال',
    price: 750, // EGP
    credits: 30,
    description: '30 تصميماً شهرياً',
  },
  pro: {
    name: 'Pro',
    nameAr: 'احترافي',
    price: 2000, // EGP
    credits: 100,
    description: '100 تصميم شهرياً',
  },
} as const

export { PLANS }

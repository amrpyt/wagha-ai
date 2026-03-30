// Paymob integration - Egypt's leading payment gateway
// Documentation: https://acceptdocs.paymob.com/

const PAYMOB_API_URL = 'https://accept.paymob.com/api'
const PAYMOB_IFRAME_URL = 'https://accept.paymobsolutions.com/api/acceptance/iframes'

interface PaymobOrderRequest {
  amount: number // in cents
  currency: 'EGP'
  merchant_order_id: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  plan_id: string
  firm_id: string
}

interface PaymobTokenResponse {
  token: string
}

interface PaymobOrderResponse {
  id: string
  token: string
}

export async function getPaymobToken(): Promise<string> {
  const response = await fetch(`${PAYMOB_API_URL}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.PAYMOB_API_KEY,
    }),
  })

  const data = await response.json()
  return data.token
}

export async function createPaymobOrder(request: PaymobOrderRequest): Promise<{ orderToken: string; iframeUrl: string }> {
  const token = await getPaymobToken()

  // Step 1: Create order
  const orderResponse = await fetch(`${PAYMOB_API_URL}/ecommerce/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      merchant_order_id: request.merchant_order_id,
      amount_cents: request.amount,
      currency: request.currency,
      items: [
        {
          name: `Wagha-ai ${request.plan_id} Plan`,
          amount_cents: request.amount,
          description: `Monthly subscription - ${request.plan_id} plan`,
          quantity: 1,
        },
      ],
    }),
  })

  const orderData: PaymobOrderResponse = await orderResponse.json()

  // Step 2: Get payment key
  const paymentKeyResponse = await fetch(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      order_id: orderData.id,
      billing_data: {
        apartment: 'NA',
        email: request.email,
        floor: 'NA',
        first_name: request.first_name,
        street: 'NA',
        building: 'NA',
        phone_number: request.phone_number,
        shipping_method: 'NA',
        postal_outlet: 'NA',
        city: 'NA',
        country: 'EG',
        last_name: request.last_name,
        state: 'NA',
      },
      currency: request.currency,
      amount_cents: request.amount,
      integration_id: process.env.PAYMOB_INTEGRATION_ID,
    }),
  })

  const paymentKeyData = await paymentKeyResponse.json()

  return {
    orderToken: paymentKeyData.token,
    iframeUrl: `${PAYMOB_IFRAME_URL}/${process.env.PAYMOB_IFRAME_ID}`,
  }
}

export function verifyPaymobWebhook(hmac: string, payload: unknown): boolean {
  // HMAC verification would go here
  // For now, return true - implement with actual HMAC secret
  return true
}

/**
 * Paymob Accept API Client — Egypt's payment gateway
 * Docs: https://developers.paymob.com/
 *
 * Flow:
 *  1. Authenticate with api_key + username + password → get auth token
 *  2. Register order → get order id
 *  3. Create payment key for that order → get payment token
 *  4. Redirect user to iframe with payment token
 */

const PAYMOB_API_BASE = 'https://accept.paymob.com/api'
const PAYMOB_IFRAME_BASE = 'https://accept.paymobsolutions.com/api/acceptance/iframes'

interface PaymobAuthResponse {
  token: string
}

interface PaymobOrderResponse {
  id: number
}

interface PaymobPaymentKeyResponse {
  token: string
}

interface PaymobOrderRequest {
  amount_cents: number
  currency: string
  items: { name: string; amount_cents: number; description: string; quantity: number }[]
  billing_data: {
    apartment: string
    email: string
    floor: string
    first_name: string
    street: string
    building: string
    phone_number: string
    shipping_method: string
    postal_outlet: string
    city: string
    country: string
    last_name: string
    state: string
  }
}

interface CreatePaymobOrderResult {
  orderToken: string
  iframeUrl: string
}

/**
 * Step 1: Authenticate — get auth token
 * POST https://accept.paymob.com/api/auth/tokens
 */
async function getPaymobToken(): Promise<string> {
  const response = await fetch(`${PAYMOB_API_BASE}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.PAYMOB_API_KEY,
      username: process.env.PAYMOB_USERNAME,
      password: process.env.PAYMOB_PASSWORD,
    }),
  })

  if (!response.ok) {
    throw new Error(`Paymob auth failed: ${response.status}`)
  }

  const data: PaymobAuthResponse = await response.json()
  return data.token
}

/**
 * Step 2: Register order
 * POST https://accept.paymob.com/api/ecommerce/orders
 */
async function registerOrder(
  authToken: string,
  amountCents: number,
  items: PaymobOrderRequest['items']
): Promise<number> {
  const response = await fetch(`${PAYMOB_API_BASE}/ecommerce/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      items,
    }),
  })

  if (!response.ok) {
    throw new Error(`Paymob order registration failed: ${response.status}`)
  }

  const data: PaymobOrderResponse = await response.json()
  return data.id
}

/**
 * Step 3: Create payment key
 * POST https://accept.paymob.com/api/acceptance/payment_keys
 */
async function createPaymentKey(
  authToken: string,
  orderId: number,
  amountCents: number,
  billingData: PaymobOrderRequest['billing_data']
): Promise<string> {
  const response = await fetch(`${PAYMOB_API_BASE}/acceptance/payment_keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: billingData,
      currency: 'EGP',
      integration_id: process.env.PAYMOB_INTEGRATION_ID,
    }),
  })

  if (!response.ok) {
    throw new Error(`Paymob payment key creation failed: ${response.status}`)
  }

  const data: PaymobPaymentKeyResponse = await response.json()
  return data.token
}

/**
 * Full Paymob checkout: authenticate → register order → get payment key
 * Returns iframe URL with payment token
 */
export async function createPaymobOrder(request: {
  amount: number // in pounds (EGP), will be converted to cents
  email: string
  firstName: string
  lastName: string
  phone: string
  planName: string
  planDescription: string
}): Promise<CreatePaymobOrderResult> {
  const amountCents = Math.round(request.amount * 100)

  // Step 1: Authenticate
  const authToken = await getPaymobToken()

  // Step 2: Register order
  const orderId = await registerOrder(authToken, amountCents, [
    {
      name: request.planName,
      amount_cents: amountCents,
      description: request.planDescription,
      quantity: 1,
    },
  ])

  // Step 3: Create payment key
  const paymentToken = await createPaymentKey(
    authToken,
    orderId,
    amountCents,
    {
      apartment: 'NA',
      email: request.email,
      floor: 'NA',
      first_name: request.firstName,
      street: 'NA',
      building: 'NA',
      phone_number: request.phone,
      shipping_method: 'NA',
      postal_outlet: 'NA',
      city: 'NA',
      country: 'EG',
      last_name: request.lastName,
      state: 'NA',
    }
  )

  const iframeUrl = `${PAYMOB_IFRAME_BASE}/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`

  return { orderToken: paymentToken, iframeUrl }
}

/**
 * Verify Paymob webhook HMAC signature
 * Docs: https://developers.paymob.com/
 */
export function verifyPaymobWebhook(
  hmacSecret: string,
  payload: Record<string, unknown>
): boolean {
  // HMAC verification implementation
  // Paymob sends HMAC in the hmac header computed over the payload
  // This should be implemented using the HMAC_SECRET from env
  // For now, accept all webhooks — implement HMAC verification in production
  return true
}

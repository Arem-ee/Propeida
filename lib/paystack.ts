import { createHmac } from 'node:crypto'

const PAYSTACK_AMOUNT = 150000

const FETCH_TIMEOUT_MS = 15000

const VALID_PRODUCTS = ['putme_pro', 'jamb_pro', 'jamb_premium_ai'] as const

const PRODUCT_AMOUNTS: Record<string, number> = {
  putme_pro: 150000,
  jamb_pro: 150000,
  jamb_premium_ai: 300000,
}

export const SUPPORT_PRODUCT = 'support'

export const SUPPORT_MIN_AMOUNT = 100
export const SUPPORT_MAX_AMOUNT = 10000000

async function paystackFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeout)
  }
}

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not configured')
  return key
}

export function isValidProduct(product: string): product is typeof VALID_PRODUCTS[number] {
  return (VALID_PRODUCTS as readonly string[]).includes(product)
}

export async function initializeTransaction(email: string, userId: string, product: string = 'putme_pro', idempotencyKey?: string) {
  const amount = PRODUCT_AMOUNTS[product] ?? PAYSTACK_AMOUNT
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getSecretKey()}`,
    'Content-Type': 'application/json',
  }
  if (idempotencyKey) {
    headers['X-Paystack-Idempotency-Key'] = idempotencyKey
  }

  const response = await paystackFetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      amount,
      currency: 'NGN',
      metadata: { user_id: userId, product },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
    }),
  })

  if (!response.ok) {
    throw new Error(`Paystack initialization failed with status ${response.status}`)
  }

  const data = await response.json()
  if (!data.status) {
    throw new Error(data.message ?? 'Failed to initialize payment')
  }

  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
    accessCode: data.data.access_code,
  }
}

export async function initializeSupportTransaction(email: string, amountKobo: number, userId: string | null, idempotencyKey?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getSecretKey()}`,
    'Content-Type': 'application/json',
  }
  if (idempotencyKey) {
    headers['X-Paystack-Idempotency-Key'] = idempotencyKey
  }

  const response = await paystackFetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email,
      amount: amountKobo,
      currency: 'NGN',
      metadata: { user_id: userId, product: SUPPORT_PRODUCT },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/support/callback`,
    }),
  })

  if (!response.ok) {
    throw new Error(`Paystack initialization failed with status ${response.status}`)
  }

  const data = await response.json()
  if (!data.status) {
    throw new Error(data.message ?? 'Failed to initialize payment')
  }

  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
    accessCode: data.data.access_code,
  }
}

export async function verifyTransaction(reference: string) {
  const response = await paystackFetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Paystack verification failed with status ${response.status}`)
  }

  const data = await response.json()
  if (!data.status) {
    throw new Error(data.message ?? 'Failed to verify transaction')
  }

  return {
    status: data.data.status as string,
    amount: data.data.amount as number,
    currency: data.data.currency as string,
    gatewayResponse: data.data.gateway_response as string,
    paidAt: data.data.paid_at as string | null,
    customerEmail: data.data.customer?.email as string | undefined,
    userId: data.data.metadata?.user_id as string | undefined,
    product: data.data.metadata?.product as string | undefined,
  }
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const key = getSecretKey()
  const hash = createHmac('sha512', key)
    .update(body)
    .digest('hex')
  return hash === signature
}

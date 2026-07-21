import { createHmac } from 'node:crypto'

export const PAYSTACK_AMOUNT = 150000

const PRODUCT_AMOUNTS: Record<string, number> = {
  putme_pro: 150000,
  jamb_pro: 150000,
  jamb_premium_ai: 300000,
}

export async function initializeTransaction(email: string, userId: string, product: string = 'putme_pro') {
  const amount = PRODUCT_AMOUNTS[product] ?? PAYSTACK_AMOUNT
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount,
      currency: 'NGN',
      metadata: { user_id: userId, product },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
    }),
  })

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
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  })

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
  const hash = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest('hex')
  return hash === signature
}

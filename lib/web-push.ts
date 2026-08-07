import webpush from 'web-push'

export function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:propeida.help@gmail.com'

  if (!publicKey || !privateKey) return false

  webpush.setVapidDetails(subject, publicKey, privateKey)
  return true
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; icon?: string; url?: string }
) {
  try {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon ?? '/icon',
        data: { url: payload.url ?? '/' },
      })
    )
    return true
  } catch (err: unknown) {
    if (err instanceof webpush.WebPushError && err.statusCode === 410) {
      return { expired: true }
    }
    console.error('[push] send error:', err)
    return false
  }
}

export { webpush }

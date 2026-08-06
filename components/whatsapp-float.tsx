'use client'

import { MessageCircle } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'

export default function WhatsAppFloat() {
  return (
    <a
      href={siteConfig.whatsapp.channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join our WhatsApp Channel"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors md:hidden"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
import { MessageCircle } from 'lucide-react'
import { buildParentShareLink } from '@/lib/campaign/messages'

export default function ParentShareButton({
  label = 'Ask a parent or guardian on WhatsApp',
}: {
  label?: string
}) {
  return (
    <a
      href={buildParentShareLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-bold text-green-700 hover:bg-green-100"
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </a>
  )
}
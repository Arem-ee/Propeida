import { toLessonVisual } from '@/lib/notes/visual'

/**
 * A raster illustration inside a lesson. Local paths only, enforced by the
 * visual contract in lib/notes/visual.ts. The picture gets a rounded frame,
 * a caption for what to notice, and an aspect box that pre-reserves its
 * space so the layout never jumps while it loads.
 */
export default function ImageVisual({ visual }: { visual: unknown }) {
  const parsed = toLessonVisual(visual)
  if (!parsed || parsed.kind !== 'image') return null
  const { src, alt, caption, aspect } = parsed

  return (
    <figure className="mt-4 overflow-hidden rounded-2xl border border-blue-100/70">
      <div className={aspect === 'portrait' ? 'aspect-[4/5] w-full bg-slate-100' : 'aspect-[16/9] w-full bg-slate-100'}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local lesson artwork; dimensions are handled by the aspect box */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      {caption && (
        <figcaption className="border-t border-blue-100/70 bg-blue-50/40 px-3 py-2 text-[12px] font-semibold leading-snug text-ink-soft">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

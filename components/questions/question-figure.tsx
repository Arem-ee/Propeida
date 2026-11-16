'use client'

/**
 * QuestionFigure: the diagram for a figure-based JAMB-style item. Rendered
 * under the passage, above the stem (reading order: figure, then question),
 * scroll-free SVG/PNG rather than canvas so it scales cleanly at 360px.
 */
export interface QuestionFigureSpec {
  src: string
  alt: string
  width?: number
  height?: number
  caption?: string
}

export function QuestionFigure({ figure }: { figure: QuestionFigureSpec }) {
  if (!figure?.src || !figure.alt) return null
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  const absolute = /^https?:\/\//i.test(figure.src)
    ? figure.src
    : base
      ? `${base}/storage/v1/object/public/question-figures/${figure.src.replace(/^\/+/, '')}`
      : null
  if (!absolute) return null

  return (
    <figure className="my-5 mx-auto max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 text-center">
      <img
        src={absolute}
        alt={figure.alt}
        width={figure.width}
        height={figure.height}
        className="mx-auto h-auto max-w-full"
        loading="lazy"
      />
      {figure.caption && (
        <figcaption className="mt-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
          {figure.caption}
        </figcaption>
      )}
    </figure>
  )
}

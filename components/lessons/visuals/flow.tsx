import { toLessonVisual } from '@/lib/notes/visual'

/**
 * A chain of steps in reading order. Horizontal for four steps or fewer on
 * wide screens; vertical otherwise and always on a phone.
 */
export default function FlowVisual({ visual }: { visual: unknown }) {
  const parsed = toLessonVisual(visual)
  if (!parsed || parsed.kind !== 'flow') return null
  const { caption, steps } = parsed
  const horizontal = steps.length <= 4

  return (
    <figure className="mt-4">
      <ol
        className={
          horizontal
            ? 'flex flex-col gap-1.5 sm:flex-row sm:items-stretch sm:gap-0'
            : 'flex flex-col gap-1.5'
        }
      >
        {steps.map((step, i) => (
          <li
            key={`${step.label}-${i}`}
            className={
              horizontal
                ? 'flex min-w-0 flex-col sm:flex-1 sm:flex-row sm:items-center'
                : 'flex min-w-0 flex-col'
            }
          >
            <div className="min-w-0 flex-1 rounded-xl border border-vis-rule bg-white px-3 py-2.5">
              <p className="text-[13px] font-extrabold leading-snug text-ink">{step.label}</p>
              {step.detail && (
                <p className="mt-0.5 text-[12px] font-semibold leading-snug text-ink-soft">
                  {step.detail}
                </p>
              )}
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="grid w-full shrink-0 place-items-center py-0.5 text-vis-rule sm:w-auto sm:px-1.5 sm:py-0"
              >
                <svg
                  viewBox="0 0 16 16"
                  className={`h-4 w-4 ${horizontal ? 'rotate-90 sm:rotate-0' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </span>
            )}
          </li>
        ))}
      </ol>
      <figcaption className="mt-2 text-[12px] font-semibold leading-relaxed text-gray-600">
        {caption}
      </figcaption>
    </figure>
  )
}

'use client'

import { MathText } from '@/components/lessons/math-text'

/**
 * PassagePanel: the reading passage for a comprehension question. Rendered
 * above the stem in mock and practice players (reading order: passage,
 * then question). White-space preserved so authoring controls line flow.
 */
export function PassagePanel({ passage }: { passage: { title?: string; text: string } }) {
  if (!passage?.text || !passage.text.trim()) return null
  const paragraphs = passage.text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)

  return (
    <div className="mb-5 rounded-2xl border border-blue-100/70 bg-blue-50/30 px-5 py-4">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-700/75">
        {passage.title?.trim() ? passage.title : 'Passage'}
      </p>
      <div className="mt-2 space-y-3 text-[15px] font-medium leading-[1.75] text-black">
        {paragraphs.map((paragraph, i) => (
          <p key={i}><MathText text={paragraph} /></p>
        ))}
      </div>
    </div>
  )
}

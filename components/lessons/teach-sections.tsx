'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Lightbulb, RotateCcw } from 'lucide-react'
import type { NoteSection, SectionCheck } from '@/lib/notes'
import LessonVisualBlock from './visuals'

/**
 * The core reading flow: one concept per lesson, split into at most three
 * short section cards. Each card ends with a one-line takeaway and (when the
 * lesson supplies one) a ten-second check. The whole lesson can also be read
 * as continuous text for learners who prefer a full page.
 *
 * Depth is deliberately absent here: `Go deeper:` sections stay in the
 * player's collapsed disclosure and never enter this flow.
 */
export type TeachSectionData = NoteSection

export type { SectionCheck }

export function countSectionWords(sections: TeachSectionData[], summary = ''): number {
  const count = (text: string) => text.trim().split(/\s+/).filter(Boolean).length
  return (
    count(summary) +
    sections.reduce(
      (total, section) =>
        total +
        count(section.heading) +
        (section.paragraphs ?? []).reduce((n, p) => n + count(p), 0) +
        section.bullets.reduce((n, b) => n + count(b), 0) +
        (section.takeaway ? count(section.takeaway) : 0),
      0,
    )
  )
}

export function readingMinutes(sections: TeachSectionData[], summary = ''): number {
  // 200 words per minute is a comfortable pace for study reading, not skimming.
  return Math.max(1, Math.round(countSectionWords(sections, summary) / 200))
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= current ? 'bg-blue-600' : 'bg-blue-100'
          }`}
        />
      ))}
    </div>
  )
}

function Takeaways({ section }: { section: TeachSectionData }) {
  if (!section.takeaway) return null
  return (
    <div className="mt-4 flex gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
      <p className="text-[13px] font-extrabold leading-relaxed text-amber-900">
        {section.takeaway}
      </p>
    </div>
  )
}

function CheckBlock({
  check,
  chosen,
  onChoose,
}: {
  check: SectionCheck
  chosen: number | undefined
  onChoose: (index: number) => void
}) {
  const answered = chosen !== undefined
  const correct = answered && chosen === check.answer
  return (
    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
        10-second check
      </p>
      <p className="mt-1 text-sm font-extrabold leading-snug text-black">{check.question}</p>
      <div className="mt-2.5 space-y-1.5">
        {check.options.map((option, i) => {
          const isChosen = chosen === i
          const isAnswer = check.answer === i
          const style = !answered
            ? 'border-blue-100 bg-white text-ink hover:border-blue-300'
            : isAnswer
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : isChosen
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : 'border-transparent bg-white/60 text-ink-soft'
          return (
            <button
              key={i}
              type="button"
              onClick={() => !answered && onChoose(i)}
              disabled={answered}
              aria-pressed={isChosen}
              className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[13px] font-bold leading-snug transition-colors ${style} ${
                answered ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/80 text-[10px] font-extrabold text-blue-800">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
              {answered && isAnswer && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
      {answered && (
        <p
          className={`mt-2.5 text-[12px] font-bold leading-relaxed ${
            correct ? 'text-emerald-800' : 'text-rose-800'
          }`}
        >
          {correct ? 'Correct.' : `Not quite — ${String.fromCharCode(65 + check.answer)}.`}
          {check.why ? ` ${check.why}` : ''}
        </p>
      )}
    </div>
  )
}

function SectionBody({ section }: { section: TeachSectionData }) {
  return (
    <>
      {(section.paragraphs ?? []).map((paragraph, i) => (
        <p key={i} className="mt-2.5 text-[14.5px] font-semibold leading-relaxed text-ink">
          {paragraph}
        </p>
      ))}
      {section.bullets.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {section.bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-[13.5px] font-semibold leading-relaxed text-ink-soft">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default function TeachSections({
  summary,
  sections,
  onComplete,
}: {
  summary: string
  sections: TeachSectionData[]
  /** Called once the learner reaches the recap (or finishes read-all mode). */
  onComplete?: () => void
}) {
  const [mode, setMode] = useState<'cards' | 'all'>('cards')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [finished, setFinished] = useState(false)

  const minutes = useMemo(() => readingMinutes(sections, summary), [sections, summary])
  const section = sections[index]
  const chosen = answers[index]
  const canAdvance = !section?.check || chosen !== undefined

  if (sections.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-[15px] font-semibold leading-relaxed text-ink-soft">{summary}</p>
      </div>
    )
  }

  if (!section) return null

  const finish = () => {
    setFinished(true)
    onComplete?.()
  }

  if (finished) {
    const recap = sections
      .map((s) => s.takeaway ?? s.bullets[0])
      .filter((line): line is string => Boolean(line))
      .slice(0, 3)
    return (
      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
        <p className="font-display text-base font-medium text-emerald-950">Quick recap</p>
        <ul className="mt-2.5 space-y-2">
          {recap.map((line, i) => (
            <li key={i} className="flex gap-2.5 text-[13.5px] font-bold leading-relaxed text-emerald-950">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            setFinished(false)
            setIndex(0)
            setAnswers({})
          }}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-extrabold text-emerald-800 underline underline-offset-2"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Read the sections again
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-blue-700">
          About {minutes} min read
        </p>
        <button
          type="button"
          onClick={() => setMode((m) => (m === 'cards' ? 'all' : 'cards'))}
          className="rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-extrabold text-blue-800 hover:bg-blue-50"
        >
          {mode === 'cards' ? 'Read it all at once' : 'Back to section cards'}
        </button>
      </div>

      {mode === 'all' ? (
        <div className="mt-4 space-y-5">
          {sections.map((s, i) => (
            <section key={i}>
              {s.heading && (
                <h3 className="font-display text-base font-medium text-black">{s.heading}</h3>
              )}
              <SectionBody section={s} />
              {s.visual && <LessonVisualBlock visual={s.visual} />}
              <Takeaways section={s} />
            </section>
          ))}
          <button
            type="button"
            onClick={finish}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-[14px] font-extrabold text-white min-h-[48px] hover:bg-blue-700"
          >
            I&apos;ve read this <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-gray-500">
              Section {index + 1} of {sections.length}
            </p>
            <button
              type="button"
              onClick={() => {
                setFinished(true)
                onComplete?.()
              }}
              className="text-[11px] font-extrabold text-gray-500 underline underline-offset-2 hover:text-gray-700"
            >
              Skip to recap
            </button>
          </div>
          <div className="mt-2">
            <Progress current={index} total={sections.length} />
          </div>

          <div className="mt-4">
            {section.heading && (
              <h3 className="font-display text-[19px] font-medium leading-snug text-black">
                {section.heading}
              </h3>
            )}
            <SectionBody section={section} />
            {section.visual && <LessonVisualBlock visual={section.visual} />}
            <Takeaways section={section} />
            {section.check && (
              <CheckBlock
                check={section.check}
                chosen={chosen}
                onChoose={(choice) => setAnswers((a) => ({ ...a, [index]: choice }))}
              />
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-extrabold text-gray-600 min-h-[44px] hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (index + 1 < sections.length) setIndex((i) => i + 1)
                else finish()
              }}
              disabled={!canAdvance}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-[13px] font-extrabold text-white min-h-[44px] transition-colors ${
                canAdvance ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {index + 1 < sections.length ? 'Next section' : 'Recap'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

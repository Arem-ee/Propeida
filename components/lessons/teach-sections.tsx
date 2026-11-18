'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Bookmark, CheckCircle2, RotateCcw } from 'lucide-react'
import type { NoteSection, SectionCheck } from '@/lib/notes'
import LessonVisualBlock from './visuals'
import { GlossText } from './gloss-text'
import { MascotExplains } from '@/components/celebrations/speech-bubble'
import { WorkedSteps } from '@/components/celebrations/worked-steps'
import type { WorkedStep } from '@/lib/lessons'
import { MathText, isMathOnly } from './math-text'

/**
 * The core reading flow: one concept per lesson, split into at most three
 * short section cards. Each card ends with a one-line takeaway and (when the
 * lesson supplies one) a ten-second check. The whole lesson can also be read
 * as continuous text for learners who prefer a full page.
 *
 * Depth is deliberately absent here: `Go deeper:` sections stay in the
 * player's collapsed disclosure and never enter this flow.
 *
 * Layout hierarchy, deliberately: heading and body copy dominate; the
 * position indicator is one quiet line; the reading-mode toggle is one
 * small visible button, never competing with the primary Next control.
 */
export type TeachSectionData = NoteSection

export type { SectionCheck }

/** Tappable segments — backward jumps free, forward jumps unlock as the learner advances. */
function Progress({
  current,
  total,
  maxVisited,
  onJump,
}: {
  current: number
  total: number
  maxVisited: number
  onJump: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Lesson sections">
      {Array.from({ length: total }).map((_, i) => {
        const visited = i <= maxVisited
        return (
          <button
            key={i}
            type="button"
            disabled={!visited}
            onClick={() => visited && onJump(i)}
            aria-current={i === current ? 'step' : undefined}
            aria-label={`Section ${i + 1}`}
            className={`h-1.5 flex-1 cursor-pointer rounded-full transition-all disabled:cursor-not-allowed ${
              i <= current ? 'bg-blue-600' : 'bg-blue-100'
            } ${visited ? '' : 'opacity-60'}`}
          />
        )
      })}
    </div>
  )
}

function Takeaways({ section }: { section: TeachSectionData }) {
  if (!section.takeaway) return null
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 animate-pop-in">
      <Bookmark className="mt-0.5 h-4 w-4 shrink-0 fill-amber-300 text-amber-600" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
          The line to keep
        </p>
        <p className="mt-0.5 text-[14px] font-bold leading-snug text-amber-950">
          <GlossText text={section.takeaway} />
        </p>
      </div>
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
    <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
        10-second check
      </p>
      <p className="mt-1.5 text-[15px] font-extrabold leading-snug text-black">
        <GlossText text={check.question} />
      </p>
      <div className="mt-3 space-y-2">
        {check.options.map((option, i) => {
          const isChosen = chosen === i
          const isAnswer = check.answer === i
          const style = !answered
            ? 'border-blue-100 bg-white text-ink hover:border-blue-300'
            : isAnswer
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : isChosen
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-transparent bg-white/60 text-ink-soft'
          return (
            <button
              key={i}
              type="button"
              onClick={() => !answered && onChoose(i)}
              disabled={answered}
              aria-pressed={isChosen}
              className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[13.5px] font-bold leading-snug transition-all pressable ${style} ${
                answered ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${answered && isAnswer ? 'bg-emerald-500 text-white' : 'bg-white/80 text-blue-800'}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">
                <GlossText text={option} />
              </span>
              {answered && isAnswer && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="mt-3.5 animate-pop-in">
          <MascotExplains
            correct={correct}
            explanation={check.why
              ? `${correct ? 'You got it right' : `Not quite, the answer is ${String.fromCharCode(65 + check.answer)}`}, ${check.why}`
              : correct ? 'You got it right' : `Not quite, the answer is ${String.fromCharCode(65 + check.answer)}`}
            steps={
              check.steps && check.steps.length > 0
                ? <WorkedSteps steps={check.steps as WorkedStep[]} />
                : (
                  <span className="text-sm font-semibold leading-relaxed text-ink-soft">
                    {correct ? 'You got it right' : `Not quite, the answer is ${String.fromCharCode(65 + check.answer)}`}
                    {check.why ? <>, <GlossText text={check.why} /></> : null}
                  </span>
                )
            }
          />
        </div>
      )}
    </div>
  )
}

function SectionBody({ section }: { section: TeachSectionData }) {
  return (
    <>
      {(section.paragraphs ?? []).map((paragraph, i) => (
        isMathOnly(paragraph) ? (
          <MathText key={i} text={paragraph} />
        ) : (
          <p key={i} className="mt-3.5 text-[15px] font-semibold leading-relaxed text-ink">
            <GlossText text={paragraph} />
          </p>
        )
      ))}
      {section.bullets.length > 0 && (
        <div className="mt-3.5 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-800">
            Quick reference
          </p>
          <ul className="mt-2 space-y-2">
            {section.bullets.map((b, i) => (
              <li key={i} className="flex gap-2.5 text-[14px] font-semibold leading-relaxed text-ink-soft">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
                <GlossText text={b} />
              </li>
            ))}
          </ul>
        </div>
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
  const [maxVisited, setMaxVisited] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setMaxVisited((max) => Math.max(max, index))
  }, [index])

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
      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-7">
        <p className="font-display text-base font-medium text-emerald-950">Quick recap</p>
        <ul className="mt-3 space-y-2.5">
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
            setMaxVisited(0)
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
      {/* One quiet orientation line: where the learner is in the lesson.
          The mode toggle is a visible control, never a naked text link. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
          {mode === 'all' ? `All ${sections.length} sections` : `Section ${index + 1} of ${sections.length}`}
        </p>
        <button
          type="button"
          onClick={() => setMode((m) => (m === 'cards' ? 'all' : 'cards'))}
          className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-extrabold text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          {mode === 'cards' ? 'Read everything' : 'Back to sections'}
        </button>
      </div>
      <div className="mt-3">
        <Progress current={index} total={sections.length} maxVisited={maxVisited} onJump={setIndex} />
      </div>

      {mode === 'all' ? (
        <div className="mt-4 space-y-7">
          {sections.map((s, i) => (
            <section key={i}>
              {s.heading && (
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-900 font-display text-[11px] font-semibold text-white">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-semibold leading-snug text-black">{s.heading}</h3>
                </div>
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
        <div className="mt-4">
          <div className="mt-5 animate-fade-up" key={index}>
            {section.heading && (
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 font-display text-[13px] font-semibold text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-[21px] font-semibold leading-snug text-black">
                  {section.heading}
                </h3>
              </div>
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
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-extrabold text-gray-600 min-h-[44px] hover:bg-gray-50 pressable"
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
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-[13px] font-extrabold text-white min-h-[44px] transition-colors pressable ${
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

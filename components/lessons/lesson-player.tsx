'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Eye, Lightbulb, Wrench, Target } from 'lucide-react'
import { celebrate } from '@/lib/celebrate'
import StepVisual from '@/components/lessons/step-visual'
import {
  recordLessonAttempt,
  completeLesson,
  getTwinQuestion,
  type LessonQuestion,
} from '@/lib/actions/lessons'
import type { RevisionNote } from '@/lib/notes'
import type { LessonEnhancement } from '@/lib/lessons'
import type { LessonEnglish } from '@/lib/actions/lessons'
import PassageReader, { PairComparator, RebuildCard, ReflectionCard } from './english-blocks'

type Phase = 'diagnostic' | 'teach' | 'worked' | 'supported' | 'independent' | 'done'
type Confidence = 'sure' | 'unsure' | null

interface AttemptFeedback {
  isCorrect: boolean
  correctAnswer: string
  explanation: string
  misconception: { name: string; explanation: string; repeatCount: number; repairHref: string | null } | null
  prerequisite: { name: string; href: string } | null
}

function PhaseDots({ phases, current }: { phases: string[]; current: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {phases.map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${i < current ? 'w-6 bg-emerald-500' : i === current ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'}`}
        />
      ))}
    </div>
  )
}

function ConfidencePicker({ value, onChange }: { value: Confidence; onChange: (c: Confidence) => void }) {
  return (
    <div className="flex gap-2">
      {(['sure', 'unsure'] as const).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`flex-1 rounded-2xl border-2 px-4 py-2.5 text-sm font-extrabold min-h-[48px] cursor-pointer transition-all ${
            value === c
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-500'
          }`}
        >
          {c === 'sure' ? 'Sure' : 'Unsure'}
        </button>
      ))}
    </div>
  )
}

function BankQuestion({
  question,
  attemptType,
  subjectId,
  lessonId,
  onAnswered,
  onWrong,
  ctaLabel,
}: {
  question: LessonQuestion
  attemptType: 'diagnostic' | 'independent'
  subjectId: string
  lessonId: string
  onAnswered: (correct: boolean) => void
  onWrong?: (questionId: string) => void
  ctaLabel: string
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<Confidence>(null)
  const [feedback, setFeedback] = useState<AttemptFeedback | null>(null)
  const [checking, setChecking] = useState(false)

  const check = async () => {
    if (!selected || !confidence || checking || feedback) return
    setChecking(true)
    try {
      const result = await recordLessonAttempt({
        subjectId,
        lessonId,
        questionId: question.id,
        selectedAnswer: selected,
        confidence,
        attemptType,
      })
      setFeedback(result)
      onAnswered(result.isCorrect)
      if (!result.isCorrect) onWrong?.(question.id)
    } catch {
      setChecking(false)
    }
  }

  return (
    <div>
      <p className="font-display text-lg sm:text-xl font-medium leading-snug text-black">{question.questionText}</p>
      <div className="mt-4 space-y-2.5">
        {question.options.map((opt) => {
          const isSel = selected === opt.key
          const revealed = feedback !== null
          const isCorrectOpt = feedback !== null && opt.key === feedback.correctAnswer
          return (
            <button
              key={opt.key}
              disabled={revealed}
              onClick={() => setSelected(opt.key)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left min-h-[56px] transition-all ${
                revealed
                  ? isCorrectOpt
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : isSel
                      ? 'border-red-400 bg-red-50/60'
                      : 'border-gray-200 bg-white opacity-70'
                  : isSel
                    ? 'border-blue-600 bg-blue-50/60 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                    : 'border-gray-200 bg-white'
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold border-2 ${
                revealed && isCorrectOpt
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : revealed && isSel
                    ? 'bg-red-500 border-red-500 text-white'
                    : isSel
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500 bg-white'
              }`}>
                {opt.key}
              </span>
              <span className="text-[15px] font-bold text-black">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {!feedback && (
        <div className="mt-4 space-y-3">
          <ConfidencePicker value={confidence} onChange={setConfidence} />
          <button
            onClick={check}
            disabled={!selected || !confidence || checking}
            className={`w-full rounded-2xl py-3.5 text-[15px] font-extrabold text-white min-h-[52px] transition-all ${
              selected && confidence && !checking ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)]' : 'bg-gray-300'
            }`}
          >
            {checking ? 'Checking...' : ctaLabel}
          </button>
        </div>
      )}

      {feedback && (
        <div className="mt-4 space-y-3 animate-pop">
          <div className={`rounded-2xl border px-4 py-3.5 font-display text-lg font-medium ${
            feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {feedback.isCorrect ? 'Correct — nice.' : `Not quite — it was ${feedback.correctAnswer}`}
          </div>
          <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-4">
            <p className="text-sm font-semibold leading-relaxed text-ink-soft">{feedback.explanation}</p>
          </div>
          {feedback.misconception && (
            <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-amber-800">
                <Wrench className="h-4 w-4" />
                Why this tempts: {feedback.misconception.name}
              </p>
              {feedback.misconception.repeatCount > 0 && (
                <p className="mt-1 text-xs font-extrabold text-red-700">
                  This exact error has come up {feedback.misconception.repeatCount + 1} times — time to fix the root, not retry harder.
                </p>
              )}
              <p className="mt-1 text-sm font-semibold leading-relaxed text-ink-soft">{feedback.misconception.explanation}</p>
              {feedback.misconception.repairHref && (
                <Link
                  href={feedback.misconception.repairHref}
                  className="mt-2 inline-flex items-center gap-1 text-[13px] font-extrabold text-blue-700 min-h-[40px]"
                >
                  Open the repair lesson <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              {feedback.prerequisite && (
                <Link
                  href={feedback.prerequisite.href}
                  className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-violet-300 bg-violet-50 px-4 py-3 min-h-[52px] transition-all hover:bg-violet-100"
                >
                  <span className="text-[13px] font-extrabold text-violet-800">
                    Strengthen the foundation first: {feedback.prerequisite.name}
                  </span>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-violet-700" />
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WorkedCard({
  example,
  index,
  total,
  onDone,
}: {
  example: NonNullable<LessonEnhancement['workedExamples']>[number]
  index: number
  total: number
  onDone: () => void
}) {
  const [revealed, setRevealed] = useState(0)
  const doneFired = useRef(false)

  useEffect(() => {
    if (revealed >= example.steps.length && !doneFired.current) {
      doneFired.current = true
      onDone()
    }
  }, [revealed, example.steps.length, onDone])

  return (
    <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
      {total > 1 && (
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
          Worked example {index + 1} of {total}
        </p>
      )}
      <p className="mt-2 rounded-2xl bg-ink p-4 font-display text-lg font-medium leading-snug text-white">
        {example.problem}
      </p>
      <div className="mt-4 space-y-3">
        {example.steps.map((step, i) => {
          const isRevealed = i < revealed
          const isNext = i === revealed
          return (
            <div key={i} className={`rounded-2xl border p-4 ${isRevealed ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-white'}`}>
              <p className="text-sm font-extrabold text-black">{i + 1}. {step.operation}</p>
              <p className="mt-1 text-[13px] font-semibold text-ink-soft">{step.reason}</p>
              {isRevealed ? (
                <>
                  <p className="mt-2 rounded-xl bg-white border border-emerald-200 px-3 py-2.5 text-sm font-bold text-emerald-800">{step.result}</p>
                  <StepVisual visual={step.visual ?? null} />
                </>
              ) : isNext ? (
                <div className="mt-2">
                  {step.predictPrompt && (
                    <p className="text-[13px] font-bold italic text-blue-700">{step.predictPrompt}</p>
                  )}
                  <button
                    onClick={() => setRevealed((n) => n + 1)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl border-2 border-blue-600 px-4 py-2 text-[13px] font-extrabold text-blue-700 min-h-[44px] cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    {step.predictPrompt ? 'Predict, then reveal' : 'Reveal'}
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs font-bold text-gray-300">Locked — reveal the step above first.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function LessonPlayer({
  note,
  subjectLabel,
  enhancement,
  english,
  diagnostic,
  independent,
  subjectId,
}: {
  note: RevisionNote
  subjectLabel: string
  enhancement: LessonEnhancement | null
  english?: LessonEnglish | null
  diagnostic: LessonQuestion | null
  independent: LessonQuestion[]
  subjectId: string
}) {
  const phases: Phase[] = [
    ...(diagnostic ? (['diagnostic'] as Phase[]) : []),
    'teach',
    ...((enhancement?.workedExamples?.length ?? 0) > 0 ? (['worked'] as Phase[]) : []),
    ...(enhancement?.supported ? (['supported'] as Phase[]) : []),
    ...(independent.length > 0 ? (['independent'] as Phase[]) : []),
    'done',
  ]
  const [phaseIdx, setPhaseIdx] = useState(0)
  const phase = phases[phaseIdx] ?? 'done'

  const [revealedHints, setRevealedHints] = useState(0)
  const [workedDone, setWorkedDone] = useState<number[]>([])
  const [supportedDone, setSupportedDone] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [diagnosticDone, setDiagnosticDone] = useState(false)
  const [independentDone, setIndependentDone] = useState(0)
  const [twins, setTwins] = useState<LessonQuestion[]>([])
  const [twinnedIds, setTwinnedIds] = useState<Set<string>>(new Set())
  const [twinOffers, setTwinOffers] = useState<Set<string>>(new Set())
  const [twinLoading, setTwinLoading] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [closeout, setCloseout] = useState<{ nextReviewAt: string | null } | null>(null)
  // Frozen at first render: "review in N days" must not shift under re-renders.
  const [nowMs] = useState(() => Date.now())

  const next = () => setPhaseIdx((i) => Math.min(i + 1, phases.length - 1))

  const recordSupported = async () => {
    if (supportedDone) return
    setSupportedDone(true)
    try {
      await recordLessonAttempt({
        subjectId,
        lessonId: note.id,
        questionId: null,
        selectedAnswer: null,
        confidence: null,
        attemptType: 'supported',
      })
    } catch {
      // engagement logging must never block learning
    }
  }

  const requestTwin = async (questionId: string) => {
    if (twinLoading || twinnedIds.has(questionId)) return
    setTwinLoading(true)
    try {
      const twin = await getTwinQuestion(
        subjectId,
        [...independent.map((q) => q.id), ...twins.map((q) => q.id), questionId],
        questionId,
      )
      if (twin) {
        setTwins((t) => [...t, twin])
        setTwinnedIds((s) => new Set(s).add(questionId))
        setTwinOffers((s) => {
          const next = new Set(s)
          next.delete(questionId)
          return next
        })
      } else {
        // Bank exhausted: withdraw the offer silently, keep the repair.
        setTwinOffers((s) => {
          const next = new Set(s)
          next.delete(questionId)
          return next
        })
      }
    } catch {
      // twins are enhancement; failure degrades to the repair already shown
    } finally {
      setTwinLoading(false)
    }
  }

  const finish = async () => {
    if (finishing || closeout) return
    setFinishing(true)
    try {
      // Read-only path (no bank questions yet): nothing to fold into
      // mastery. Never record a 0/total event the learner didn't take.
      if (results.length === 0) {
        setCloseout({ nextReviewAt: null })
        setFinishing(false)
        next()
        return
      }
      const correct = results.filter(Boolean).length
      const summary = await completeLesson({ subjectId, correct, total: results.length })
      setCloseout(summary)
      celebrate()
    } catch {
      setCloseout({ nextReviewAt: null })
    } finally {
      setFinishing(false)
    }
    next()
  }

  const daysUntil = (iso: string | null): string | null => {
    if (!iso) return null
    const days = Math.max(0, Math.round((new Date(iso).getTime() - nowMs) / 86400000))
    return days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
          {subjectLabel} · {note.topic}
        </p>
        <PhaseDots phases={phases} current={phaseIdx} />
      </div>

      {/* 1 — Diagnostic: retrieve before teaching */}
      {phase === 'diagnostic' && diagnostic && (
        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
          <p className="font-display text-[22px] font-medium text-black">First — what do you already know?</p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">One question, no teaching yet. Wrong answers just show us where to start.</p>
          <div className="mt-5">
            <BankQuestion
              question={diagnostic}
              attemptType="diagnostic"
              subjectId={subjectId}
              lessonId={note.id}
              ctaLabel="Check"
              onAnswered={(correct) => { setResults((r) => [...r, correct]); setDiagnosticDone(true) }}
            />
          </div>
          <button
            onClick={next}
            disabled={!diagnosticDone}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-extrabold text-white min-h-[52px] transition-all ${
              diagnosticDone ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Start learning <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2 — Teach: core points up front, full text on demand.
          Doing starts as fast as possible; reading never walls it. */}
      {phase === 'teach' && (
        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
          <p className="font-display text-[22px] font-medium text-black">The idea in 30 seconds</p>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink-soft">{note.summary}</p>
          <ul className="mt-3.5 space-y-2">
            {note.sections.flatMap((section) =>
              section.bullets.slice(0, 1).map((b) => (
                <li key={`${section.heading}:${b.slice(0, 24)}`} className="flex gap-2.5 text-sm font-bold leading-relaxed text-black">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  {b}
                </li>
              )),
            )}
          </ul>
          <details className="group mt-4 rounded-2xl border border-gray-200 bg-gray-50/50">
            <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-extrabold text-blue-700 min-h-[48px] flex items-center justify-between">
              Read the full lesson
              <span className="text-gray-500 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div className="px-4 pb-4 space-y-5">
              {note.sections.map((section) => (
                <div key={section.heading}>
                  <h3 className="font-display text-lg font-medium text-black">{section.heading}</h3>
                  {section.paragraphs?.map((p, i) => (
                    <p key={i} className="mt-1.5 text-sm font-semibold leading-[1.65] text-ink-soft">{p}</p>
                  ))}
                  <ul className="mt-2 space-y-1.5">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2 text-sm font-semibold leading-[1.65] text-ink-soft">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
          {note.examTip && (
            <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
              <p className="font-display text-base font-medium text-amber-900">Exam tip</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-amber-900">{note.examTip}</p>
            </div>
          )}
          {enhancement?.vocabulary && enhancement.vocabulary.length > 0 && (
            <div className="mt-6">
              <p className="font-display text-lg font-medium text-black">Words to own</p>
              <p className="mt-1 text-[13px] font-semibold text-ink-soft">
                Plain meaning, contrast word, and a sentence each — say each sentence aloud once.
              </p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {enhancement.vocabulary.map((w) => (
                  <div key={w.word} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5">
                    <p className="font-display text-base font-medium text-black">{w.word}</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-ink-soft">{w.definition}</p>
                    <p className="mt-1.5 text-xs font-bold text-gray-500">
                      Not: {w.contrast}
                    </p>
                    <p className="mt-1 text-[13px] italic font-semibold text-blue-900">“{w.sentence}”</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {english && (english.passages.length > 0 || english.pairs.length > 0 || english.rebuilds.length > 0 || english.reflections.length > 0) && (
            <div className="mt-8 space-y-4">
              <p className="font-display text-lg font-medium text-black">Now use it</p>
              {english.passages.map((p, i) => (
                <PassageReader
                  key={i}
                  passage={p}
                  onAnswered={(ok) => setResults((prev) => [...prev, ok])}
                />
              ))}
              {english.pairs.map((pair, i) => (
                <PairComparator
                  key={i}
                  pair={pair}
                  onAnswered={(ok) => setResults((prev) => [...prev, ok])}
                />
              ))}
              {english.rebuilds.map((item, i) => (
                <RebuildCard key={i} item={item} />
              ))}
              {english.reflections.map((item, i) => (
                <ReflectionCard key={i} item={item} />
              ))}
            </div>
          )}
          <button
            onClick={next}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px]"
          >
            {(enhancement?.workedExamples?.length ?? 0) > 0 ? 'See it worked' : 'Try it yourself'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3 — Worked examples: predict before reveal, one problem at a time */}
      {phase === 'worked' && (enhancement?.workedExamples?.length ?? 0) > 0 && (
        <div className="space-y-4">
          <p className="font-display text-[22px] font-medium text-black">Watch it worked</p>
          {enhancement!.workedExamples!.map((example, ei) => (
            <WorkedCard
              key={ei}
              example={example}
              index={ei}
              total={enhancement!.workedExamples!.length}
              onDone={() => setWorkedDone((prev) => (prev.includes(ei) ? prev : [...prev, ei]))}
            />
          ))}
          {workedDone.length >= enhancement!.workedExamples!.length && (
            <button
              onClick={next}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px] animate-pop"
            >
              Try one with help <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* 4 — Supported attempt: hints on demand */}
      {phase === 'supported' && enhancement?.supported && (
        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
          <p className="font-display text-[22px] font-medium text-black">Your turn — with scaffolding</p>
          <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink-soft">{enhancement.supported.question}</p>
          <div className="mt-4 space-y-2.5">
            {enhancement.supported.hints.slice(0, revealedHints).map((hint, i) => (
              <div key={i} className="flex gap-2.5 rounded-2xl bg-blue-50/60 border border-blue-100 p-3.5 animate-pop">
                <Lightbulb className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                <p className="text-sm font-bold text-blue-900">Hint {i + 1}: {hint}</p>
              </div>
            ))}
            {revealedHints < enhancement.supported.hints.length ? (
              <button
                onClick={() => setRevealedHints((n) => n + 1)}
                className="w-full rounded-2xl border-2 border-dashed border-blue-300 py-3 text-sm font-extrabold text-blue-700 min-h-[52px] cursor-pointer"
              >
                Need a hint? ({revealedHints}/{enhancement.supported.hints.length} used)
              </button>
            ) : (
              <p className="text-xs font-bold text-gray-500">All hints used — work it through, then move on.</p>
            )}
          </div>
          <button
            onClick={() => { void recordSupported(); next() }}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-[15px] font-extrabold text-white hover:bg-blue-700 min-h-[52px]"
          >
            Attempt on your own <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 5 — Independent: no support, with calibration. A wrong answer
          earns one checkout twin (same skill, new question). */}
      {phase === 'independent' && (
        <div className="rounded-3xl border border-blue-100/70 bg-white p-5 sm:p-7 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)]">
          <p className="font-display text-[22px] font-medium text-black">Prove it — no help this time</p>
          <div className="mt-4 space-y-6">
            {[...independent, ...twins].map((q, i) => (
              <div key={q.id} className={i > 0 ? 'border-t border-gray-100 pt-6' : ''}>
                <BankQuestion
                  question={q}
                  attemptType="independent"
                  subjectId={subjectId}
                  lessonId={note.id}
                  ctaLabel="Check"
                  onAnswered={(correct) => { setResults((r) => [...r, correct]); setIndependentDone((n) => n + 1) }}
                  onWrong={(qid) => {
                    if (!twinnedIds.has(qid)) {
                      setTwinOffers((s) => new Set(s).add(qid))
                    }
                  }}
                />
                {twinOffers.has(q.id) && (
                  <button
                    onClick={() => void requestTwin(q.id)}
                    disabled={twinLoading}
                    className="mt-3 w-full rounded-2xl border-2 border-dashed border-violet-300 py-3 text-sm font-extrabold text-violet-700 min-h-[52px] cursor-pointer disabled:opacity-50"
                  >
                    {twinLoading ? 'Finding a twin...' : 'Not yet — try a twin question'}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={finish}
            disabled={finishing || independentDone < independent.length + twins.length}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-extrabold text-white min-h-[52px] transition-all ${
              finishing || independentDone < independent.length + twins.length ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {finishing ? 'Wrapping up...' : `Finish lesson${independentDone < independent.length + twins.length ? ` (${independentDone}/${independent.length + twins.length} checked)` : ''}`} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 6 — Close-out */}
      {phase === 'done' && (
        <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 text-center animate-pop">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" strokeWidth={2.5} />
          <h2 className="mt-3 font-display text-3xl font-medium text-black">Lesson complete</h2>
          <p className="mt-2 text-[15px] font-semibold text-ink-soft">
            {results.length > 0
              ? `You got ${results.filter(Boolean).length} of ${results.length} retrieval checks right.`
              : 'You worked through the full contract — diagnostic, lesson, and practice.'}
          </p>
          {closeout?.nextReviewAt && (
            <p className="mt-1 text-sm font-bold text-emerald-700">
              Back for review {daysUntil(closeout.nextReviewAt)}.
            </p>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/practice?subject=${encodeURIComponent(note.subject)}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 min-h-[48px]"
            >
              <Target className="h-4 w-4" />
              Practise this topic
            </Link>
            <Link
              href={`/learn/${note.subject}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-ink-soft min-h-[48px]"
            >
              Next lesson
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold text-gray-500 min-h-[48px]"
            >
              All subjects
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

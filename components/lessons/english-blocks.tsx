'use client'

import { useState, useMemo } from 'react'
import { Check, X, Eye } from 'lucide-react'

export interface PassageQuestion {
  question: string
  skill: string
  options: { key: string; text: string }[]
  answer: string
  explanation: string
  evidence: { paragraph: number; start: number; end: number }[]
}

export interface Passage {
  title: string
  purpose: string
  paragraphs: string[]
  questions: PassageQuestion[]
}

export interface MinimalPair {
  pair: [string, string]
  correctIndex: 0 | 1
  rule: string
  counterexample: string
}

export interface SentenceRebuild {
  prompt: string
  answer: string
  rule: string
}

export interface Reflection {
  prompt: string
  modelResponse: string
}

function splitSentences(text: string): { text: string; start: number; end: number }[] {
  const out: { text: string; start: number; end: number }[] = []
  const re = /[^.!?]+[.!?]+["”']?/g
  let m: RegExpExecArray | null
  let lastEnd = 0
  while ((m = re.exec(text)) !== null) {
    const s = m[0].trim()
    if (s) out.push({ text: s, start: m.index, end: m.index + m[0].length })
    lastEnd = m.index + m[0].length
  }
  const tail = text.slice(lastEnd).trim()
  if (tail) out.push({ text: tail, start: lastEnd, end: text.length })
  return out.length > 0 ? out : [{ text: text.trim(), start: 0, end: text.length }]
}

function evidenceSentences(
  paragraphs: string[],
  evidence: { paragraph: number; start: number; end: number }[],
): Set<string> {
  const required = new Set<string>()
  for (const ev of evidence) {
    const para = paragraphs[ev.paragraph]
    if (para === undefined) continue
    for (const s of splitSentences(para)) {
      if (s.start < ev.end && ev.start < s.end) {
        required.add(`${ev.paragraph}:${s.start}`)
      }
    }
  }
  return required
}

function PassageReader({
  passage,
  onAnswered,
}: {
  passage: Passage
  onAnswered: (correct: boolean) => void
}) {
  const [qi, setQi] = useState(0)
  const [tapped, setTapped] = useState<Set<string>>(new Set())
  const [evidenceChecked, setEvidenceChecked] = useState<null | boolean>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [correct, setCorrect] = useState(false)

  const q = passage.questions[qi]
  const required = useMemo(
    () => (q ? evidenceSentences(passage.paragraphs, q.evidence) : new Set<string>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [passage, qi],
  )

  if (!q) return null

  const toggle = (key: string) => {
    if (done) return
    setEvidenceChecked(null)
    setTapped((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const checkEvidence = () => {
    const missing = [...required].filter((k) => !tapped.has(k))
    setEvidenceChecked(missing.length === 0)
  }

  const answer = () => {
    if (!selected || done) return
    const ok = selected === q.answer
    setCorrect(ok)
    setDone(true)
    onAnswered(ok)
  }

  const next = () => {
    if (qi < passage.questions.length - 1) {
      setQi((i) => i + 1)
      setTapped(new Set())
      setEvidenceChecked(null)
      setSelected(null)
      setDone(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/40 p-4 sm:p-5">
      <p className="font-display text-lg font-medium text-black">{passage.title}</p>
      <p className="mt-1 rounded-xl bg-blue-600/10 border border-blue-200 px-3 py-2 text-[13px] font-bold text-blue-800">
        Read to find: {passage.purpose}
      </p>
      <div className="mt-3 space-y-2.5">
        {passage.paragraphs.map((para, pi) => (
          <p key={pi} className="text-[15px] font-semibold leading-[1.7] text-ink-soft">
            {splitSentences(para).map((s) => {
              const key = `${pi}:${s.start}`
              const on = tapped.has(key)
              return (
                <span
                  key={key}
                  onClick={() => toggle(key)}
                  className={`cursor-pointer rounded px-0.5 transition-colors ${
                    on ? 'bg-amber-200 text-black' : 'hover:bg-amber-100'
                  }`}
                >
                  {s.text}{' '}
                </span>
              )
            })}
          </p>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white border border-blue-100 p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
          {q.skill} · Q{qi + 1} of {passage.questions.length}
        </p>
        <p className="mt-1.5 font-display text-lg font-medium text-black">{q.question}</p>

        {!done && (
          <button
            onClick={checkEvidence}
            disabled={tapped.size === 0}
            className="mt-3 w-full rounded-2xl border-2 border-dashed border-blue-300 py-2.5 text-[13px] font-extrabold text-blue-700 min-h-[48px] cursor-pointer disabled:opacity-40"
          >
            {evidenceChecked === false ? 'Not quite — reread, then tap again' : 'Tap the evidence first, then check'}
          </button>
        )}
        {evidenceChecked === true && !done && (
          <p className="mt-2 text-[13px] font-extrabold text-emerald-700">Evidence found — now answer.</p>
        )}

        <div className="mt-3 space-y-2">
          {q.options.map((opt) => {
            const isSel = selected === opt.key
            return (
              <button
                key={opt.key}
                disabled={done}
                onClick={() => setSelected(opt.key)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left min-h-[52px] transition-all ${
                  done
                    ? opt.key === q.answer
                      ? 'border-emerald-500 bg-emerald-50/60'
                      : isSel
                        ? 'border-red-400 bg-red-50/60'
                        : 'border-gray-200 bg-white opacity-70'
                    : isSel
                      ? 'border-blue-600 bg-blue-50/60'
                      : 'border-gray-200 bg-white'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold border-2 ${
                  done && opt.key === q.answer
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : done && isSel
                      ? 'bg-red-500 border-red-500 text-white'
                      : isSel
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-500 bg-white'
                }`}>
                  {opt.key}
                </span>
                <span className="text-sm font-bold text-black">{opt.text}</span>
              </button>
            )
          })}
        </div>

        {!done ? (
          <button
            onClick={answer}
            disabled={!selected}
            className="mt-3 w-full rounded-2xl bg-blue-600 py-3 text-sm font-extrabold text-white min-h-[50px] cursor-pointer disabled:opacity-50 disabled:bg-gray-300"
          >
            Answer
          </button>
        ) : (
          <div className="mt-3 space-y-2.5 animate-pop">
            <p className={`flex items-center gap-1.5 font-display text-lg font-medium ${correct ? 'text-emerald-700' : 'text-red-700'}`}>
              {correct ? <Check className="h-5 w-5" strokeWidth={3} /> : <X className="h-5 w-5" strokeWidth={3} />}
              {correct ? 'Correct — and evidenced.' : `Not quite — the answer is ${q.answer}.`}
            </p>
            <p className="text-sm font-semibold leading-relaxed text-ink-soft">{q.explanation}</p>
            {qi < passage.questions.length - 1 && (
              <button
                onClick={next}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3 text-sm font-extrabold text-ink-soft min-h-[50px] cursor-pointer"
              >
                Next question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function PairComparator({ pair, onAnswered }: { pair: MinimalPair; onAnswered: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const choose = (i: number) => {
    if (done) return
    setPicked(i)
    const ok = i === pair.correctIndex
    setDone(true)
    onAnswered(ok)
  }

  return (
    <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/40 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Which stands?</p>
      <div className="mt-2.5 grid gap-2">
        {pair.pair.map((sentence, i) => {
          const right = done && i === pair.correctIndex
          const wrongPick = done && picked === i && i !== pair.correctIndex
          return (
            <button
              key={i}
              disabled={done}
              onClick={() => choose(i)}
              className={`rounded-2xl border-2 p-3.5 text-left text-[15px] font-bold min-h-[56px] transition-all cursor-pointer ${
                right
                  ? 'border-emerald-500 bg-emerald-50/60 text-black'
                  : wrongPick
                    ? 'border-red-400 bg-red-50/60 text-black'
                    : 'border-gray-200 bg-white text-black hover:border-blue-400'
              }`}
            >
              {sentence}
            </button>
          )
        })}
      </div>
      {done && (
        <div className="mt-3 rounded-2xl bg-white border border-blue-100 p-3.5 animate-pop">
          <p className="text-sm font-extrabold text-black">Rule: {pair.rule}</p>
          <p className="mt-1 text-[13px] font-semibold text-ink-soft">Counterexample: {pair.counterexample}</p>
        </div>
      )}
    </div>
  )
}

export function RebuildCard({ item }: { item: SentenceRebuild }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/40 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">Rebuild it</p>
      <p className="mt-1.5 text-[15px] font-bold text-black">{item.prompt}</p>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-blue-600 px-4 py-2 text-[13px] font-extrabold text-blue-700 min-h-[44px] cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          Commit to an answer, then reveal
        </button>
      ) : (
        <div className="mt-3 rounded-2xl bg-white border border-emerald-200 p-3.5 animate-pop">
          <p className="text-sm font-extrabold text-emerald-800">{item.answer}</p>
          <p className="mt-1 text-[13px] font-semibold text-ink-soft">{item.rule}</p>
        </div>
      )}
    </div>
  )
}

export function ReflectionCard({ item }: { item: Reflection }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-violet-700">Your turn to think</p>
      <p className="mt-1.5 text-[15px] font-bold text-black">{item.prompt}</p>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-violet-400 px-4 py-2 text-[13px] font-extrabold text-violet-700 min-h-[44px] cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          Decide first, then compare
        </button>
      ) : (
        <div className="mt-3 rounded-2xl bg-white border border-violet-200 p-3.5 animate-pop">
          <p className="text-sm font-semibold leading-relaxed text-ink-soft">{item.modelResponse}</p>
        </div>
      )}
    </div>
  )
}

export default PassageReader

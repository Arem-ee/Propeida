import type { Metadata } from 'next'
import Link from 'next/link'
import TeachSections from '@/components/lessons/teach-sections'
import type { NoteSection } from '@/lib/notes'

export const metadata: Metadata = {
  title: 'Lesson preview',
  robots: { index: false, follow: false },
}

const summary =
  'Legitimacy is the belief that a government has the right to rule. It is not the same as power, and it is not the same as legality.'

const sections: NoteSection[] = [
  {
    heading: 'A governor nobody voted for',
    paragraphs: [
      'A state governor dies in office, and the deputy is sworn in the same night. The courts, civil servants and police all obey the new governor’s orders. Yet many citizens say the new leader has no right to rule them.',
      'Legitimacy is the belief that a ruler has the right to govern, not merely the ability to make people obey. A government can hold power through force and still lack legitimacy. It can also lose popularity at an election and still be legitimate, because legitimacy rests on acceptance of the system that put it there.',
    ],
    bullets: [
      'Power is the capacity to compel; legitimacy is the acceptance that the compulsion is rightful.',
      'Legitimacy is a belief held by the governed, so it cannot be created by a decree.',
    ],
    takeaway: 'Legitimacy is the accepted right to rule, not the raw ability to compel.',
    check: {
      question: 'A government stays in office by threatening its opponents. Which description fits best?',
      options: [
        'It has legitimacy but no power.',
        'It has power but not legitimacy.',
        'It has traditional authority.',
        'It has sovereignty but no government.',
      ],
      answer: 1,
      why: 'Force can secure obedience, but legitimacy is the accepted right to rule.',
    },
  },
  {
    heading: 'Legal, but not accepted',
    paragraphs: [
      'An election returns a governor with 51 per cent of the vote. Turnout was low, two parties boycotted, and observers call the count credible. The result is legal, but a large minority says the winner has no mandate.',
      'Legality asks whether a ruler followed the rules in force; legitimacy asks whether people accept the ruler’s right to rule. A takeover can follow a country’s constitution and still be illegitimate to its citizens. A government can claim legitimacy by tradition (a monarch), by charisma (a trusted leader), or by rational-legal rules (an elected office).',
    ],
    bullets: [
      'Max Weber’s three claims to legitimacy are traditional, charismatic and rational-legal.',
      'Legality is about procedure; legitimacy is about acceptance.',
    ],
    takeaway: 'Legality is following the rules; legitimacy is being accepted by the governed.',
    check: {
      question: 'A government wins an election that many citizens believe was rigged. What does it have?',
      options: [
        'Legitimacy but not legality.',
        'Neither legality nor power.',
        'Legality but contested legitimacy.',
        'Traditional authority only.',
      ],
      answer: 2,
      why: 'Following the rules makes the result legal; acceptance makes it legitimate.',
    },
  },
  {
    heading: 'Why legitimacy is cheaper than force',
    paragraphs: [
      'A government raises a new tax. Where citizens accept its right to tax, most pay without a court case. Where they do not, the state must deploy police, tax officials and lawyers to collect the same money.',
      'Legitimate governments govern more cheaply because people comply voluntarily. They also change power peacefully, because losers accept the result when they trust the process. Legitimacy can rest on performance (delivering schools and security) or on process (free elections and fair courts). Performance alone is fragile: a government that stops delivering loses its claim, while process legitimacy can survive a bad year.',
    ],
    bullets: [
      'Voluntary compliance is the practical dividend of legitimacy.',
      'Process legitimacy is more durable than performance legitimacy.',
    ],
    takeaway:
      'Legitimacy makes obedience voluntary, so governing costs less and power changes peacefully.',
    check: {
      question: 'Why do legitimate governments govern more cheaply?',
      options: [
        'They collect higher taxes than other governments.',
        'Citizens comply without constant coercion.',
        'They do not need a civil service.',
        'They avoid holding elections.',
      ],
      answer: 1,
      why: 'When people accept the right to rule, force is needed less often.',
    },
  },
]

export default function LessonPreviewPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="text-sm font-extrabold text-blue-700 hover:underline">
          ← Propeida
        </Link>
        <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-500">
          Preview
        </span>
      </div>

      <div className="rounded-3xl border border-blue-100/70 bg-white p-5 shadow-[0_2px_16px_-8px_rgba(16,28,51,0.15)] sm:p-7 animate-fade-up">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
          Government · Basic Concepts of Government
        </p>
        <h1 className="mt-2 font-display text-[26px] font-medium leading-tight text-black">
          Legitimacy: the right to rule
        </h1>
        <p className="mt-2 text-[15px] font-semibold leading-relaxed text-ink-soft">{summary}</p>

        <TeachSections summary={summary} sections={sections} />

        <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
          <p className="font-display text-base font-medium text-amber-900">Exam tip</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-amber-900">
            If a question asks whether a government is legitimate, check whether people accept its
            right to rule. If it asks whether an act is legal, check the rules in force. Do not let
            one answer stand in for the other.
          </p>
        </div>

        <Link
          href="/signup"
          className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 py-3.5 text-[15px] font-extrabold text-white min-h-[52px] hover:bg-blue-700 pressable"
        >
          Start practising
        </Link>
      </div>

      <p className="mt-6 text-center text-[12px] font-semibold text-gray-500">
        Prototype reading flow: one concept, three section cards, one check per card.
      </p>
    </main>
  )
}

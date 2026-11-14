'use client'

import { useState } from 'react'
import { GLOSSARY } from '@/lib/glossary'

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)
const PATTERN = new RegExp(`\\b(${TERMS.map(escapeForRegex).join('|')})\\b`, 'gi')

function GlossTerm({ term }: { term: string }) {
  const [open, setOpen] = useState(false)
  const definition = GLOSSARY[term.toLowerCase()]
  if (!definition) return <>{term}</>
  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="cursor-help rounded-sm underline decoration-dotted decoration-2 underline-offset-[3px] decoration-blue-400 transition-colors hover:decoration-blue-700"
      >
        {term}
      </button>
      {open && (
        <span
          role="note"
          className="absolute left-0 top-[calc(100%+2px)] z-30 inline-flex max-w-[240px] flex-col rounded-xl border border-blue-200 bg-white px-3 py-2 shadow-lg animate-pop-in"
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
            {term.toLowerCase()}
          </span>
          <span className="mt-0.5 text-[12px] font-semibold leading-snug text-ink-soft">
            {definition}
          </span>
        </span>
      )}
    </span>
  )
}

/**
 * Renders body text with syllabus vocabulary wrapped in tap-to-define
 * terms. Matching is whole-word, case-insensitive, longest term first.
 */
export function GlossText({ text }: { text: string }) {
  const parts = text.split(PATTERN)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 && GLOSSARY[part.toLowerCase()] ? (
          <GlossTerm key={i} term={part} />
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

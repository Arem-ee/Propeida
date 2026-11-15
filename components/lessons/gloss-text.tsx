'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { MathText } from './math-text'
import { GLOSSARY } from '@/lib/glossary'

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)
const PATTERN = new RegExp(`\\b(${TERMS.map(escapeForRegex).join('|')})\\b`, 'gi')
const MATH_TOKEN = /(\{\{(?:sub|sup|frac):[^{}]*\}\})/g

function GlossTerm({ term }: { term: string }) {
  const [open, setOpen] = useState(false)
  const definition = GLOSSARY[term.toLowerCase()]
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])
  if (!definition) return <>{term}</>
  return (
    <span className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? `gloss-def-${term.toLowerCase()}` : undefined}
        className="cursor-help rounded-sm underline decoration-dotted decoration-2 underline-offset-[3px] decoration-blue-400 transition-colors hover:decoration-blue-700"
      >
        {term}
      </button>
      {open && (
        <>
          {createPortal(
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[65] cursor-pointer bg-slate-900/20 backdrop-blur-[2px] animate-fade-up"
            />,
            document.body,
          )}
          <span
            id={`gloss-def-${term.toLowerCase()}`}
            role="dialog"
            aria-modal="false"
            aria-label={`Definition of ${term}`}
            className="absolute left-0 z-[70] mt-1.5 inline-flex w-64 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-blue-100 bg-white p-3 text-left shadow-[0_18px_44px_-16px_rgba(16,28,51,0.45)] animate-pop-in"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-500">
                Definition
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close definition"
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-blue-50 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
            <span className="mt-0.5 block font-display text-lg leading-snug text-black">
              {term.toLowerCase()}
            </span>
            <span className="mt-1.5 block border-t border-blue-100/70 pt-1.5 text-[12px] font-semibold leading-snug text-ink-soft">
              {definition}
            </span>
          </span>
        </>
      )}
    </span>
  )
}

/**
 * Renders body text with syllabus vocabulary wrapped in tap-to-define
 * terms. Matching is whole-word, case-insensitive, longest term first.
 */
export function GlossText({ text }: { text: string }) {
  const mathPieces = text.split(MATH_TOKEN)
  return (
    <>
      {mathPieces.map((mathPiece, mi) =>
        mi % 2 === 1 ? (
          <MathText key={mi} text={mathPiece} />
        ) : (
          mathPiece.split(PATTERN).map((part, i) =>
            i % 2 === 1 && GLOSSARY[part.toLowerCase()] ? (
              <GlossTerm key={`${mi}-${i}`} term={part} />
            ) : (
              <span key={`${mi}-${i}`}>{part}</span>
            ),
          )
        ),
      )}
    </>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const definition = GLOSSARY[term.toLowerCase()]

  useEffect(() => {
    if (!open) return

    // Keep the popup pinned above the trigger, inside the viewport.
    const positionPopup = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const width = 256 // w-64
      const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12))
      setPosition({ top: rect.bottom + 6, left })
    }
    positionPopup()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onDismiss = () => setOpen(false)

    window.addEventListener('keydown', onKeyDown)
    // A fixed popup stops making sense once the lesson scrolls; dismiss cleanly.
    window.addEventListener('scroll', onDismiss, true)
    window.addEventListener('resize', onDismiss)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onDismiss, true)
      window.removeEventListener('resize', onDismiss)
    }
  }, [open])

  if (!definition) return <>{term}</>

  return (
    <span className="relative inline">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? `gloss-def-${term.toLowerCase()}` : undefined}
        className="cursor-help rounded-sm underline decoration-dotted decoration-2 underline-offset-[3px] decoration-blue-400 transition-colors hover:decoration-blue-700"
      >
        {term}
      </button>
      {open && position
        ? createPortal(
            <>
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[65] cursor-pointer bg-black/30 animate-fade-up"
              />
              <span
                id={`gloss-def-${term.toLowerCase()}`}
                role="dialog"
                aria-modal="false"
                aria-label={`Definition of ${term}`}
                style={{ top: position.top, left: position.left }}
                className="fixed z-[70] w-64 flex-col items-start rounded-2xl border border-blue-100 bg-white p-3 text-left shadow-[0_18px_44px_-16px_rgba(16,28,51,0.45)] animate-pop-in flex"
              >
                <span className="flex w-full items-center justify-between gap-3">
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
                <span className="mt-1.5 block w-full border-t border-blue-100/70 pt-1.5 text-[12px] font-semibold leading-snug text-ink-soft">
                  {definition}
                </span>
              </span>
            </>,
            document.body,
          )
        : null}
    </span>
  )
}

/**
 * Renders body text with syllabus vocabulary wrapped in tap-to-define
 * terms, and inline **emphasis** on key numbers/words. Matching is
 * whole-word, case-insensitive, longest term first.
 */
const BOLD = /(\*\*[^*]+\*\*)/g

/** Shared renderer: tokens become maths, glossary terms become tap-to-define. */
function renderRich(source: string, keyPrefix: string) {
  const mathPieces = source.split(MATH_TOKEN)
  return (
    <>
      {mathPieces.map((mathPiece, mi) =>
        mi % 2 === 1 ? (
          <MathText key={`${keyPrefix}-${mi}`} text={mathPiece} />
        ) : (
          mathPiece.split(PATTERN).map((part, i) =>
            i % 2 === 1 && GLOSSARY[part.toLowerCase()] ? (
              <GlossTerm key={`${keyPrefix}-${mi}-${i}`} term={part} />
            ) : (
              <span key={`${keyPrefix}-${mi}-${i}`}>{part}</span>
            ),
          )
        ),
      )}
    </>
  )
}

export function GlossText({ text }: { text: string }) {
  // Split on the bold markers FIRST so a token sitting inside a bold span
  // does not split the markers apart. Tokens inside bold still render as
  // inline maths, wrapped in <strong>.
  const boldParts = String(text ?? '').split(BOLD)
  return (
    <>
      {boldParts.map((part, pi) => {
        if (!part) return null
        const isBold = part.length >= 4 && part.startsWith('**') && part.endsWith('**')
        const inner = isBold ? part.slice(2, -2) : part
        if (!inner) return null
        const children = renderRich(inner, `p${pi}`)
        return isBold ? <strong key={pi}>{children}</strong> : <span key={pi}>{children}</span>
      })}
    </>
  )
}

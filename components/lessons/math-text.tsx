'use client'

import type { ReactNode } from 'react'

/**
 * MathText: renders inline mathematics the learner reads inside lesson
 * prose, section cards and worked steps.
 *
 * Authoring tokens (ASCII, safe in JSON, never visible to learners raw):
 *   x{{sub:1}}     subscript            -> x with lowered small 1
 *   x{{sup:2}}     superscript          -> x with raised small 2
 *   {{frac:3|4}}   stacked fraction     -> 3 over 4 with a vinculum
 *
 * The tokens survive every database round-trip untouched and are parsed
 * in reading order. Nesting is intentionally unsupported: factors belong
 * in sibling tokens, e.g. y{{sup:2}} is fine but {{frac:{{sup:1}}|2}} is
 * not legal; sqrt stays inline as √3 and the fraction carries it: {{frac:√3|2}}.
 */
const TOKEN = /(\{\{(?:sub|sup|frac):[^{}]*\}\})/g

function parseToken(token: string): { kind: 'sub' | 'sup' | 'frac'; a: string; b?: string } | null {
  const m = /^\{\{(sub|sup|frac):([^{}]*)\}\}$/.exec(token)
  if (!m) return null
  const [, kind, body = ''] = m
  if (kind === 'frac') {
    const separator = body.indexOf('|')
    if (separator === -1) return null
    return { kind: 'frac', a: body.slice(0, separator).trim(), b: body.slice(separator + 1).trim() }
  }
  return { kind: kind as 'sub' | 'sup', a: body.trim() }
}

function renderNodes(text: string, keyPrefix: string): ReactNode[] {
  const parts = String(text ?? '').split(TOKEN)
  const out: ReactNode[] = []
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i] ?? ''
    if (i % 2 === 0) {
      out.push(<span key={`${keyPrefix}-t${i}`}>{part}</span>)
      continue
    }
    const parsed = parseToken(part)
    if (!parsed) {
      out.push(<span key={`${keyPrefix}-x${i}`}>{part}</span>)
      continue
    }
    const inner = (s: string) => renderNodes(s, `${keyPrefix}-${i}`)
    if (parsed.kind === 'sub') {
      out.push(
        <sub key={`${keyPrefix}-s${i}`} className="text-[0.72em] leading-none">
          {inner(parsed.a)}
        </sub>,
      )
      continue
    }
    if (parsed.kind === 'sup') {
      out.push(
        <sup key={`${keyPrefix}-p${i}`} className="text-[0.72em] leading-none">
          {inner(parsed.a)}
        </sup>,
      )
      continue
    }
    const num = inner(parsed.a)
    const den = inner(parsed.b ?? '')
    out.push(
      <span
        key={`${keyPrefix}-f${i}`}
        role="math"
        className="inline-flex flex-col items-center align-[-0.32em] px-[0.18em] font-semibold leading-none"
      >
        <span className="px-[0.25em] pb-[0.1em] leading-none">{num}</span>
        <span aria-hidden="true" className="w-full border-t-[1.5px] border-current" />
        <span className="px-[0.25em] pt-[0.12em] leading-none">{den}</span>
      </span>,
    )
  }
  return out
}

export function MathText({ text }: { text: string }) {
  return <>{renderNodes(text, 'm')}</>
}

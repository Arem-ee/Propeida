'use client'

import type { ReactNode } from 'react'
import katex from 'katex'

/**
 * MathText: renders inline mathematics the learner reads inside lesson
 * prose, section cards and worked steps.
 *
 * Display mode (the centred maths panel) comes from the `display` prop or
 * a leading `MATH:` prefix, never from the shape of the input. Fragment
 * callers pass maths-only tokens inside sentences; those must stay inline.
 *
 * Authoring tokens (ASCII, safe in JSON, never visible to learners raw):
 *   x{{sub:1}}     subscript            -> x with lowered small 1
 *   x{{sup:2}}     superscript          -> x with raised small 2
 *   {{frac:3|4}}   stacked fraction     -> 3 over 4
 *
 * LaTeX is the rendering engine (KaTeX): tokens carry tiny LaTeX fragments,
 * and the spaces-and-atoms method decides what inside plain text is math and
 * what is prose. Prose stays prose: only atoms that carry math meaning are
 * typeset, everything else is upright reading text.
 */
const TOKEN = /(\{\{(?:sub|sup|frac):[^{}]*\}\})/g

// Raw → LaTeX character mapping. Applied to everything fed into KaTeX,
// including the bodies of tokens.
const LATEX_MAP: Array<[RegExp, string]> = [
  [/√\(([^()]*)\)/g, '\\sqrt{$1}'],
  [/√([0-9a-zA-Zπ]+)/g, '\\sqrt{$1}'],
  [/∛\(([^()]*)\)/g, '\\sqrt[3]{$1}'],
  [/∛([0-9a-zA-Z]+)/g, '\\sqrt[3]{$1}'],
  [/×/g, ' \\times '],
  [/·/g, ' \\cdot '],
  [/÷/g, ' \\div '],
  [/−/g, '-'],
  [/≤/g, ' \\leq '],
  [/≥/g, ' \\geq '],
  [/≠/g, ' \\neq '],
  [/≈/g, ' \\approx '],
  [/±/g, ' \\pm '],
  [/∝/g, ' \\propto '],
  [/∪/g, ' \\cup '],
  [/∩/g, ' \\cap '],
  [/∅/g, ' \\emptyset '],
  [/Σ/g, ' \\Sigma '],
  [/∫/g, ' \\int '],
  [/∂/g, ' \\partial '],
  [/π/g, ' \\pi '],
  [/θ/g, ' \\theta '],
  [/Δ/g, ' \\Delta '],
  [/δ/g, ' \\delta '],
  [/σ/g, ' \\sigma '],
  [/α/g, ' \\alpha '],
  [/β/g, ' \\beta '],
  [/γ/g, ' \\gamma '],
  [/λ/g, ' \\lambda '],
  [/μ/g, ' \\mu '],
  [/ε/g, ' \\epsilon '],
  [/φ/g, ' \\phi '],
  [/ω/g, ' \\omega '],
  [/Ω/g, ' \\Omega '],
  [/ρ/g, ' \\rho '],
  [/τ/g, ' \\tau '],
  [/ν/g, ' \\nu '],
  [/∞/g, ' \\infty '],
  [/→/g, ' \\rightarrow '],
  [/°/g, '^\\circ{} '],
]

const MATH_SYMBOLS = /[√∛πθαΣλμ∫∂∈×·÷≤≥≠≈±∝∞∪∩∅→^_−{%0-9]/
const GREEK_OR_MATH = /[πθΔδσαβγλεμΣϕφωΩρτν∂∫]/
const SHORT_VARIABLE = /^[A-Za-z]{1,2}$/
// Words of 1–2 characters that read as English interjections/articles inside
// math lines. They stay upright prose even inside a math run.
const PROSE_SHORT = new Set(['a', 'an', 'so', 'to', 'in', 'on', 'it', 'is', 'as', 'at', 'an', 'if', 'or', 'we', 'me', 'be', 'by', 'no', 'my', 'of', 'and'])

function isMathPiece(piece: string): boolean {
  const t = piece.trim()
  if (!t) return false
  if (t.includes('{{')) return true
  if (PROSE_SHORT.has(t.toLowerCase())) return false
  if (MATH_SYMBOLS.test(t)) return true
  if (GREEK_OR_MATH.test(t)) return true
  if (SHORT_VARIABLE.test(t)) return true
  return false
}

// Stand-alone punctuation/operators that belong to a maths line, never to
// English prose. Used by isMathOnly so authors never need a prefix.
const PURE_OPERATORS = /^[+\-=×÷·(),.;:%[\]{}]+$/

/**
 * A paragraph that is maths only: digits, operators, greek letters, KaTeX
 * fragments and explicit {{sub:}} tokens. Any lowercase English word makes
 * the line a sentence, not a maths line, and it stays inline prose.
 *
 * Paragraph dispatchers use this to decide how to render a full paragraph:
 * true means render with the `display` panel, false means prose paragraph
 * with inline maths. It decides nothing inside MathText itself. (The legacy
 * `MATH:` prefix still forces a panel.)
 */
export function isMathOnly(src: string): boolean {
  const body = String(src ?? '').replace(/^MATH:\s*/i, '')
  if (!body.trim()) return false
  const parts = body.split(TOKEN)
  for (let index = 0; index < parts.length; index++) {
    const piece = parts[index] ?? ''
    if (index % 2 === 1) continue // explicit math tokens are maths
    for (const p of piece.split(/(\s+)/)) {
      if (!p.trim()) continue
      if (!isMathPiece(p) && !PURE_OPERATORS.test(p)) return false
    }
  }
  return true
}

function convert(src: string): string {
  let out = String(src)
  // Tokens were split out before this ran, so any raw braces left are
  // literal braces the author meant, not LaTeX delimiters.
  out = out.replace(/\{/g, '\\{').replace(/\}/g, '\\}')
  for (const [re, to] of LATEX_MAP) out = out.replace(re, to)
  // Raw % is a comment char in LaTeX; keep it readable in math mode.
  out = out.replace(/([0-9]+(?:\.[0-9]+)?)%/g, '$1\\\\%')
  // Numeric divisions written plainly by the question bank (e.g. -3/2,
  // 5/2, √3/2) become stacked fractions, the way JAMB prints them. The
  // explicit {{frac:a|b}} token is split out before convert() and is
  // untouched. Keep a decimal or sqrt numerator intact inside the brace.
  out = out.replace(
    /(^|[\s(+\-])([+-]?(?:\\sqrt\{[^}]*\}|\d+(?:\.\d+)?))\s*\/\s*(\d+(?:\.\d+)?)(?=$|[\s)+\-.,;])/g,
    '$1\\frac{$2}{$3}',
  )
  return out
}

/** Token body → LaTeX. Single long English words inside frac args read as words, not variables. */
function tokenToLatex(token: string): string | null {
  const m = /^\{\{(sub|sup|frac):([^{}]*)\}\}$/.exec(token)
  if (!m) return null
  const [, kind, body = ''] = m
  const wrapArg = (arg: string) => {
    const t = arg.trim()
    return /^[a-z]{4,}$/.test(t) ? `\\text{${t}}` : convert(t)
  }
  if (kind === 'frac') {
    const i = body.indexOf('|')
    if (i === -1) return null
    return `\\frac{${wrapArg(body.slice(0, i))}}{${wrapArg(body.slice(i + 1))}}`
  }
  const inner = convert(body.trim())
  return kind === 'sub' ? `_{${inner}}` : `^{${inner}}`
}

function renderKaTeX(src: string, _display = false): string | null {
  try {
    // KaTeX's displayMode emits katex-display, which is block-level and
    // stacks every span on its own line. We keep inline output and style our
    // own wrapper element for centering/size instead.
    return katex.renderToString(src, {
      throwOnError: false,
      strict: false,
      output: 'html',
    })
  } catch {
    return null
  }
}

function renderToken(token: string, key: number, displayMode = false): ReactNode {
  const latex = tokenToLatex(token)
  const html = latex ? renderKaTeX(latex, displayMode) : null
  if (!html) return <span key={key}>{token}</span>
  return (
    <span
      key={key}
      className="mathx"
      role={displayMode ? undefined : 'math'}
      aria-label={displayMode ? undefined : 'mathematics'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function splitRuns(text: string): Array<{ math: boolean; src: string }> {
  const pieces = String(text ?? '').split(/(\s+)/)
  const runs: { math: boolean; src: string }[] = []
  let buf = ''
  let bufMath = false
  for (const piece of pieces) {
    if (!piece) continue
    if (!piece.trim()) {
      if (buf) { runs.push({ math: bufMath, src: buf }); buf = '' }
      runs.push({ math: false, src: piece })
      continue
    }
    const math = isMathPiece(piece)
    if (buf === '') {
      buf = piece
      bufMath = math
      continue
    }
    if (math === bufMath) {
      buf += piece
      continue
    }
    runs.push({ math: bufMath, src: buf })
    buf = piece
    bufMath = math
  }
  if (buf) runs.push({ math: bufMath, src: buf })
  return runs
}

export function MathText({ text, display }: { text: string; display?: boolean }) {
  const raw = String(text ?? '')
  // Block panels are decided by the caller (`display` prop), never by the
  // shape of the input. Fragment callers (GlossText, question stems, step
  // cells) would otherwise turn every maths-only fragment into a block.
  // The legacy `MATH:` prefix still forces a panel.
  const auto = /^MATH:\s*/.test(raw)
  const displayMode = display || auto
  const body = auto ? raw.replace(/^MATH:\s*/, '') : raw
  const parts = body.split(TOKEN)
  const out: ReactNode[] = []
  parts.forEach((piece, index) => {
    if (index % 2 === 1) {
      out.push(renderToken(piece, index, displayMode))
      return
    }
    const runs = splitRuns(piece)
    runs.forEach((run, r) => {
      if (run.math) {
        const html = renderKaTeX(convert(run.src), displayMode)
        if (html) {
          out.push(
            <span
              key={`${index}-math-${r}`}
              className="mathx"
              role={displayMode ? undefined : 'math'}
              aria-label={displayMode ? undefined : 'mathematics'}
              dangerouslySetInnerHTML={{ __html: html }}
            />,
          )
          return
        }
      }
      out.push(<span key={`${index}-text-${r}`}>{run.src}</span>)
    })
  })
  if (displayMode && out.length > 0) {
    return <div className="my-3 overflow-x-auto rounded-xl border border-blue-100 bg-blue-50/40 px-5 py-4 text-center text-[21px] font-medium text-blue-900">{out}</div>
  }
  return <>{out}</>
}

'use client'

import type { ReactNode } from 'react'
import katex from 'katex'

/**
 * MathText: renders inline mathematics the learner reads inside lesson
 * prose, section cards and worked steps.
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

function convert(src: string): string {
  let out = String(src)
  // Tokens were split out before this ran, so any raw braces left are
  // literal braces the author meant, not LaTeX delimiters.
  out = out.replace(/\{/g, '\\{').replace(/\}/g, '\\}')
  for (const [re, to] of LATEX_MAP) out = out.replace(re, to)
  // Raw % is a comment char in LaTeX; keep it readable in math mode.
  out = out.replace(/([0-9]+(?:\.[0-9]+)?)%/g, '$1\\\\%')
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

function renderKaTeX(src: string, displayMode = false): string | null {
  try {
    return katex.renderToString(src, {
      throwOnError: false,
      strict: false,
      output: 'html',
      displayMode,
    })
  } catch {
    return null
  }
}

function renderToken(token: string, key: number, displayMode = false): ReactNode {
  const latex = tokenToLatex(token)
  const html = latex ? renderKaTeX(latex, displayMode) : null
  if (!html) return <span key={key}>{token}</span>
  if (displayMode) {
    return (
      <div key={key} className="my-2 overflow-x-auto text-center text-[21px] font-medium leading-relaxed text-blue-900" role="math">
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }
  return <span key={key} className="mathx" dangerouslySetInnerHTML={{ __html: html }} />
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
  const auto = /^MATH:\s*/.test(raw)
  // MATH: lines are single display-mode equations — one KaTeX call, no splits.
  if (auto) {
    const body = raw.replace(/^MATH:\s*/, '').trim()
    const latex = convert(body)
      .replace(/\{\{sub:([^{}]+)\}\}/g, '_{$1}')
      .replace(/\{\{sup:([^{}]+)\}\}/g, '^{$1}')
      .replace(/\{\{frac:([^{}|]*)\|([^{}|]*)\}\}/g, '\\frac{$1}{$2}')
    const html = renderKaTeX(latex, true)
    if (html) {
      return (
        <div className="my-3 overflow-x-auto rounded-xl border border-blue-100 bg-blue-50/40 px-5 py-4 text-center text-[19px] font-medium text-blue-900">
          <span dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )
    }
    // Fall back to literal text so an author never loses their work.
    return <div className="my-3 overflow-x-auto rounded-xl border border-blue-100 bg-blue-50/40 px-5 py-4 text-center font-mono text-[15px] text-blue-900">{body}</div>
  }

  const displayMode = display
  const parts = raw.split(TOKEN)
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
            display
              ? (
                <div
                  key={`${index}-math-${r}`}
                  className="my-2 overflow-x-auto text-[19px] font-medium leading-relaxed text-blue-900"
                  role="math"
                >
                  <span dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              )
              : (
                <span
                  key={`${index}-math-${r}`}
                  className="mathx"
                  role="math"
                  aria-label="mathematics"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ),
          )
          return
        }
      }
      out.push(<span key={`${index}-text-${r}`}>{run.src}</span>)
    })
  })
  if (displayMode && out.length > 0) {
    return <div className="my-3 rounded-xl border border-blue-100 bg-blue-50/40 px-5 py-3 text-center">{out}</div>
  }
  return <>{out}</>
}

/**
 * Human paste format for bulk question authoring. Designed to survive
 * Word/Google Docs pastes (no commas, no quoting rules — unlike CSV):
 *
 *   # subject: english | exam: unilorin-post-utme | difficulty: medium
 *   Q: Complete the sentence: 'She ___ the piano every day.'
 *   A) practice
 *   B) practicing
 *   C) has practiced
 *   D) will practice
 *   Answer: C
 *   Explanation: Duration since the past needs the perfect tense.
 *   ---
 *   Q: ... (inherits the header above until a new # header)
 *
 * A `#` header sets defaults (subject, exam, difficulty) for following
 * blocks. Every block needs Q, four options, Answer (A-D), Explanation.
 */

export interface PastedQuestion {
  exam_slug: string
  subject_slug: string
  question_text: string
  options: { key: string; text: string }[]
  correct_answer: string
  explanation: string
  difficulty: string
  cognitive_level: string | null
  source: string
}

export interface PasteIssue {
  block: number
  reason: string
}

const HEADER_KEYS: Record<string, string> = {
  subject: 'subject',
  exam: 'exam',
  difficulty: 'difficulty',
  level: 'cognitive_level',
  cognitive_level: 'cognitive_level',
}

export function parsePastedQuestions(text: string): { questions: PastedQuestion[]; issues: PasteIssue[] } {
  const questions: PastedQuestion[] = []
  const issues: PasteIssue[] = []

  const defaults: { subject: string; exam: string; difficulty: string; cognitive_level: string } = {
    subject: '',
    exam: '',
    difficulty: '',
    cognitive_level: '',
  }
  // Split on --- rules; blank-line-only separation is ambiguous inside
  // explanations, so --- is required and documented in the UI.
  const blocks = text.split(/^\s*---+\s*$/m)

  blocks.forEach((rawBlock, index) => {
    const blockNo = index + 1
    const lines = rawBlock.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return

    const fields: Record<string, string> = {}
    let lastKey: string | null = null
    for (const line of lines) {
      if (line.startsWith('#')) {
        for (const part of line.slice(1).split('|')) {
          const [k, ...rest] = part.split(':')
          const key = HEADER_KEYS[(k ?? '').trim().toLowerCase()]
          if (key) defaults[key as keyof typeof defaults] = rest.join(':').trim()
        }
        lastKey = null
        continue
      }
      const optionMatch = line.match(/^([A-Ea-e])\s*[).:]\s*(.+)$/)
      if (optionMatch) {
        const optKey = `option_${optionMatch[1]!.toLowerCase()}`
        fields[optKey] = optionMatch[2]!.trim()
        lastKey = optKey
        continue
      }
      const fieldMatch = line.match(/^(Q|Question|Answer|Explanation)\s*:\s*(.+)$/i)
      if (fieldMatch) {
        const name = fieldMatch[1]!.toLowerCase()
        const key = name === 'q' || name === 'question' ? 'question_text' : name
        fields[key] = (fields[key] ? fields[key] + ' ' : '') + fieldMatch[2]!.trim()
        lastKey = key
        continue
      }
      // Continuation of the previous field (multi-line questions and
      // explanations stay readable without escaping rules).
      if (lastKey) {
        fields[lastKey] = (fields[lastKey] ? fields[lastKey] + ' ' : '') + line
      } else {
        fields.explanation = (fields.explanation ? fields.explanation + ' ' : '') + line
        lastKey = 'explanation'
      }
    }

    const fail = (reason: string) => issues.push({ block: blockNo, reason })
    const questionText = fields.question_text ?? ''
    const answer = (fields.answer ?? '').trim().toLowerCase()
    const difficulty = (defaults.difficulty || '').toLowerCase()

    if (!questionText) return fail('missing Q: line')
    const options = ['a', 'b', 'c', 'd', 'e']
      .map((k) => ({ key: k, text: fields[`option_${k}`] ?? '' }))
      .filter((o) => o.key !== 'e' || o.text)
    const missing = ['a', 'b', 'c', 'd'].map((k) => ({ key: k, text: fields[`option_${k}`] ?? '' })).filter((o) => !o.text).map((o) => o.key.toUpperCase())
    if (missing.length > 0) return fail(`missing option(s): ${missing.join(', ')}`)
    if (!['a', 'b', 'c', 'd', 'e'].includes(answer)) return fail('Answer: must be A, B, C, D, or E')
    if (answer === 'e' && !fields.option_e) return fail('Answer E needs an option E line')
    if (!(fields.explanation ?? '').trim()) return fail('missing Explanation: line')
    if (!defaults.subject) return fail('no subject set — add a # subject: <slug> header above')
    if (!defaults.exam) return fail('no exam set — add a # exam: <slug> header above')
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return fail('difficulty must be easy, medium, or hard (set in the # header)')
    }
    const level = (defaults.cognitive_level || '').toLowerCase()
    if (level && !['remember', 'understand', 'apply', 'analyze'].includes(level)) {
      return fail('level must be remember, understand, apply, or analyze')
    }

    questions.push({
      exam_slug: defaults.exam,
      subject_slug: defaults.subject,
      question_text: questionText,
      options,
      correct_answer: answer,
      explanation: (fields.explanation ?? '').trim(),
      difficulty,
      cognitive_level: level || null,
      source: 'paste_import',
    })
  })

  return { questions, issues }
}

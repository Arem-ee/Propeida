export function normalizeOptions(options: unknown): { key: string; text: string }[] {
  if (Array.isArray(options)) return options as { key: string; text: string }[]
  if (options && typeof options === 'object') {
    const obj = options as Record<string, string>
    const keys = ['a', 'b', 'c', 'd']
    return keys.filter((k) => k in obj).map((k) => ({ key: k, text: obj[k] ?? '' }))
  }
  return []
}

export interface MisconceptionInput {
  option_key: string
  misconception_code: string
  misconception_name: string
  explanation: string
  repair_note_id?: string | null
}

const OPTION_KEYS = ['a', 'b', 'c', 'd']

/**
 * Validate admin-submitted misconception rows. A misconception names the
 * error a WRONG option reveals, so the correct option is rejected, as are
 * blanks and unknown keys. Returns clean rows or throws with a message.
 */
export function validateMisconceptions(
  input: unknown,
  correctAnswer: string,
): MisconceptionInput[] {
  if (input === undefined || input === null) return []
  if (!Array.isArray(input)) throw new Error('misconceptions must be an array')
  if (input.length > 3) throw new Error('at most 3 misconceptions (one per wrong option)')

  const seen = new Set<string>()
  return input.map((row) => {
    const r = row as Record<string, unknown>
    const optionKey = String(r.option_key ?? '')
    const code = String(r.misconception_code ?? '').trim()
    const name = String(r.misconception_name ?? '').trim()
    const explanation = String(r.explanation ?? '').trim()
    const repairNoteId = r.repair_note_id ? String(r.repair_note_id).trim() : null

    if (!OPTION_KEYS.includes(optionKey)) throw new Error(`invalid option_key: ${optionKey}`)
    if (optionKey === correctAnswer) throw new Error('a misconception cannot target the correct answer')
    if (seen.has(optionKey)) throw new Error(`duplicate misconception for option ${optionKey}`)
    seen.add(optionKey)
    if (!code || !name || !explanation) {
      throw new Error(`misconception for option ${optionKey} needs a code, name, and explanation`)
    }
    return { option_key: optionKey, misconception_code: code, misconception_name: name, explanation, repair_note_id: repairNoteId || null }
  })
}



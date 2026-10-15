export function normalizeOptions(options: unknown): { key: string; text: string }[] {
  if (Array.isArray(options)) return options as { key: string; text: string }[]
  if (options && typeof options === 'object') {
    const obj = options as Record<string, string>
    const keys = ['a', 'b', 'c', 'd', 'e']
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

export interface TopicInput {
  topic_id: string
  role: string
}

const TOPIC_ROLES = ['diagnostic', 'practice', 'review', 'mock']

/**
 * Validate admin-submitted topic mappings. Topics must exist and belong
 * to the question's subject — cross-subject mapping is rejected, not
 * silently stored. Topic fetching is injected so this stays client-free.
 */
export async function validateTopics(
  fetchTopics: (ids: string[]) => Promise<{ id: string; subject_id: string }[]>,
  input: unknown,
  subjectId: string,
): Promise<TopicInput[]> {
  if (input === undefined || input === null) return []
  if (!Array.isArray(input)) throw new Error('topics must be an array')
  if (input.length > 8) throw new Error('at most 8 topic mappings per question')

  const seen = new Set<string>()
  const cleaned: { topic_id: string; role: string }[] = []
  for (const row of input) {
    const r = row as Record<string, unknown>
    const topicId = String(r.topic_id ?? '')
    const role = String(r.role ?? 'practice')
    if (!topicId) throw new Error('every topic mapping needs a topic_id')
    if (!TOPIC_ROLES.includes(role)) throw new Error(`invalid role: ${role}`)
    const key = `${topicId}:${role}`
    if (seen.has(key)) throw new Error('duplicate topic mapping')
    seen.add(key)
    cleaned.push({ topic_id: topicId, role })
  }
  if (cleaned.length === 0) return []

  const found = await fetchTopics([...new Set(cleaned.map((c) => c.topic_id))])
  const byId = new Map(found.map((t) => [t.id, t]))
  for (const c of cleaned) {
    const topic = byId.get(c.topic_id)
    if (!topic) throw new Error('unknown topic')
    if (topic.subject_id !== subjectId) throw new Error('topic belongs to a different subject')
  }
  return cleaned
}

const OPTION_KEYS = ['a', 'b', 'c', 'd', 'e']

/**
 * Validate admin-submitted misconception rows. A misconception names the
 * error a WRONG option reveals, so the correct option is rejected, as are
 * blanks and unknown keys. Codes must exist in the registry for the
 * question's subject — free text stopped at the registry door.
 */
export function validateMisconceptions(
  input: unknown,
  correctAnswer: string,
  registryCodes?: Set<string>,
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
    if (registryCodes && !registryCodes.has(code)) {
      throw new Error(`misconception code "${code}" is not in the registry for this subject`)
    }
    return { option_key: optionKey, misconception_code: code, misconception_name: name, explanation, repair_note_id: repairNoteId || null }
  })
}



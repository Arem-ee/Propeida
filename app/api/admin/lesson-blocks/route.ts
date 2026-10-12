import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

const BLOCK_TYPES = [
  'intro', 'text', 'image_explainer', 'audio_explainer', 'worked_example',
  'guided_question', 'independent_question', 'reflection', 'vocabulary_card',
  'passage', 'diagram', 'callout', 'recap', 'minimal_pair', 'sentence_rebuild',
]

/** Checks an evidence span points inside an existing paragraph. */
function validSpans(paragraphs: unknown, questions: unknown): string | null {
  if (!Array.isArray(paragraphs) || paragraphs.length === 0) return 'passage needs paragraphs[]'
  if (!Array.isArray(questions) || questions.length === 0) return 'passage needs questions[]'
  for (const [qi, qq] of (questions as Record<string, unknown>[]).entries()) {
    const ev = (qq as Record<string, unknown>).evidence
    if (!Array.isArray(ev) || ev.length === 0) return `question ${qi + 1} needs evidence[]`
    for (const [ei, ee] of (ev as Record<string, unknown>[]).entries()) {
      const p = ee.paragraph
      const s = ee.start
      const e = ee.end
      if (typeof p !== 'number' || p < 0 || p >= paragraphs.length) {
        return `question ${qi + 1} evidence ${ei + 1}: paragraph out of range`
      }
      const len = String(paragraphs[p]).length
      if (typeof s !== 'number' || typeof e !== 'number' || s < 0 || e > len || s >= e) {
        return `question ${qi + 1} evidence ${ei + 1}: span out of range (paragraph length ${len})`
      }
    }
    const options = (qq as Record<string, unknown>).options
    if (!Array.isArray(options) || options.length < 2) return `question ${qi + 1} needs options[]`
    const keys = new Set((options as Record<string, unknown>[]).map((o) => String(o.key)))
    if (!keys.has(String((qq as Record<string, unknown>).answer))) {
      return `question ${qi + 1}: answer must be one of the option keys`
    }
  }
  return null
}

function validContent(type: string, content: unknown): string | null {
  if (!content || typeof content !== 'object') return 'content must be an object'
  const c = content as Record<string, unknown>
  switch (type) {
    case 'text':
      if (!Array.isArray(c.paragraphs) || !Array.isArray(c.bullets)) {
        return 'text needs paragraphs[] and bullets[]'
      }
      return null
    case 'callout':
      if (typeof c.body !== 'string' || !c.body.trim()) return 'callout needs a body'
      return null
    case 'worked_example': {
      if (typeof c.problem !== 'string' || !c.problem.trim()) return 'worked_example needs a problem'
      if (!Array.isArray(c.steps) || c.steps.length === 0) return 'worked_example needs steps[]'
      for (const [i, s] of (c.steps as Record<string, unknown>[]).entries()) {
        if (typeof s.operation !== 'string' || typeof s.result !== 'string') {
          return `step ${i + 1} needs operation and result`
        }
      }
      return null
    }
    case 'guided_question':
      if (typeof c.question !== 'string' || !c.question.trim()) return 'guided_question needs a question'
      if (!Array.isArray(c.hints)) return 'guided_question needs hints[]'
      return null
    case 'vocabulary_card': {
      if (!Array.isArray(c.words) || c.words.length === 0) return 'vocabulary_card needs words[]'
      for (const [i, w] of (c.words as Record<string, unknown>[]).entries()) {
        if (typeof w.word !== 'string' || typeof w.definition !== 'string') {
          return `word ${i + 1} needs word and definition`
        }
      }
      return null
    }
    case 'passage':
      if (typeof c.title !== 'string' || !c.title.trim()) return 'passage needs a title'
      if (typeof c.purpose !== 'string' || !c.purpose.trim()) return 'passage needs a purpose'
      return validSpans(c.paragraphs, c.questions)
    case 'minimal_pair': {
      if (!Array.isArray(c.pair) || c.pair.length !== 2) return 'minimal_pair needs pair[2]'
      if (c.correctIndex !== 0 && c.correctIndex !== 1) return 'minimal_pair needs correctIndex 0|1'
      if (typeof c.rule !== 'string' || !c.rule.trim()) return 'minimal_pair needs a rule'
      if (typeof c.counterexample !== 'string' || !c.counterexample.trim()) {
        return 'minimal_pair needs a counterexample'
      }
      return null
    }
    case 'sentence_rebuild':
      if (typeof c.prompt !== 'string' || !c.prompt.trim()) return 'sentence_rebuild needs a prompt'
      if (typeof c.answer !== 'string' || !c.answer.trim()) return 'sentence_rebuild needs an answer'
      return null
    default:
      return null
  }
}

/** Create a block (position appends at the end). */
export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()
    const { lesson_id, block_type, content } = body

    if (!lesson_id || typeof lesson_id !== 'string') {
      return NextResponse.json({ error: 'lesson_id is required' }, { status: 400 })
    }
    if (!BLOCK_TYPES.includes(block_type)) {
      return NextResponse.json({ error: 'Invalid block_type' }, { status: 400 })
    }
    const problem = validContent(block_type, content)
    if (problem) return NextResponse.json({ error: problem }, { status: 400 })

    const { data: existing } = await supabase
      .from('lesson_blocks')
      .select('position')
      .eq('lesson_id', lesson_id)
      .order('position', { ascending: false })
      .limit(1)
    const position = ((existing ?? [])[0]?.position ?? -1) + 1

    const { data, error } = await supabase
      .from('lesson_blocks')
      .insert({ lesson_id, position, block_type, content })
      .select('id')
      .single()
    if (error || !data) return NextResponse.json({ error: 'Failed to create block' }, { status: 500 })
    return NextResponse.json({ success: true, id: data.id })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

/** Update a block's type/content, or reorder a lesson's blocks. */
export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const body = await request.json()

    if (Array.isArray(body.ordered_ids) && typeof body.lesson_id === 'string') {
      const ids = body.ordered_ids as string[]
      for (let i = 0; i < ids.length; i++) {
        const { error } = await supabase
          .from('lesson_blocks')
          .update({ position: i })
          .eq('id', ids[i])
          .eq('lesson_id', body.lesson_id)
        if (error) return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    const { id, block_type, content } = body
    if (!id) return NextResponse.json({ error: 'Missing block id' }, { status: 400 })
    if (!BLOCK_TYPES.includes(block_type)) {
      return NextResponse.json({ error: 'Invalid block_type' }, { status: 400 })
    }
    const problem = validContent(block_type, content)
    if (problem) return NextResponse.json({ error: problem }, { status: 400 })

    const { error } = await supabase
      .from('lesson_blocks')
      .update({ block_type, content })
      .eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to update block' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

/** Delete a block. Positions compact on next reorder. */
export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing block id' }, { status: 400 })

    const { error } = await supabase.from('lesson_blocks').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

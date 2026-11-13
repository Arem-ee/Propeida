import { createClient } from '@/lib/supabase/server'
import TeachSections from '@/components/lessons/teach-sections'
import { toLessonVisual } from '@/lib/notes/visual'
import type { NoteSection } from '@/lib/notes'

export const dynamic = 'force-dynamic'
export const metadata = {
  robots: { index: false, follow: false },
}

type LessonBlockContent = {
  heading?: unknown
  paragraphs?: unknown
  bullets?: unknown
  takeaway?: unknown
  check?: { question: unknown; options: unknown; answer: unknown; why?: unknown }
  visual?: unknown
}

type Row = { block_type: string; content: LessonBlockContent }

/** Inline-check validation, matching the server-action contract in
 *  lib/actions/lessons.ts: a malformed check is dropped, not rendered. */
function toSectionCheck(value: LessonBlockContent['check']): NoteSection['check'] {
  if (!value || typeof value !== 'object') return undefined
  const question = typeof value.question === 'string' ? value.question.trim() : ''
  const options = Array.isArray(value.options) ? value.options.map(String) : []
  const answer = typeof value.answer === 'number' ? value.answer : -1
  if (!question || options.length < 2 || answer < 0 || answer >= options.length) return undefined
  return {
    question,
    options,
    answer,
    ...(typeof value.why === 'string' && value.why.trim() ? { why: value.why.trim() } : {}),
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ subject: string; slug: string }>
}) {
  const { subject, slug } = await params
  const db = await createClient()
  const { data: subjectRow } = await db.from('subjects').select('id').eq('slug', subject).single()
  if (!subjectRow) return <main className="p-4">Subject not found: {subject}</main>
  const { data: lesson } = await db
    .from('lessons')
    .select('id, title')
    .eq('subject_id', subjectRow.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (!lesson) return <main className="p-4">Lesson not found: {slug}</main>

  const { data: blocks } = await db
    .from('lesson_blocks')
    .select('block_type, content')
    .eq('lesson_id', lesson.id)
    .order('position')

  const texts = ((blocks ?? []) as Row[]).filter((b) => b.block_type === 'text')
  const firstParagraphs = Array.isArray(texts[0]?.content.paragraphs)
    ? texts[0]!.content.paragraphs.map(String)
    : []
  const summary = firstParagraphs[0] ?? ''
  const sections: NoteSection[] = texts
    .slice(1)
    .filter((b) => !/^go deeper/i.test(String(b.content.heading ?? '')))
    .map((b) => {
      const visual = toLessonVisual(b.content.visual)
      const paragraphs = Array.isArray(b.content.paragraphs)
        ? b.content.paragraphs.map(String)
        : []
      const bullets = Array.isArray(b.content.bullets)
        ? b.content.bullets.map(String)
        : []
      const takeaway = typeof b.content.takeaway === 'string' && b.content.takeaway.trim()
        ? b.content.takeaway.trim()
        : undefined
      const check = toSectionCheck(b.content.check)
      return {
        heading: String(b.content.heading ?? ''),
        paragraphs,
        bullets,
        ...(takeaway ? { takeaway } : {}),
        ...(check ? { check } : {}),
        ...(visual ? { visual } : {}),
      }
    })

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="font-display text-xl font-medium text-black">{lesson.title}</h1>
      <TeachSections summary={summary} sections={sections} />
    </main>
  )
}

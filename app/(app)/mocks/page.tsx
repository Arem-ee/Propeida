import { createClient } from '@/lib/supabase/server'
import MockLauncher from '@/components/mocks/mock-launcher'
import { getMockDefaults, type MockDefaults } from '@/lib/practice'

export const metadata = { title: 'Mocks' }

export interface MockableExam {
  id: string
  name: string
  slug: string
  questionCount: number
  timeLimitSeconds: number
}

export default async function MocksPage() {
  const supabase = await createClient()

  const [examsRes, subjectsRes, examSubjectsRes, questionRows] = await Promise.all([
    supabase.from('exams').select('id, name, slug').order('name'),
    supabase.from('subjects').select('id, name, slug').order('name'),
    supabase.from('exam_subjects').select('exam_id, subject_id'),
    supabase.from('questions').select('exam_id').limit(20000),
  ])

  const withContent = new Set((questionRows.data ?? []).map((q) => q.exam_id))

  const exams: MockableExam[] = []
  for (const exam of examsRes.data ?? []) {
    if (!withContent.has(exam.id)) continue
    let defaults: MockDefaults | null = null
    try {
      defaults = await getMockDefaults(exam.slug)
    } catch {
      defaults = null
    }
    if (!defaults?.question_count || !defaults?.time_limit_seconds) continue
    exams.push({
      id: exam.id,
      name: exam.name,
      slug: exam.slug,
      questionCount: defaults.question_count,
      timeLimitSeconds: defaults.time_limit_seconds,
    })
  }

  const examSubjectMap: Record<string, string[]> = {}
  for (const es of examSubjectsRes.data ?? []) {
    if (!examSubjectMap[es.exam_id]) examSubjectMap[es.exam_id] = []
    examSubjectMap[es.exam_id]!.push(es.subject_id)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-7">
        <h1 className="font-display text-[32px] font-semibold leading-tight text-black sm:text-4xl">
          Mocks
        </h1>
        <p className="mt-1.5 text-[15px] font-semibold text-ink-soft">
          The real hall, rehearsed. Timed, no pauses, answers autosave.
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 p-8 text-center">
          <h2 className="font-display text-2xl font-medium text-black">No mocks ready yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-ink-soft">
            Timed mocks open as soon as a full exam bank is checked. Lessons and practice are ready now.
          </p>
        </div>
      ) : (
        <MockLauncher
          exams={exams}
          allSubjects={subjectsRes.data ?? []}
          examSubjectMap={examSubjectMap}
        />
      )}
    </div>
  )
}

import { SUBJECTS, type SubjectSlug } from '@/lib/notes'
import NotesExplorer from '@/components/notes/notes-explorer'

export const dynamic = 'force-dynamic'

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>
}) {
  const params = await searchParams
  const requested = params.subject as SubjectSlug | undefined
  const subject = SUBJECTS.some((s) => s.slug === requested) ? (requested as SubjectSlug) : 'english'

  return <NotesExplorer initialSubject={subject} />
}
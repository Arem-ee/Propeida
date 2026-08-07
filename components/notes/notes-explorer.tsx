'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Clock,
  ArrowRight,
  BookOpenCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react'
import {
  SUBJECTS,
  getNotesBySubject,
  getNotesForInstitution,
  searchNotes,
  getReadingMinutes,
  getSubjectLabel,
  getNoteUrl,
  type SubjectSlug,
  type InstitutionId,
} from '@/lib/notes'
import InstitutionSelector from '@/components/notes/institution-selector'

export default function NotesExplorer({ initialSubject }: { initialSubject: SubjectSlug }) {
  const router = useRouter()
  const [subject, setSubject] = useState<SubjectSlug>(initialSubject)
  const [institution, setInstitution] = useState<InstitutionId>('unilorin')
  const [query, setQuery] = useState('')

  const institutionNotes = getNotesForInstitution(institution)
  const subjectNotes = getNotesBySubject(subject).filter((note) => institutionNotes.includes(note))
  const filtered = query.trim() ? searchNotes(query).filter((note) => institutionNotes.includes(note)) : subjectNotes

  const selectSubject = (next: SubjectSlug) => {
    setSubject(next)
    setQuery('')
    router.replace(`/dashboard/notes` + (next !== 'english' ? `?subject=${next}` : ''), {
      scroll: false,
    })
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
          <BookOpenCheck className="h-4 w-4" />
          Revision Notes
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Quick revision before you practice</h1>
        <p className="mt-1 text-sm text-gray-500 max-w-xl">
          Short, exam-focused summaries. Read a note in a few minutes, then test yourself on the topic.
          <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
            <RotateCcw className="h-3 w-3" />
            Read → Practice → Review → Read again
          </span>
        </p>
      </div>

      <InstitutionSelector selected={institution} onSelect={setInstitution} />

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics (e.g. surds, concord, probability)"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-blue-600 focus:outline-none min-h-[44px]"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {SUBJECTS.map((s) => {
          const active = s.slug === subject
          return (
            <button
              key={s.slug}
              onClick={() => selectSubject(s.slug)}
              className={`rounded-xl px-4 py-2 text-sm font-bold min-h-[44px] transition-colors cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s.label}
              <span className={`ml-1.5 text-xs font-semibold ${active ? 'text-blue-100' : 'text-gray-400'}`}>
                {getNotesBySubject(s.slug).length}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">No notes match “{query}”.</p>
          <p className="mt-1 text-xs text-gray-400">Try a different keyword or switch subject.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <Link
              key={note.id}
              href={getNoteUrl(note)}
              className="group flex flex-col rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                  {getSubjectLabel(note.subject)}
                </span>
                <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                  <Clock className="h-3 w-3" />
                  {getReadingMinutes(note)} min
                </span>
              </div>
              <h3 className="font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors">
                {note.topic}
              </h3>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed line-clamp-3">{note.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 pt-3 border-t border-gray-50 text-xs font-bold text-blue-600">
                Read note
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
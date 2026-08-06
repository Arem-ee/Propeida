import { englishNotes } from '@/lib/notes/content/english'
import { mathematicsNotes } from '@/lib/notes/content/mathematics'
import { currentAffairsNotes } from '@/lib/notes/content/current-affairs'

export type SubjectSlug = 'english' | 'mathematics' | 'current-affairs'

export interface NoteSection {
  heading: string
  bullets: string[]
}

export interface RevisionNote {
  id: string
  subject: SubjectSlug
  topic: string
  summary: string
  sections: NoteSection[]
  examTip: string
  practiceTopic: string
}

export const SUBJECTS: { slug: SubjectSlug; label: string; description: string }[] = [
  { slug: 'english', label: 'English', description: 'Grammar, comprehension and vocabulary essentials.' },
  { slug: 'mathematics', label: 'Mathematics', description: 'Core topics for objective-style questions.' },
  { slug: 'current-affairs', label: 'Current Affairs', description: 'Government, institutions and recent developments.' },
]

export const ALL_NOTES: RevisionNote[] = [...englishNotes, ...mathematicsNotes, ...currentAffairsNotes]

export function getAllNotes(): RevisionNote[] {
  return ALL_NOTES
}

export function getNotesBySubject(subject: SubjectSlug): RevisionNote[] {
  return ALL_NOTES.filter((note) => note.subject === subject)
}

export function getNoteById(id: string): RevisionNote | null {
  return ALL_NOTES.find((note) => note.id === id) ?? null
}

export function searchNotes(query: string): RevisionNote[] {
  const q = query.trim().toLowerCase()
  if (!q) return ALL_NOTES
  return ALL_NOTES.filter(
    (note) =>
      note.topic.toLowerCase().includes(q) ||
      note.summary.toLowerCase().includes(q) ||
      note.sections.some(
        (section) =>
          section.heading.toLowerCase().includes(q) ||
          section.bullets.some((bullet) => bullet.toLowerCase().includes(q)),
      ),
  )
}

export function getWordCount(note: RevisionNote): number {
  return note.sections.reduce(
    (total, section) =>
      total +
      section.heading.split(/\s+/).filter(Boolean).length +
      section.bullets.reduce(
        (sum, bullet) => sum + bullet.split(/\s+/).filter(Boolean).length,
        0,
      ),
    0,
  )
}

export function getReadingMinutes(note: RevisionNote): number {
  return Math.max(2, Math.round(getWordCount(note) / 180))
}

export function getPracticeUrl(note: RevisionNote): string {
  const subject = encodeURIComponent(note.subject)
  const topic = encodeURIComponent(note.practiceTopic)
  return `/practice?hub=universities&subject=${subject}&topic=${topic}`
}

export function getSubjectLabel(slug: SubjectSlug): string {
  return SUBJECTS.find((s) => s.slug === slug)?.label ?? slug
}
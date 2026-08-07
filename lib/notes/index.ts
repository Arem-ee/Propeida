import { englishNotes } from '@/lib/notes/content/english'
import { mathematicsNotes } from '@/lib/notes/content/mathematics'
import { currentAffairsNotes } from '@/lib/notes/content/current-affairs'

export type SubjectSlug = 'english' | 'mathematics' | 'current-affairs'

export type InstitutionId = 'unilorin'

export interface Institution {
  id: InstitutionId
  label: string
  available: boolean
}

export const INSTITUTIONS: Institution[] = [
  { id: 'unilorin', label: 'University of Ilorin (UNILORIN)', available: true },
]

export function isValidInstitution(id: string): id is InstitutionId {
  return INSTITUTIONS.some((institution) => institution.id === id && institution.available)
}

export interface NoteSection {
  heading: string
  paragraphs?: string[]
  bullets: string[]
}

export interface RevisionNote {
  id: string
  subject: SubjectSlug
  topic: string
  slug: string
  summary: string
  sections: NoteSection[]
  examTip: string
  practiceTopic: string
  institution?: InstitutionId
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

export function getNotesForInstitution(institution: InstitutionId): RevisionNote[] {
  return ALL_NOTES.filter((note) => (note.institution ?? 'unilorin') === institution)
}

export function getNoteById(id: string): RevisionNote | null {
  return ALL_NOTES.find((note) => note.id === id) ?? null
}

export function isValidSubject(slug: string): slug is SubjectSlug {
  return SUBJECTS.some((subject) => subject.slug === slug)
}

export function getNoteByPath(subject: string, topicSlug: string): RevisionNote | null {
  if (!isValidSubject(subject)) return null
  return ALL_NOTES.find((note) => note.subject === subject && note.slug === topicSlug) ?? null
}

export function getNoteUrl(note: RevisionNote): string {
  return `/dashboard/notes/${note.subject}/${note.slug}`
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
          (section.paragraphs ?? []).some((paragraph) => paragraph.toLowerCase().includes(q)) ||
          section.bullets.some((bullet) => bullet.toLowerCase().includes(q)),
      ),
  )
}

export function getWordCount(note: RevisionNote): number {
  return note.sections.reduce(
    (total, section) =>
      total +
      section.heading.split(/\s+/).filter(Boolean).length +
      (section.paragraphs ?? []).reduce(
        (sum, paragraph) => sum + paragraph.split(/\s+/).filter(Boolean).length,
        0,
      ) +
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
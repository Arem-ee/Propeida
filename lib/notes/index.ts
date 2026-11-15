import { englishNotes } from '@/lib/notes/content/english'
import { mathematicsNotes } from '@/lib/notes/content/mathematics'
import { currentAffairsNotes } from '@/lib/notes/content/current-affairs'

export type SubjectSlug =
  | 'english'
  | 'mathematics'
  | 'current-affairs'
  | 'accounting'
  | 'agricultural-science'
  | 'arabic'
  | 'art'
  | 'biology'
  | 'chemistry'
  | 'christian-religious-studies'
  | 'commerce'
  | 'computer-studies'
  | 'economics'
  | 'french'
  | 'general-paper'
  | 'geography'
  | 'government'
  | 'hausa'
  | 'history'
  | 'home-economics'
  | 'igbo'
  | 'islamic-studies'
  | 'literature'
  | 'logical-reasoning'
  | 'music'
  | 'physical-and-health-education'
  | 'physics'
  | 'quantitative-reasoning'
  | 'verbal-reasoning'
  | 'yoruba'

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

export interface SectionCheck {
  question: string
  options: string[]
  /** Index of the correct option. */
  answer: number
  /** One-line reason, shown after answering. */
  why?: string
}

export interface FlowStep {
  label: string
  /** Optional second line; keep it short, it wraps first on a phone. */
  detail?: string
}

export interface ChartSeries {
  /** [[x, y], ...] points in data units; the renderer scales them into viewBox units. */
  points: [number, number][]
  /** Short legend label, e.g. "Exothermic". */
  label?: string
}

/**
 * A relationship that prose handles badly. Two primitives only: a chain
 * (`flow`) and a two-way contrast (`compare`). Every label is real text, so
 * the figures scale, translate and read aloud without a raster.
 */
export type LessonVisual =
  | {
      kind: 'flow'
      /** States the relationship, not the shape: "Each link adds a service." */
      caption: string
      steps: FlowStep[]
    }
  | {
      kind: 'compare'
      caption: string
      /** The two alternatives being contrasted, in reading order. */
      columns: [string, string]
      rows: { feature: string; left: string; right: string }[]
    }
  | {
      kind: 'chart'
      /** States the relationship the curve makes legible, in one line. */
      caption: string
      /** Axis labels; keep them under five words each. */
      xLabel: string
      yLabel: string
      /** Up to three series, in reading order. */
      series: ChartSeries[]
    }
  | {
      kind: 'image'
      /** Path under /public, never an external URL. */
      src: string
      /** What a screen reader hears instead of the picture. */
      alt: string
      /** One line under the picture; say what to look at, not what it is. */
      caption: string
      /** How the picture is shaped so it scales without a layout jump. */
      aspect: 'wide' | 'portrait'
    }

export interface NoteSection {
  heading: string
  paragraphs?: string[]
  bullets: string[]
  /** One-sentence claim the section exists to teach; becomes a recap bullet. */
  takeaway?: string
  /** Optional ten-second retrieval check, answered inline. */
  check?: SectionCheck
  /** Optional figure, at most one per section, placed after the prose. */
  visual?: LessonVisual
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
  { slug: 'biology', label: 'Biology', description: 'From cells to ecosystems, by specimen and system.' },
  { slug: 'chemistry', label: 'Chemistry', description: 'Molecules, reactions, rates and measurements.' },
  { slug: 'commerce', label: 'Commerce', description: 'Business, trade and administration.' },
  { slug: 'economics', label: 'Economics', description: 'Markets, business and public policy in Nigeria.' },
  { slug: 'government', label: 'Government', description: 'Politics and institutions in Nigeria and beyond.' },
  { slug: 'physics', label: 'Physics', description: 'Mechanics, waves, electricity and modern physics.' },
  { slug: 'accounting', label: 'Accounting', description: 'Bookkeeping, analysis and financial reporting.' },
  { slug: 'agricultural-science', label: 'Agricultural Science', description: 'Farming systems, soils and food production.' },
  { slug: 'arabic', label: 'Arabic', description: 'The Arabic language in grammar, composition and comprehension.' },
  { slug: 'art', label: 'Art', description: 'Drawing, design and visual arts practice.' },
  { slug: 'christian-religious-studies', label: 'Christian Religious Studies', description: 'Christianity, scripture and values in society.' },
  { slug: 'computer-studies', label: 'Computer Studies', description: 'Computers, systems and basic programming.' },
  { slug: 'french', label: 'French', description: 'French grammar, vocabulary and comprehension.' },
  { slug: 'general-paper', label: 'General Paper', description: 'Broad-based general knowledge and common sense.' },
  { slug: 'geography', label: 'Geography', description: 'Earth systems, maps and environments.' },
  { slug: 'hausa', label: 'Hausa', description: 'Hausa language, literature and culture.' },
  { slug: 'history', label: 'History', description: 'Events, people and forces that shaped nations.' },
  { slug: 'home-economics', label: 'Home Economics', description: 'Homes, families, nutrition and household management.' },
  { slug: 'igbo', label: 'Igbo', description: 'Igbo language, literature and culture.' },
  { slug: 'islamic-studies', label: 'Islamic Studies', description: 'The Quran, Hadith and Islamic practice.' },
  { slug: 'literature', label: 'Literature', description: 'Literature in English across African and world writing.' },
  { slug: 'logical-reasoning', label: 'Logical Reasoning', description: 'Arguments, statements and structured thought.' },
  { slug: 'music', label: 'Music', description: 'Music theory, performance and listening.' },
  { slug: 'physical-and-health-education', label: 'Physical and Health Education', description: 'Health, fitness and physical education.' },
  { slug: 'quantitative-reasoning', label: 'Quantitative Reasoning', description: 'Number sense and quantitative problem solving.' },
  { slug: 'verbal-reasoning', label: 'Verbal Reasoning', description: 'Language accuracy and verbal intelligence.' },
  { slug: 'yoruba', label: 'Yoruba', description: 'Yoruba language, literature and culture.' },
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
  return `/learn/${note.subject}/${note.slug}`
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
  return `/practice?hub=post-utme&subject=${subject}&topic=${topic}`
}

export function getSubjectLabel(slug: SubjectSlug): string {
  return SUBJECTS.find((s) => s.slug === slug)?.label ?? slug
}
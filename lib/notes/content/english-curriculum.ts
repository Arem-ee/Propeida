/**
 * The JAMB UTME Use of English curriculum.
 *
 * One file, one source of truth: the topic tree, the lessons that will
 * eventually teach each topic, and the order they are taught in. Phases 2
 * to 4 fill in the lesson bodies; Phase 1 creates the rows and the map.
 *
 * Structure taken from the official JAMB syllabus
 * (content-folder/jamb-syllabus/english.md), which sets three sections:
 *
 *   SECTION A: Comprehension and Summary  25 of the 60 questions
 *   SECTION B: Lexis and Structure         25 of the 60 questions
 *   SECTION C: Oral Forms                  10 of the 60 questions
 *
 * Each topic carries the syllabus line it comes from, so the content team
 * can trace any lesson back to the official document.
 */

export interface CurriculumTopic {
  /** Stable slug; also the lesson slug when the lesson is new. */
  slug: string
  /** Section key from the syllabus. */
  section: 'A' | 'B' | 'C'
  /** Section title from the syllabus. */
  sectionTitle: string
  /** Position within the whole subject, 1-based. */
  order: number
  /** Topic name shown to learners. */
  name: string
  /** The syllabus sub-item this topic comes from. */
  syllabusItem: string
  /** The objective line(s) from the syllabus this topic answers. */
  syllabusObjective: string
  /** Short description used on the curriculum map. */
  description: string
  /**
   * The published lesson that teaches this topic, if one already exists.
   * Null means the lesson is authored in a later phase.
   */
  existingLesson?: string
  /** Estimated minutes for the lesson. */
  estimatedMinutes: number
  /**
   * Topics that must be understood first. Used to route a learner who
   * keeps getting the same thing wrong to the root cause rather than
   * retrying the same question.
   */
  prerequisites?: string[]
}

export const CURRICULUM: CurriculumTopic[] = [
  // ── SECTION A: Comprehension and Summary ────────────────────────────────
  {
    slug: 'comprehension-question-skills',
    section: 'A',
    sectionTitle: 'Comprehension and Summary',
    order: 1,
    name: 'Answering Comprehension Questions',
    syllabusItem: 'A(ii)(a)-(e)',
    syllabusObjective:
      'identify main points/topic sentences in passages; determine implied meanings; identify the grammatical functions of words, phrases, clauses and figurative/idiomatic expressions; deduce or infer the writers’ intentions including mood, attitude to the subject matter and opinion',
    description:
      'How to read a passage for answers: find the topic sentence, tap the evidence, then choose. Covers inference, mood, attitude, figures of speech and idiom in context.',
    existingLesson: 'comprehension-tips',
    estimatedMinutes: 18,
  },
  {
    slug: 'passage-description',
    section: 'A',
    sectionTitle: 'Comprehension and Summary',
    order: 2,
    name: 'Description Passages',
    syllabusItem: 'A(a)',
    syllabusObjective: 'identify main points/topic sentences in passages',
    description:
      'Description gives a detailed picture of a person, place or thing. Recognising it tells you where to look for the topic sentence and the details.',
    estimatedMinutes: 14,
    prerequisites: ['comprehension-question-skills'],
  },
  {
    slug: 'passage-narration',
    section: 'A',
    sectionTitle: 'Comprehension and Summary',
    order: 3,
    name: 'Narration Passages',
    syllabusItem: 'A(b)',
    syllabusObjective: 'identify main points/topic sentences in passages',
    description:
      'Narration tells a sequence of events. Plot, turning point and the narrator’s attitude carry most of the answers.',
    estimatedMinutes: 14,
    prerequisites: ['comprehension-question-skills'],
  },
  {
    slug: 'passage-exposition',
    section: 'A',
    sectionTitle: 'Comprehension and Summary',
    order: 4,
    name: 'Exposition Passages',
    syllabusItem: 'A(c)',
    syllabusObjective:
      'identify the grammatical functions of words, phrases, clauses and figurative/idiomatic expressions',
    description:
      'Exposition explains a process, a cause or a comparison. Signposting words carry the logic, and the answers hide inside them.',
    estimatedMinutes: 16,
    prerequisites: ['comprehension-question-skills'],
  },
  {
    slug: 'passage-argumentation',
    section: 'A',
    sectionTitle: 'Comprehension and Summary',
    order: 5,
    name: 'Argumentation and Persuasion',
    syllabusItem: 'A(d)',
    syllabusObjective:
      'deduce or infer the writers’ intentions including mood, attitude to the subject matter and opinion',
    description:
      'Argumentation defends a position. Learn to spot the claim, the concession and the rhetorical question, and to read the writer’s opinion rather than your own.',
    estimatedMinutes: 16,
    prerequisites: ['comprehension-question-skills'],
  },
  {
    slug: 'summary-writing',
    section: 'A',
    sectionTitle: 'Comprehension and Summary',
    order: 6,
    name: 'Summary Writing',
    syllabusItem: 'A(ii)(e)',
    syllabusObjective: 'synthesis of ideas from the passages',
    description:
      'One passage, five questions, one summary. How to compress without losing the point, and how JAMB marks a summary.',
    estimatedMinutes: 15,
    prerequisites: ['comprehension-question-skills'],
  },
  {
    slug: 'cloze-test-technique',
    section: 'A',
    sectionTitle: 'Comprehension and Summary',
    order: 7,
    name: 'The Cloze Test',
    syllabusItem: 'A(i), A(ii)(b)',
    syllabusObjective:
      'identify the grammatical functions of words, phrases, clauses and figurative/idiomatic expressions',
    description:
      'Ten questions from one gapped passage. The gaps are grammar questions wearing a passage costume — learn to read the gap, not the story.',
    estimatedMinutes: 15,
    prerequisites: ['comprehension-question-skills', 'word-classes-and-functions'],
  },

  // ── SECTION B: Lexis and Structure ─────────────────────────────────────
  {
    slug: 'synonyms',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 8,
    name: 'Synonyms',
    syllabusItem: 'B(a)',
    syllabusObjective: 'determine similar and opposite meanings of words',
    description:
      'Words with the same or nearly the same meaning. Also covers the trap: near-synonyms are not interchangeable in every context.',
    estimatedMinutes: 12,
  },
  {
    slug: 'antonyms',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 9,
    name: 'Antonyms',
    syllabusItem: 'B(b)',
    syllabusObjective: 'determine similar and opposite meanings of words',
    description:
      'Opposites — and the harder grade question: which word is the opposite in this context, not in general.',
    estimatedMinutes: 12,
  },
  {
    slug: 'clause-and-sentence-patterns',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 10,
    name: 'Clause and Sentence Patterns',
    syllabusItem: 'B(c)',
    syllabusObjective: 'identify various grammatical patterns in use',
    description:
      'Simple, compound and complex sentences; clauses and their functions; subject-verb agreement and inversion. The patterns JAMB tests by asking you to rebuild a broken sentence.',
    existingLesson: 'common-grammar-errors',
    estimatedMinutes: 18,
    prerequisites: ['number-agreement-and-concord'],
  },
  {
    slug: 'word-classes-and-functions',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 11,
    name: 'Word Classes and Their Functions',
    syllabusItem: 'B(d)',
    syllabusObjective:
      'identify the grammatical functions of words, phrases, clauses and figurative/idiomatic expressions',
    description:
      'Nouns, verbs, adjectives, adverbs and the rest — what each does in a sentence, and how function beats form when they disagree.',
    existingLesson: 'parts-of-speech',
    estimatedMinutes: 16,
  },
  {
    slug: 'mood-tense-and-aspect',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 12,
    name: 'Mood, Tense and Aspect',
    syllabusItem: 'B(e)',
    syllabusObjective: 'identify various grammatical patterns in use',
    description:
      'Four tenses but three times: past, present, future — and the aspect that says whether the action is finished or ongoing.',
    estimatedMinutes: 16,
    prerequisites: ['word-classes-and-functions'],
  },
  {
    slug: 'number-agreement-and-concord',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 13,
    name: 'Number, Agreement and Concord',
    syllabusItem: 'B(e)',
    syllabusObjective: 'identify various grammatical patterns in use',
    description:
      'Making the verb agree with the right noun, including the phrases and prepositions that come between them.',
    existingLesson: 'concord-rules',
    estimatedMinutes: 14,
    prerequisites: ['word-classes-and-functions'],
  },
  {
    slug: 'degrees-of-comparison',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 14,
    name: 'Degrees of Comparison',
    syllabusItem: 'B(e)',
    syllabusObjective: 'identify various grammatical patterns in use',
    description:
      'Positive, comparative and superlative — including the irregular forms and the one-word rule that catches most candidates.',
    estimatedMinutes: 12,
    prerequisites: ['word-classes-and-functions'],
  },
  {
    slug: 'question-tags',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 15,
    name: 'Question Tags',
    syllabusItem: 'B(e)',
    syllabusObjective: 'identify various grammatical patterns in use',
    description:
      'The tag that closes a statement. Same tense, opposite polarity, and the fixed expressions that never change.',
    estimatedMinutes: 10,
    prerequisites: ['mood-tense-and-aspect'],
  },
  {
    slug: 'mechanics-spelling-and-punctuation',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 16,
    name: 'Mechanics: Spelling and Punctuation',
    syllabusItem: 'B(f)',
    syllabusObjective: 'differentiate between correct and incorrect spellings',
    description:
      'Correct spelling and the punctuation marks JAMB tests — the apostrophe, the comma, the full stop, the colon.',
    estimatedMinutes: 14,
  },
  {
    slug: 'ordinary-figurative-idiomatic-usage',
    section: 'B',
    sectionTitle: 'Lexis and Structure',
    order: 17,
    name: 'Ordinary, Figurative and Idiomatic Usage',
    syllabusItem: 'B(g)',
    syllabusObjective:
      'identify words and expressions in their ordinary, figurative and idiomatic contexts',
    description:
      'The same word can be literal or figurative. Idioms tested are formal ones in Standard British English.',
    existingLesson: 'vocabulary-and-idioms',
    estimatedMinutes: 16,
  },

  // ── SECTION C: Oral Forms ───────────────────────────────────────────────
  {
    slug: 'vowels-monothongs-diphthongs-triphthongs',
    section: 'C',
    sectionTitle: 'Oral Forms',
    order: 18,
    name: 'Vowels: Monothongs, Diphthongs and Triphthongs',
    syllabusItem: 'C(a)',
    syllabusObjective: 'make distinctions among vowel types',
    description:
      'One glide or two or three in a single vowel sound, and what changes when you add a suffix.',
    estimatedMinutes: 12,
  },
  {
    slug: 'consonants-and-clusters',
    section: 'C',
    sectionTitle: 'Oral Forms',
    order: 19,
    name: 'Consonants and Consonant Clusters',
    syllabusItem: 'C(b)',
    syllabusObjective: 'differentiate among consonant types',
    description:
      'Place and manner of articulation, and the clusters that English stacks together without a vowel between them.',
    estimatedMinutes: 12,
  },
  {
    slug: 'rhymes-and-homophones',
    section: 'C',
    sectionTitle: 'Oral Forms',
    order: 20,
    name: 'Rhymes and Homophones',
    syllabusItem: 'C(c)',
    syllabusObjective:
      'identify correct pronunciation of individual words and articulation of connected speech',
    description:
      'Words that sound alike but are written differently, and words that rhyme but are not homophones.',
    estimatedMinutes: 10,
    prerequisites: ['vowels-monothongs-diphthongs-triphthongs', 'consonants-and-clusters'],
  },
  {
    slug: 'word-stress',
    section: 'C',
    sectionTitle: 'Oral Forms',
    order: 21,
    name: 'Word Stress',
    syllabusItem: 'C(d)',
    syllabusObjective:
      'identify correct pronunciation of individual words and articulation of connected speech',
    description:
      'Which syllable carries the stress in a one-syllable or many-syllable word, and how suffixes move it.',
    estimatedMinutes: 12,
    prerequisites: ['vowels-monothongs-diphthongs-triphthongs', 'consonants-and-clusters'],
  },
  {
    slug: 'emphatic-stress',
    section: 'C',
    sectionTitle: 'Oral Forms',
    order: 22,
    name: 'Emphatic Stress in Connected Speech',
    syllabusItem: 'C(e)',
    syllabusObjective:
      'identify correct pronunciation of individual words and articulation of connected speech',
    description:
      'Emphasis places stress on a word in an utterance for the purpose of emphasis. Learn to hear where the stress lands and what it signals.',
    estimatedMinutes: 12,
    prerequisites: ['word-stress'],
  },
]

export const SECTION_TITLES: Record<string, string> = {
  A: 'Comprehension and Summary',
  B: 'Lexis and Structure',
  C: 'Oral Forms',
}

/** The exam structure JAMB publishes for Use of English: 60 questions. */
export const EXAM_STRUCTURE = {
  total: 60,
  sections: [
    { key: 'A', title: 'Comprehension and Summary', questions: 25, breakdown: [
      { label: 'Comprehension passage', questions: 5 },
      { label: 'Summary passage', questions: 5 },
      { label: 'Cloze passage', questions: 10 },
      { label: 'Reading text', questions: 5 },
    ] },
    { key: 'B', title: 'Lexis and Structure', questions: 25, breakdown: [
      { label: 'Sentence interpretation', questions: 5 },
      { label: 'Antonyms', questions: 5 },
      { label: 'Synonyms', questions: 5 },
      { label: 'Basic grammar', questions: 10 },
    ] },
    { key: 'C', title: 'Oral Forms', questions: 10, breakdown: [
      { label: 'Vowels', questions: 2 },
      { label: 'Consonants', questions: 2 },
      { label: 'Rhymes', questions: 2 },
      { label: 'Word stress', questions: 2 },
      { label: 'Emphatic stress', questions: 2 },
    ] },
  ],
}

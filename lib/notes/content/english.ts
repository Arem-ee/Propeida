import type { RevisionNote } from '@/lib/notes'

export const englishNotes: RevisionNote[] = [
  {
    id: 'english-parts-of-speech',
    subject: 'english',
    topic: 'Parts of Speech',
    summary:
      'The eight word classes every English question depends on — and how to spot them in a sentence.',
    practiceTopic: 'parts-of-speech',
    sections: [
      {
        heading: 'The eight parts of speech',
        bullets: [
          'A noun names something: a person (student), a place (library), a thing (calculator), or an idea (freedom). Common nouns are general; proper nouns are specific and capitalised (University of Ilorin).',
          'A pronoun stands in for a noun: I, you, he, she, it, we, they, who, which. It must agree with the noun it replaces.',
          'A verb expresses action or a state of being: run, think, is, was, have. Every sentence needs at least one.',
          'An adjective modifies a noun: a brilliant answer, a quick revision.',
          'An adverb modifies a verb, adjective, or another adverb: ran quickly, quite good, very quickly.',
          'A preposition shows position or relationship: in, on, at, under, between, after.',
          'A conjunction joins words or clauses: and, but, or, because, although.',
          'An interjection is a short exclamation: Wow! Oh! Ouch!',
        ],
      },
      {
        heading: 'Words that change class',
        bullets: [
          'Many words belong to more than one class depending on how they are used.',
          '"Fast" can be an adjective (a fast car) or an adverb (drives fast).',
          '"Run" is a verb (I run daily) and a noun (a quick run).',
          'Decide the class by position and function in the sentence, not by memory.',
          '"The" before a noun is an article; before an adjective it can turn the adjective into a noun — "the rich" means rich people.',
        ],
      },
      {
        heading: 'Exam traps',
        bullets: [
          'Do not call "the" an adjective; examiners classify it as an article (or determiner).',
          'Possessive adjectives (my, your, our) must be followed by a noun: "my book", never "I book".',
          'A full sentence needs a finite verb — one marked for tense — not just a participle.',
          'Adverbs of frequency (always, often, rarely) go before the main verb but after "am/is/are": He is always late.',
        ],
      },
    ],
    examTip:
      'When asked to identify a part of speech, ask one question about the word: does it name (noun), replace a name (pronoun), show action (verb), or modify (adjective/adverb)? That is usually enough.',
  },
  {
    id: 'english-concord-rules',
    subject: 'english',
    topic: 'Concord Rules',
    summary: 'The rules of agreement between subject and verb — a heavily tested area of Nigerian English exams.',
    practiceTopic: 'concord-rules',
    sections: [
      {
        heading: 'Core subject–verb agreement',
        bullets: [
          'A singular subject takes a singular verb: The student studies. (add –s to the verb in the present tense)',
          'A plural subject takes a plural verb: The students study.',
          'Words between the subject and verb do not decide the verb: The box of matches is on the shelf. ("box" governs the verb, not "matches")',
        ],
      },
      {
        heading: 'Subjects that fool candidates',
        bullets: [
          'Each, every, everyone, everybody, anybody, nobody, nothing take a singular verb: Everybody is here.',
          'Neither and either are singular: Neither of the answers is correct.',
          'With "either … or" and "neither … nor", the verb agrees with the nearer subject: Neither the teacher nor the students were present.',
          'Both (of them) takes a plural verb: Both of the students were present.',
          'Collective nouns (committee, team, family) are usually treated as singular: The committee has given its report.',
          '"The number of" takes a singular verb; "a number of" takes a plural: The number of students has risen. A number of students are absent.',
        ],
      },
      {
        heading: 'Quantities, time and distance',
        bullets: [
          'Amounts, distances and periods of time are singular: Ten years is a long time.',
          'With fractions and percentages, the verb matches the noun after "of": Half of the cake has gone; half of the students have gone.',
          '"News" looks plural but takes a singular verb: The news is good.',
          '"The police" takes a plural verb: The police are investigating.',
          '"There is/are" decides by the subject that follows: There are many questions left.',
        ],
      },
    ],
    examTip:
      'To settle a concord question, cross out every clause between the head noun and the verb. Then match the verb to the remaining head word.',
  },
  {
    id: 'english-common-grammar-errors',
    subject: 'english',
    topic: 'Common Grammar Errors',
    summary: 'Tense, pronoun, and other mistakes that recur in "choose the correct sentence" questions.',
    practiceTopic: 'common-grammar-errors',
    sections: [
      {
        heading: 'Tense errors',
        bullets: [
          'Use the simple past for a completed action with a specific past time: I went to school yesterday (not "I have gone to school yesterday").',
          'Use the present perfect for a past action with present relevance and no definite time: I have finished my revision.',
          'Use the past perfect ("had finished") for the earlier of two past actions: By the time I arrived, the lesson had started.',
          'Time markers decide the tense: "two years ago" goes with simple past; "since" goes with a perfect tense.',
          'In reported speech, shift the tense back: He said he was tired (not "he is tired").',
        ],
      },
      {
        heading: 'Pronoun errors',
        bullets: [
          'After a preposition, use the object form: between you and me (not "you and I").',
          'Subject and object clauses: She is taller than I (than I am). Between wrong reflexive — "enjoy yourself" but "he hurt himself", never "he hurt hisself".',
          'Use reflexive pronouns only when subject and object are the same person: She dressed herself.',
          'Make each pronoun agree with its antecedent: Everyone should bring his or her books (formal) — avoid mixing singular and plural.',
        ],
      },
      {
        heading: 'Errors examiners repeat',
        bullets: [
          'Double negatives: "I did not see nothing" → "I did not see anything".',
          'Redundancy: "return back", "repeat again", "advance forward" — one word carries the idea.',
          'Prepositions: "enjoy swimming" (not "enjoy to swim"); "different from"; "prefer … to …"; "insist on"; "arrive at/in".',
          'Quantifiers: "much" for uncountable (much water), "many" for plural countable (many books); "fewer" for countable, "less" for uncountable.',
          'Confusables: its/it’s, whose/who’s, there/their/they’re, affect/effect, borrow/lend, advice/advise.',
          'Dangling modifier: "Walking to school, the bell rang" — the person walked, not the bell. Attach the modifier to the right subject.',
        ],
      },
    ],
    examTip:
      'Read each option word-for-word. Most "best sentence" questions test one rule, so a single wrong word (have/went, their/its, me/I) tells you the answer.',
  },
  {
    id: 'english-comprehension-tips',
    subject: 'english',
    topic: 'Comprehension Tips',
    summary: 'A read-and-answer playbook: predict, underline, decide and eliminate to protect marks.',
    practiceTopic: 'comprehension-tips',
    sections: [
      {
        heading: 'Before you read',
        bullets: [
          'Read the questions first, in one sweep — they tell you what to look for.',
          'Notice the question verbs: what (fact), why (reason), whom (person), how (manner).',
          'Never guess an answer without checking the passage; every answer must be supported by the text.',
        ],
      },
      {
        heading: 'While you read',
        bullets: [
          'Note the topic sentence of each paragraph — usually the first sentence.',
          'Circle proper nouns, dates and figures; questions love to reuse them.',
          'Slow down at signal words: however, but, therefore, because, in addition, for example.',
          'If a word is unfamiliar, keep going — the surrounding words usually hint at its meaning.',
        ],
      },
      {
        heading: 'Question types and tactics',
        bullets: [
          'Main idea: the option that covers the whole passage, not a single detail.',
          'Tone/mood: match the emotional language of the passage (happy, critical, sarcastic, persuasive).',
          'Vocabulary in context: replace the word with each option and see which fits the two lines around it.',
          'Inference: the correct answer follows logically from the text; distractor options feel plausible but are not implied.',
          'Reference ("it", "they"): look at the nearest earlier noun that fits grammatically.',
          'Budget two minutes per question; leave hard ones and return to them.',
        ],
      },
      {
        heading: 'How to eliminate options',
        bullets: [
          'Reject options with extreme words (always, never, everyone) — passages rarely support them.',
          'Reject options that are true in real life but absent from the passage.',
          'If two options look alike, re-read the supporting sentence; the correct one is usually the more specific.',
        ],
      },
    ],
    examTip:
      'Never leave a comprehension question blank. If stuck, pick the option with the strongest textual support — examiners reward exactness, not imagination.',
  },
  {
    id: 'english-vocabulary-and-idioms',
    subject: 'english',
    topic: 'Vocabulary & Idioms',
    summary: 'Crack synonyms, antonyms, word-in-context and the idioms that recur in Nigerian exams.',
    practiceTopic: 'vocabulary-and-idioms',
    sections: [
      {
        heading: 'Finding a word’s meaning from context',
        bullets: [
          'Read two or three lines around the word before you choose.',
          'Watch for a definition packed into the same sentence: "a remedy — a cure".',
          'Use restatement and examples: "facile, that is, easy" or "for instance, …".',
          'Look for contrast words — however, but, although — they signal the opposite meaning.',
        ],
      },
      {
        heading: 'Synonyms and antonyms',
        bullets: [
          'Reduce the target word to a simple everyday synonym, then match from the options.',
          'Ignore similar sounds: synonyms must match in meaning, not in rhythm.',
          'To find an antonym, ask yourself what the everyday opposite is and match it.',
          'Use prefixes: un-, in-, im-, dis-, non- mean "not" (unclear, impossible); re- means "again" (rewrite); pre- means "before".',
          'Suffixes show word class: –tion, –ment (nouns); –ous, –able (adjectives); –ly (adverbs).',
        ],
      },
      {
        heading: 'Idioms and phrasal verbs to know',
        bullets: [
          'By and large = on the whole. In the long run = eventually.',
          'Take for granted = accept without appreciating. Put up with = tolerate.',
          'Call off = cancel. Carry out = perform. Look into = investigate. Run into = meet by chance.',
          'Break the ice = start a conversation. Spill the beans = reveal a secret.',
          'Once in a blue moon = very rarely. A blessing in disguise = a hidden good from a setback.',
          'Out of the blue = unexpectedly. Behind the times = old-fashioned.',
          'Idioms are fixed: do not rearrange their words; we say "under no circumstances", not "under any circumstances".',
        ],
      },
    ],
    examTip:
      'When two options seem equally good, choose the more idiomatic or more formal one. The wrong options are usually plausible-sounding but slightly misused.',
  },
]
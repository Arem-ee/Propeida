import type { RevisionNote } from '@/lib/notes'

export const englishNotes: RevisionNote[] = [
  {
    id: 'english-parts-of-speech',
    subject: 'english',
    topic: 'Parts of Speech',
    slug: 'parts-of-speech',
    summary:
      'The eight word classes every English question depends on — and how to spot them in a sentence.',
    practiceTopic: 'parts-of-speech',
    sections: [
      {
        heading: 'The eight parts of speech',
        paragraphs: [
          'Every English sentence is built from eight kinds of words, called parts of speech. Each one has a job. If you can name the job a word is doing, you can answer most "identify the part of speech" questions quickly.',
        ],
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
        paragraphs: [
          'The same word can belong to more than one class, depending on the job it does in the sentence. Do not memorise a list of words; instead, ask what the word is doing where it sits.',
          'Example: "Fast" is an adjective in "a fast car" but an adverb in "drives fast". "Run" is a verb in "I run daily" but a noun in "a quick run".',
        ],
        bullets: [
          'Decide the class by position and function in the sentence, not by memory.',
          '"The" before a noun is an article; before an adjective it can turn the adjective into a noun — "the rich" means rich people.',
        ],
      },
      {
        heading: 'Exam traps',
        paragraphs: [
          'Examiners set traps with words that look like one class but belong to another. Learn these three common ones and you dodge the worst of them.',
        ],
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
    slug: 'concord-rules',
    summary: 'The rules of agreement between subject and verb — a heavily tested area of Nigerian English exams.',
    practiceTopic: 'concord-rules',
    sections: [
      {
        heading: 'Core subject–verb agreement',
        paragraphs: [
          'Concord means agreement: a singular subject takes a singular verb, and a plural subject takes a plural verb. In the present tense this usually just means adding or removing an –s.',
        ],
        bullets: [
          'A singular subject takes a singular verb: The student studies. (add –s to the verb in the present tense)',
          'A plural subject takes a plural verb: The students study.',
          'Words between the subject and verb do not decide the verb: The box of matches is on the shelf. ("box" governs the verb, not "matches")',
        ],
      },
      {
        heading: 'Subjects that fool candidates',
        paragraphs: [
          'Some subjects look plural but behave as singular, and some quantifier phrases switch the verb. These are the most-tested patterns, so learn the list.',
        ],
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
        paragraphs: [
          'Amounts confuse candidates because they look plural. The rule is simple: a sum, distance or period treated as one unit is singular.',
        ],
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
    slug: 'common-grammar-errors',
    summary: 'Tense, pronoun, and other mistakes that recur in "choose the correct sentence" questions.',
    practiceTopic: 'common-grammar-errors',
    sections: [
      {
        heading: 'Tense errors',
        paragraphs: [
          'Tense questions test whether you can match the verb form to the time marker in the sentence. The time marker usually decides which option is correct.',
        ],
        bullets: [
          'Use the simple past for a completed action with a specific past time: I went to school yesterday (not "I have gone to school yesterday").',
          'Use the present perfect for a past action with present relevance and no definite time: I have finished my revision.',
          'Use the past perfect ("had finished") for the earlier of two actions: By the time I arrived, the lesson had started.',
          'Time markers decide the tense: "two years ago" goes with the simple past; "since" goes with a perfect tense.',
          'In reported speech, shift the tense back: He said he was tired (not "he is tired").',
        ],
      },
      {
        heading: 'Pronoun errors',
        paragraphs: [
          'The choice between "I" and "me" depends on whether the word is doing the action (subject) or receiving it (object). Prepositions always take the object form.',
        ],
        bullets: [
          'After a preposition, use the object form: between you and me (not "you and I").',
          'After "than" and "as", complete the clause mentally: She is taller than I (am).',
          'Use reflexive pronouns only when subject and object are the same person: She dressed herself.',
          'Every pronoun must agree with its antecedent and stay consistent: Everyone should bring their books (informal but common); avoid mixing singular and plural carelessly.',
        ],
      },
      {
        heading: 'Errors examiners repeat',
        paragraphs: [
          'A small set of errors appears again and again in "choose the correct sentence" questions. Learn these and you eliminate most wrong options at once.',
        ],
        bullets: [
          'Double negatives are ungrammatical: "I did not see nothing" → "I did not see anything".',
          'Redundancy: "return back", except "repeat again", "advance forward" — one word carries the idea.',
          'Prepositions: "running for the bus" vs "running to the bus" changes meaning; say "good at", "different from", "prefer … to …", "insist on", "arrive at/in".',
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
    slug: 'comprehension-tips',
    summary: 'A read-and-answer playbook: predict, underline, decide and eliminate to protect marks.',
    practiceTopic: 'comprehension-tips',
    sections: [
      {
        heading: 'Before you read the passage',
        paragraphs: [
          'Do not read the passage first. Read the questions first so you know what to look for, then read the passage with those questions already in your mind. Every answer must come from the text, not from real-world knowledge.',
        ],
        bullets: [
          'Scan the questions in one sweep — they tell you what to look for.',
          'Notice the question verbs: what (fact), why (reason), whom (person), how (manner).',
          'Never guess an answer without checking the passage; every answer must be supported by the text.',
        ],
      },
      {
        heading: 'While you read',
        paragraphs: [
          'Read actively: underline the main idea of each paragraph and tick anything the questions asked about. Understanding where each idea sits makes finding answers fast.',
        ],
        bullets: [
          'Note the topic sentence of each paragraph — usually the first sentence.',
          'Circle proper nouns, dates and figures; questions love to reuse them.',
          'Slow down at signal words: however, but, therefore, because, in addition, for example.',
          'If a word is unfamiliar, keep going — the surrounding words usually hint at its meaning.',
        ],
      },
      {
        heading: 'Question types and tactics',
        paragraphs: [
          'The most common question types follow the same logic every year. Match each question to its tactic: ',
        ],
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
        paragraphs: [
          'When you are stuck, eliminate rather than guess blindly. Wrong comprehension options usually leave a tell: an extreme word, real-world truth not in the passage, or vagueness.',
        ],
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
    slug: 'vocabulary-and-idioms',
    summary: 'Crack synonyms, antonyms, word-in-context and the idioms that recur in Nigerian exams.',
    practiceTopic: 'vocabulary-and-idioms',
    sections: [
      {
        heading: 'Finding a word’s meaning from context',
        paragraphs: [
          'You are rarely expected to know every word. Instead, the passage around the word gives the clues. Read a little wider than the one line before choosing.',
        ],
        bullets: [
          'Read two or three lines around the word before you choose.',
          'Watch for a definition packed into the same sentence: "a remedy — a cure".',
          'Use restatement and examples: "facilitate, that is, ease" or "for instance, …".',
          'Look for contrast words — however, but, although — they signal the opposite meaning.',
        ],
      },
      {
        heading: 'Synonyms and antonyms',
        paragraphs: [
          'For synonym questions, reduce the target word to a simple everyday equivalent, then match it to the options. For antonyms, think of the everyday opposite first.',
        ],
        bullets: [
          'Reduce the target word to a simple everyday synonym, then match from the options.',
          'Ignore similar sounds: synonyms must match in meaning, not in rhythm.',
          'Use prefixes: un-, in-, im-, dis-, non- mean "not" (unclear, impossible); re- means "again" (rewrite); pre- means "before".',
          'Suffixes show the word class: –ion, –ment; –y; –able (adjectives) usually form nouns; –ly forms adverbs.',
        ],
      },
      {
        heading: 'Idioms and phrasal verbs to know',
        paragraphs: [
          'Idioms are fixed phrases whose meaning is different from the literal words. Learn them as blocks, not as single words.',
        ],
        bullets: [
          'By and large = on the whole. In the long run = eventually. Take for granted = accept without appreciating. Put up with = tolerate.',
          'Call off = cancel. Carry out = perform. Look into = investigate. Run into = meet by chance.',
          'Break the ice = start a conversation. Spill the beans = reveal a secret. Once in a blue moon = very rarely.',
          'A blessing in disguise = a hidden good from a seemingly bad situation. Out of the blue = unexpectedly. Behind the times = old-fashioned.',
          'Idioms are fixed: do not rearrange their words; we say "under no circumstances", not "in no circumstances".',
        ],
      },
    ],
    examTip:
      'When two options seem equally good, choose the more idiomatic or more formal one. The wrong options are usually plausible-sounding but slightly misused.',
  },
]
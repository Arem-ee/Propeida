# Propeida writing rules

Every word a learner reads inside the app — lesson text, buttons, checkmarks, empty states, error messages, page headers — follows these rules first. Lesson structure (word counts, sections, checks, worked examples) lives in `docs/lesson-authoring-standard.md`; this document governs **tone, voice, punctuation, and sentence craft** across all user-facing copy.

## Tone and voice

### 1. One person to one person
Write to **you**, the specific learner reading this screen right now. Never write to "users," "learners," "students," or "everyone."

- ✅ You're grouped with other people studying for Post-UTME at UNILORIN
- ❌ Learners are matched with other learners preparing for Post-UTME at UNILORIN
- ❌ We match you with other learners on Post-UTME · UNILORIN

### 2. Casual, conversational
Sound like a person talking, not a system announcing. Avoid formal verbs ("have matched," "is authorized," "will be redirected") and marketing slogans.

- ✅ You're matched with people on your exact exam path
- ❌ Matching is performed according to your exam path selection
- ❌ One exam. One squad. No ranks.

### 3. Short lines, no full stops
In UI copy, **do not use full stops (periods)** at the end of lines, buttons, headers, or callout text. Use line breaks to separate thoughts instead. Full stops make copy feel like finished prose; line breaks keep it breathable and chat-like.

- ✅ When you pause your progress is saved nothing gets lost  
  Take your time go at whatever speed works for you
- ❌ When you pause, your progress is saved. Nothing gets lost.

Exceptions: lesson prose inside `text` blocks follows the lesson-authoring standard (full stops are fine there, max three sentences per paragraph). But UI labels, buttons, headers, checkmarks, and toast messages never end with a full stop.

### 4. Full sentences, no fragments
Every line needs a subject and a verb. No telegraphic punch lines.

- ✅ You study whenever you want  
  Being in a squad just means you're not doing it alone
- ❌ One exam. One squad. No ranks.
- ❌ No ranks.

### 5. Concrete mechanics only
Say what actually happens. No vague reassurance, no tautologies, no "just means" hand-waving.

- ✅ Nobody in your squad can see your score accuracy or pace  
  Invite only no public list and no messaging between members inside Propeida
- ❌ Your pace is the right pace (means nothing)
- ❌ Paused counts as saved never broken ("broken" is undefined)

### 6. No system voice
Never say "I have matched you," "we have matched you," or "the system will." State what is true for the learner.

- ✅ You're grouped with other people studying for Post-UTME at UNILORIN
- ❌ I have matched you with other learners

### 7. Common words, natural flow
Use everyday words anyone would say out loud. No uncommon constructions, no formal sentence shapes, no telegraphic clipping. If you would not say it to a friend across a table, do not write it on the screen.

- ✅ Everyone in a squad is studying for the same exam no one sees ranks
- ✅ You're in a small group with other people doing the same exam everyone goes at their own speed
- ❌ The same exam no ranking no comparison (meaningless, clipped)
- ❌ The same exam. No ranking. No comparison. (marketing fragment)
- ✅ Tai is the Ibadan shop man who gets your passport moving ₦100,000 for the booklet ₦20,000 to push the capture
- ❌ Tai — Ibadan shop hand fast passport 100,000 plus 20,000, informal way sign (telegraphic)

### 8. Explanations must teach, not recite
The explanation under an answer (or under any claim) owes the learner what the question already tests. Three or four sentences, plain words: what the term actually means, with a scene or sentence you could hear in an everyday Nigerian conversation; one wrong-option trap and why it fails; how JAMB will set it. If an explanation could be bolted onto any question with that word and still look complete, it is a dictionary tag, not an explanation — start from (1) how a fresher would meet the word, (2) one concrete image, (3) the near-miss that catches people out.

- ✅ QUIESCENT — the game was still, the streets were quiet, nothing moved; a boiling of nobody wanting to riot. The word is "quietness holding itself, still but waiting". JAMB uses this word as "inactive, not currently active". The opposite is turbulent, not "bad" — tumultuous, disorderly, restless — a market in chaos, not one that struggles with poverty.
- ❌ Quiescent means in a state or period of inactivity or dormancy. The opposite in meaning is turbulent, which means characterized by conflict, disorder, or confusion.
- ✅ Mitigate — someone puts a hand under a falling jerrican, helps it land softly instead of smashing. "Mostly, we mitigated the damage". JAMB wants you to choose soften vs worsen (aggravate), not solve vs create.
- ❌ Mitigate means to make less severe, serious, or painful. Its antonym is aggravate, which means to make a problem or condition worse.

## UI copy checklist

Apply this to every button, header, subhead, checkmark, toast, empty state, and error message:

| Element | Rule |
|---|---|
| Buttons | Start with a verb. No full stop. Casual: `Join your squad` not `Join my squad` |
| Headers | One line, no full stop. Specific to the page: `Study squad` not `Dashboard` |
| Checkmarks | Each line states one concrete fact. No full stops |
| Empty states | Explain what the learner sees and what they can do next |
| Error messages | Say what went wrong and what to do. No apology theatre |
| Success messages | Say what happened. No exclamation marks |
| Tooltips | One line, no full stop |

### 9. No em dashes in learner-facing copy
Learner-facing text (UI copy, lessons, in-app prose, checkmarks, explanations) never uses an em dash (—) or en dash for a sentence break. Use "you" as the subject; start a new sentence or a comma. Em dashes are an editing convention, not natural speech, and they read as AI-generated.

- ✅ You can finish this in one sitting. The exercise explains one idea at a time.
- ❌ You can finish this in one sitting — the exercise explains one idea at a time.
- ❌ The definition is simple — it means quiet.

### 10. Nothing internal leaks to the learner
Text written for the author, the engineer or the spec never reaches the screen. If you open a lesson and it opens with a note-to-self, that's not copy, that's scaffolding. Delete it.

- ❌ First — what do you already know? … This is one question with no teaching yet.
- ✅ Before the lesson, one question. … Answer honestly. This shows us where you're starting.
- ❌ No teaching yet, no vocabulary load, no jargon.
- ❌ Rhetoric question
- ❌ As written by the author
- ❌ Go deeper: implied pedestrian counter-argument

Lessons follow `docs/lesson-authoring-standard.md` for structure (one concept per lesson, 1–3 sections, 120–180 words per section, checks, worked examples, takeaways). In addition:

- **Takeaways** are one sentence, under 20 words, no full stop
- **Check `why` explanations** are one line, no full stop
- **Worked example steps** say what was done and why, no full stops
- **Guided prompts** speak directly to the learner: `Now you try` not `The learner should attempt`
- **Exam tips** are decision rules, not summaries, no full stops
- **Never** open with `In this lesson we will…` or `By the end you will…` — start with the content
- **Every line the learner reads** (bullets, `why` lines, takeaways, guided prompts) must be a full, spoken sentence in common words (see rule 7) — telegraphic fragments are rewritten, never just stripped
- **Worked example steps and checks** read as if spoken aloud: concrete subject, concrete verb, no jargon-compounds invented by the author
- **Say it to a friend** — every line is one full sentence you would say to the person sitting next to you; one-liners break lines instead of ending with a full stop, and full stops stay only where normal writing genuinely needs them

## Anti-patterns (never write these)

- Marketing fragments: `One exam. One squad. No ranks.`
- Tautologies: `Your pace is the right pace`
- System voice: `I have matched you`, `We have verified your payment`
- Vague reassurance: `Paused counts as saved never broken`
- Formal apologies: `We apologise for the inconvenience`
- Full stops on UI labels, buttons, headers, or checkmarks
- Addressing `users` or `learners` instead of `you`

## Ownership

If you change UI copy, update this document. If you change lesson prose, check `docs/lesson-authoring-standard.md` first, then apply the tone rules above. Run `npm run lint` and `npm run typecheck` after touching any user-facing string.
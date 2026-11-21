# AGENTS.md — mandatory rules for every agent in this repository

Any agent working in this repository, on any task, must abide by the rules
below and by the two documents they come from. These are not suggestions.
A commit that violates them is an unfinished commit.

## Read first, before any change

1. `docs/lesson-authoring-standard.md` — the shape of a lesson.
2. `docs/agent-authoring-spec.md` — the register, terminology and verification
   rules, written for cold-start agents.
3. The IBASS objectives for the topic in the live `topics` table and the
   Nigerian classroom materials named in the spec.

If there is a conflict, the more recent instruction from the repo owner wins;
otherwise the agent-authoring-spec wins over habit and memory.

## The non-negotiable rules

- **Research before writing.** No lesson, explanation, step or calculation is
  authored from memory. Find the IBASS goal, the textbook method and a worked
  example, then simplify into small logical pieces. Our difference from the
  textbooks is the breakdown, not a rewrite of the mathematics. If a source
  cannot be found, say so; do not invent a sequence.
- **IBASS goals are the completeness test.** Every listed goal is its own
  distinct skill with its own worked instance. Surface resemblance is not
  coverage.
- **IBASS recommends textbooks; follow them.** Use the Nigerian system for
  Nigeria: words, formulas and notation from Nigerian textbooks. Borrow from
  outside only when it genuinely makes the idea simpler. Never invent a
  formula, notation or teaching order.
- **Zero prior knowledge.** Every term, symbol and method is defined in place
  in plain words before use. No "as you already know", no "obvious".
- **No skipped steps in calculations.** Show the place worth before the
  multiplication, every division line, every remainder. A learner must never
  do hidden arithmetic in their head to follow our working.
- **Worked calculations have hierarchy.** Each step stands on its own line in
  reading order. Never trap a multi-part calculation inside a prose sentence.
  Never type `MATH:`; maths-only lines are detected and set as panels by the
  renderer.
- **Worked examples end with a Check to confirm step** that verifies by a
  different route.
- **Predict prompts are plain, concrete questions.** The reason states the
  rule, the result carries the numbers, the prompt asks the next computation.
  A prompt answerable from the reason above it is broken.
- **Terminology, fixed:** "base ten" never "decimal"; place value means the
  named base-ten columns and their worths, not the exponents; power is the
  exponent (how many times a number is multiplied by itself); other bases get
  no invented column names ("nines column" etc. do not exist) — say "the
  column worth 9".
- **Register:** natural and casual, the spoken test, one idea per sentence,
  concrete before abstract, no nested qualification, no theatre. These rules
  are cumulative; use all of them, not whichever is convenient.
- **British spelling and punctuation** throughout; no em dashes in lessons.
- **Bold the key quantities** in working; keep bold inside `**...**` (the
  renderer turns it into `<strong>`).
- **Each card advances one concept.** A card that restates the previous one in
  different clothes is a failure. Lessons in a series progress: concept,
  conversion, operations, modular arithmetic.
- **No paragraph longer than three sentences.** Depth sections, when present,
  are 600–900 words and at least two; they appear only at the end. Core has a
  soft 500-word floor; quality wins over the counter and nothing is cut to
  fit it.

## Mandatory workflow per change

1. Read the rules and the sources.
2. Draft against those sources; every calculation hand-checked against a
   worked example from them.
3. Verify: `node scripts/check-lesson-depth.mjs`, KaTeX panel scan (zero
   errors), banned-string scan (zero hits), `npm run typecheck`.
4. Seed: `node --env-file=.env scripts/_seed-bio-changed.mjs <file>`, then
   confirm the live rows.
5. Render and inspect the actual page or rendered DOM before declaring done.
   Data checks prove bytes landed; they do not prove the page is right.
6. Commit only the intended files. Check `git status` first; never stage the
   repo owner's uncommitted work. Remove your own scratch files.

## Never do these

- Never blind-replace a word across a whole file. Earlier session did this and
  corrupted correct "fractions and decimals" objectives into "fractions and
  base tens". Every replacement must be inspected in context.
- Never restore or revert a lesson the owner has reviewed unless explicitly
  told to. "The old one was good" is an observation, not an instruction.
- Never invent or rename a topic, change a `sort_order`, or restructure the
  curriculum without explicit instruction; these are owner decisions.
- Never author new visual components into the lesson renderer without asking.
- Never claim a rule was recorded or a check was run unless it actually was.

## Open point awaiting the owner

The sentence-length rule is recorded in both documents as **"prefer several
short sentences to one long one; one idea per sentence"**. The owner has said
they believe the rule is the opposite ("not to write short sentences"). Do not
silently change it. Ask for the exact wording they want and then amend all
three files together.

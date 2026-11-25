# Sections E + F — Accessibility, UX, content, config (2026-11-25)

## E01 Labels/focus/keyboard/ARIA — PARTIAL (Low–Medium)
Labels, focus rings, 44px targets and `role="alert"` are present across auth and players. Gaps: mock options lack `aria-pressed`; low-contrast micro-copy; glossary popup focus not trapped; `focus:outline-none` on some textareas removes the ring.

## E02 Responsive 320/360 — NOT VERIFIABLE (runtime)
Structure is responsive (grids, scroll containers). No browser available for a 320/360px overflow check.

## E03 Loading/empty/error — PARTIAL (Medium)
Global and practice states good. Lesson-check/reflection/mock-submit now surface errors (fixed). Remaining: some admin `void` chains silent; empty lists in a few places render `null`.

## E04 Hierarchy — PARTIAL (Low)
Primary/secondary pattern good. Duplicate header exits on auth pages; Google button can read as co-primary.

## E05 Math rendering — PARTIAL (Medium)
`MathText` is correct and used in most fields. **Gap:** `components/lessons/lesson-player.tsx:220` renders lesson inline-check `opt.text` as raw text (tokens would show literally). Most other surfaces (results, mocks, practice, diagnostic, topic descriptions, tables, passages) now use `MathText`.

## E06 Validation feedback — PARTIAL (Low–Medium)
`friendlyAuthError` copy is specific; errors use `role="alert"`. Async duplicate-email hint not announced; no `aria-invalid`/`aria-describedby`.

## F01 Authoring standard — PASS (sampled)
`measurements-and-units` meets shape/budget; physics and biology curricula now have **0 em/en dashes**.

## F02 Token grammar — PARTIAL (High)
Fixed this session: worked-example problems/hints, results options/explanation, topic descriptions, question tables, passages, English blocks. **Remaining raw:** `lesson-player.tsx:220` inline-check options.

## F03 Trust metrics — PARTIAL (needs owner)
`lib/site-config.ts:10-18` publicly serves `verifiedQuestions: '4,600+'`, `jambQuestions: '3,500+'`, `unilorinQuestions: '1,070+'`, `activeStudents: '20+'` via `/api/stats` (`app/api/stats/route.ts:24-25`). No sign-off record. **Owner decision required; not changed.**

## F04 Links — PASS (static)
All static/dynamic hrefs map to existing routes; `/` rewrite and landing anchors verified. Data-driven slugs not exercised at runtime.

## Summary

| Item | Status |
|---|---|
| E01 | PARTIAL (Low–Medium) |
| E02 | NOT VERIFIABLE |
| E03 | PARTIAL (Medium) |
| E04 | PARTIAL (Low) |
| E05 | PARTIAL (Medium) |
| E06 | PARTIAL (Low–Medium) |
| F01 | PASS |
| F02 | PARTIAL (High) |
| F03 | PARTIAL (owner) |
| F04 | PASS |
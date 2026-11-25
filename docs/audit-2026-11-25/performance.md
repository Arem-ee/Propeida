# Section D — Performance and cost (2026-11-25)

## D01 Heavy libraries — PASS (fixed this session)
KaTeX is now lazy-loaded: `components/lessons/math-text.tsx:13-21` uses `import('katex')` on first use, with a module cache and a CSS-stacked fraction fallback. Previously a static `'use client'` import pulled 267 KB min.js + 24.8 KB CSS + 1.03 MB fonts into every lesson/question page (3.8 MB dev lesson chunk). No PDF/chart libs in the app.

## D02 Cache audience — PASS
`unstable_cache` callbacks (`learn-subjects`, `path-subjects`, `practice`/`mocks` counts) return public catalogue/aggregates via service role; entitlement filtering is per-request. `React cache()` is request-scoped and user-keyed (`lib/lesson-loader.ts`). No `use cache`.

## D03 Dedupe / waterfalls — PARTIAL (Medium)
`getLessonByPath` is now wrapped in `cache()` and used by both metadata and page (`lesson-loader.ts:12`, `learn/[subject]/[slug]/page.tsx:13,23`). Remaining: other pages still do sequential awaits and repeated `auth.getUser()`/`getExamScope()`; `mocks/page.tsx` fetches profile and events serially before the parallel block.

## D04 Images — PARTIAL (Low)
`next/image` used in `components/mascot.tsx`; raw `<img>` in `question-figure.tsx:28`, `marketing-article.tsx:71,177`, `visuals/image.tsx:18`, `nephron-explorer.tsx:422,587`. Large assets exist in `public/lessons`. No long-cache headers for `/public` (`next.config.ts:32-56`).

## D05 Fonts — PASS
`next/font/local` with self-hosted woff2 (`app/layout.tsx`); no Google Fonts build dependency.

## D06 Redis/DB hot paths — PARTIAL (Medium)
Rate caps 1–120/min; memory store bounded (1000 keys). `checkRateLimit` uses INCR+PEXPIRE (2 RTT on first hit). `/mocks` count now an aggregate RPC (fixed). Lesson view still ~30 DB/auth round trips from duplicated callers on other routes.

## Summary

| Item | Status |
|---|---|
| D01 | PASS |
| D02 | PASS |
| D03 | PARTIAL (Medium) |
| D04 | PARTIAL (Low) |
| D05 | PASS |
| D06 | PARTIAL (Medium) |
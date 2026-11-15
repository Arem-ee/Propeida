'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Upload, Trash2, Search, ChevronLeft, ChevronRight, Tags, X, ArrowUpDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/admin/page-header'
import { AdminTable, THead, Th, TBody, Td, TableEmpty } from '@/components/admin/table'
import { inputClass, FormError } from '@/components/admin/form'
import { QuestionStatusPill, VerifiedDot } from '@/components/admin/badge'
import { useConfirm } from '@/components/admin/confirm'

interface Question {
  id: string
  question_text: string
  difficulty: string
  status: string
  verified_state: string
  exams: { name: string } | { name: string }[] | null
  subjects: { name: string } | { name: string }[] | null
}

const PAGE_SIZE = 50

type SortKey = 'newest' | 'oldest' | 'az' | 'za' | 'exam' | 'subject' | 'status' | 'verified'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'Question A → Z' },
  { value: 'za', label: 'Question Z → A' },
  { value: 'exam', label: 'Exam A → Z' },
  { value: 'subject', label: 'Subject A → Z' },
  { value: 'status', label: 'Status' },
  { value: 'verified', label: 'Verification' },
]

function applySort<T extends { order: (column: string, options?: Record<string, unknown>) => T }>(
  query: T,
  sort: SortKey,
): T {
  switch (sort) {
    case 'newest':
      return query.order('created_at', { ascending: false }).order('id', { ascending: true })
    case 'oldest':
      return query.order('created_at', { ascending: true }).order('id', { ascending: true })
    case 'az':
      return query.order('question_text', { ascending: true }).order('id', { ascending: true })
    case 'za':
      return query.order('question_text', { ascending: false }).order('id', { ascending: true })
    case 'exam':
      return query.order('name', { referencedTable: 'exams', ascending: true }).order('id', { ascending: true })
    case 'subject':
      return query.order('name', { referencedTable: 'subjects', ascending: true }).order('id', { ascending: true })
    case 'status':
      return query.order('status', { ascending: true }).order('id', { ascending: true })
    case 'verified':
      return query.order('verified_state', { ascending: true }).order('id', { ascending: true })
  }
}

/** PostgREST LIKE-pattern escape: `\`, `%`, `_` are special. */
function escapeLike(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export default function AdminQuestionsPage() {
  const router = useRouter()
  const { confirm, dialog } = useConfirm()
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [needsReviewCount, setNeedsReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [coverage, setCoverage] = useState<{ total: number; mapped: number; pct: number; topics: number; topicMapped: number; topicPct: number } | null>(null)
  const [cloningId, setCloningId] = useState<string | null>(null)
  const [tagSubjects, setTagSubjects] = useState<{ id: string; name: string }[]>([])
  const [tagSubjectId, setTagSubjectId] = useState('')
  const [tagTopics, setTagTopics] = useState<{ id: string; name: string }[]>([])
  const [tagTopicId, setTagTopicId] = useState('')
  const [tagRole, setTagRole] = useState('practice')
  const [tagging, setTagging] = useState(false)
  const [tagResult, setTagResult] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('needs_review')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [page, setPage] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const from = total === 0 ? 0 : safePage * PAGE_SIZE + 1
  const to = Math.min(total, (safePage + 1) * PAGE_SIZE)

  // Debounce the search box so we are not querying on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => clearTimeout(timer)
  }, [query])

  // Back to the first page whenever the filter set changes
  useEffect(() => {
    setPage(0)
    setActionError(null)
  }, [statusFilter, debouncedQuery, sort])

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let queryBuilder = supabase
      .from('questions')
      .select('id, question_text, difficulty, status, verified_state, exams!questions_exam_id_fkey(name), subjects(name)', { count: 'exact' })
    if (statusFilter === 'needs_review') {
      queryBuilder = queryBuilder.in('status', ['draft', 'in_review'])
    } else if (statusFilter !== 'all') {
      queryBuilder = queryBuilder.eq('status', statusFilter)
    }
    if (debouncedQuery) {
      queryBuilder = queryBuilder.ilike('question_text', `%${escapeLike(debouncedQuery)}%`)
    }
    const sorted = applySort(queryBuilder, sort)
    const { data, count } = await sorted.range(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE - 1)
    setQuestions((data ?? []) as Question[])
    setTotal(count ?? 0)
    setLoading(false)
  }, [statusFilter, debouncedQuery, sort, safePage])

  useEffect(() => {
    void loadQuestions()
  }, [loadQuestions])

  // Keep the page in range when the result set shrinks (e.g. after deletes)
  useEffect(() => {
    if (page >= pageCount) setPage(Math.max(0, pageCount - 1))
  }, [page, pageCount])

  // Head count for the "Needs review" chip, independent of the current filter
  const refreshNeedsReview = useCallback(async () => {
    const supabase = createClient()
    try {
      const { count } = await supabase
        .from('questions')
        .select('id', { count: 'exact', head: true })
        .in('status', ['draft', 'in_review'])
      setNeedsReviewCount(count ?? 0)
    } catch {
      // The chip keeps its previous value if the count fails
    }
  }, [])

  useEffect(() => {
    void refreshNeedsReview()
  }, [refreshNeedsReview])

  useEffect(() => {
    fetch('/api/admin/questions/coverage')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.total === 'number') setCoverage(data)
      })
      .catch(() => {})
    fetch('/api/admin/refs')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.subjects) setTagSubjects(data.subjects)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!tagSubjectId) {
      setTagTopics([])
      setTagTopicId('')
      return
    }
    fetch(`/api/admin/topics?subject_id=${encodeURIComponent(tagSubjectId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setTagTopics(data?.topics ?? []))
      .catch(() => setTagTopics([]))
  }, [tagSubjectId])

  const handleClone = async (id: string) => {
    setCloningId(id)
    setActionError(null)
    try {
      const res = await fetch('/api/admin/questions/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Clone failed')
      router.push(`/admin/questions/${data.id}/edit`)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Clone failed')
      setCloningId(null)
    }
  }

  const handleBulkTag = async () => {
    if (!tagTopicId || selected.size === 0 || tagging) return
    setTagging(true)
    setTagResult(null)
    try {
      const res = await fetch('/api/admin/questions/bulk-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), topic_id: tagTopicId, role: tagRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Bulk tagging failed')
      setTagResult(
        `Applied to ${data.applied} question(s)` +
        (data.skipped > 0 ? `, skipped ${data.skipped} (different subject)` : ''),
      )
      setSelected(new Set())
    } catch (err) {
      setTagResult(err instanceof Error ? err.message : 'Bulk tagging failed')
    } finally {
      setTagging(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAllPage = () => {
    const pageIds = questions.map((q) => q.id)
    const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allOnPage) {
        for (const id of pageIds) next.delete(id)
      } else {
        for (const id of pageIds) next.add(id)
      }
      return next
    })
  }

  const handleDeleteSelected = async () => {
    const ok = await confirm({
      title: `Delete ${selected.size} question(s)?`,
      body: 'You cannot undo this action and some of this content took real manual verification work',
      confirmLabel: `Delete ${selected.size}`,
      tone: 'danger',
    })
    if (!ok) return
    setDeleting(true)
    setActionError(null)
    try {
      const res = await fetch('/api/admin/questions/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Delete failed')
      }
      setSelected(new Set())
      await loadQuestions()
      void refreshNeedsReview()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const allOnPage = questions.length > 0 && questions.every((q) => selected.has(q.id))
  const selectedOnPage = questions.filter((q) => selected.has(q.id)).length

  return (
    <div>
      {dialog}
      <PageHeader
        eyebrow="Content"
        title="Question bank"
        description="Every question Propeida holds. Search, sort, tag in bulk, or prune — publishing happens in the review queue"
        actions={
          <>
            {selected.size > 0 && (
              <button
                onClick={() => void handleDeleteSelected()}
                disabled={deleting}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete ({selected.size})
              </button>
            )}
            <Link
              href="/admin/questions/upload"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-ink-soft hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" aria-hidden />
              Import
            </Link>
            <Link
              href="/admin/questions/new"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New Question
            </Link>
          </>
        }
      />

      {coverage && (
        <p className="-mt-4 mb-5 text-xs font-semibold text-ink-soft">
          Misconception maps: {coverage.mapped}/{coverage.total} questions ({coverage.pct}%) · Topic maps: {coverage.topicMapped}/{coverage.total} ({coverage.topicPct}%) · {coverage.topics} topics
        </p>
      )}

      {actionError && (
        <div className="mb-4">
          <FormError>{actionError}</FormError>
        </div>
      )}

      {/* Bulk tag panel */}
      {selected.size > 0 && (
        <div className="mb-4 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-violet-800">
              <Tags className="h-4 w-4" aria-hidden />
              Tag {selected.size} selected
            </span>
            <select
              value={tagSubjectId}
              onChange={(e) => { setTagSubjectId(e.target.value); setTagTopicId('') }}
              aria-label="Subject for bulk tag"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 min-h-[44px]"
            >
              <option value="">Subject...</option>
              {tagSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={tagTopicId}
              onChange={(e) => setTagTopicId(e.target.value)}
              disabled={!tagSubjectId || tagTopics.length === 0}
              aria-label="Topic for bulk tag"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 min-h-[44px] disabled:opacity-50"
            >
              <option value="">{tagTopics.length === 0 ? 'No topics' : 'Topic...'}</option>
              {tagTopics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select
              value={tagRole}
              onChange={(e) => setTagRole(e.target.value)}
              aria-label="Topic role"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 min-h-[44px]"
            >
              {['diagnostic', 'practice', 'review', 'mock'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              onClick={() => void handleBulkTag()}
              disabled={!tagTopicId || tagging}
              className="cursor-pointer rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 min-h-[44px] disabled:opacity-50"
            >
              {tagging ? 'Applying...' : 'Apply'}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="cursor-pointer rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:bg-white min-h-[44px]"
            >
              Clear
            </button>
          </div>
          {tagResult && <p className="mt-2 text-xs font-bold text-violet-800">{tagResult}</p>}
        </div>
      )}

      {/* Filters, search, sort */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search question text..."
            aria-label="Search question text"
            className={`${inputClass} pl-10`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
          {([
            ['needs_review', `Needs review (${needsReviewCount})`],
            ['all', 'All'],
            ['published', 'Published'],
            ['rejected', 'Rejected'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              aria-pressed={statusFilter === value}
              className={`min-h-[40px] cursor-pointer rounded-full px-4 py-2 text-xs font-extrabold transition-colors ${
                statusFilter === value
                  ? 'bg-gray-900 text-white'
                  : 'border border-gray-200 bg-white text-ink-soft hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="ml-auto inline-flex items-center gap-2 text-xs font-extrabold text-ink-soft">
          <ArrowUpDown className="h-4 w-4" aria-hidden />
          <span className="sr-only">Sort questions</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort questions"
            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 min-h-[44px]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <AdminTable>
        <THead>
          <tr>
            <Th className="w-12">
              <input
                type="checkbox"
                checked={allOnPage}
                onChange={toggleSelectAllPage}
                aria-label="Select all on this page"
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600"
              />
            </Th>
            <Th>Question</Th>
            <Th>Exam</Th>
            <Th>Subject</Th>
            <Th>Difficulty</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </THead>
        <TBody>
          {questions.map((q) => {
            const exam = Array.isArray(q.exams) ? q.exams[0] : q.exams
            const subject = Array.isArray(q.subjects) ? q.subjects[0] : q.subjects
            return (
              <tr key={q.id} className="hover:bg-blue-50/30">
                <Td>
                  <input
                    type="checkbox"
                    checked={selected.has(q.id)}
                    onChange={() => toggleSelect(q.id)}
                    aria-label="Select question"
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600"
                  />
                </Td>
                <Td className="max-w-md truncate font-semibold text-black">{q.question_text}</Td>
                <Td>{(exam as { name?: string })?.name ?? '-'}</Td>
                <Td>{(subject as { name?: string })?.name ?? '-'}</Td>
                <Td>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold capitalize text-blue-700">
                    {q.difficulty}
                  </span>
                </Td>
                <Td>
                  <span className="inline-flex items-center gap-1.5">
                    <VerifiedDot state={q.verified_state} />
                    <QuestionStatusPill status={q.status} />
                  </span>
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => void handleClone(q.id)}
                      disabled={cloningId === q.id}
                      title="Duplicate this question with its maps"
                      className="min-h-[36px] cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-gray-100 disabled:opacity-50"
                    >
                      {cloningId === q.id ? 'Cloning...' : 'Clone'}
                    </button>
                    <Link
                      href={`/admin/questions/${q.id}/edit`}
                      className="inline-flex min-h-[36px] items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </Link>
                  </div>
                </Td>
              </tr>
            )
          })}
          {!loading && questions.length === 0 && (
            <TableEmpty colSpan={7}>
              {debouncedQuery
                ? `Nothing matches "${debouncedQuery}"`
                : statusFilter === 'needs_review' && total === 0
                  ? 'No questions were found, so create your first question'
                  : 'Nothing is in this state'}
            </TableEmpty>
          )}
          {loading && (
            <TableEmpty colSpan={7}>Loading questions...</TableEmpty>
          )}
        </TBody>
      </AdminTable>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold tabular-nums text-ink-soft">
          {total > PAGE_SIZE ? `Showing ${from}–${to} of ${total}` : `${total} question${total === 1 ? '' : 's'}`}
          {selectedOnPage > 0 && ` · ${selectedOnPage} on this page selected`}
          {selected.size > selectedOnPage && ` · ${selected.size - selectedOnPage} more elsewhere`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            aria-label="Previous page"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-ink-soft hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="text-xs font-extrabold tabular-nums text-ink-soft">
            {safePage + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            aria-label="Next page"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-ink-soft hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

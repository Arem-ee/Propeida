'use client'

import { useState } from 'react'

export interface Block {
  id: string
  block_type: string
  content: Record<string, unknown>
}

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const lines = (v: unknown) =>
  Array.isArray(v) ? v.map(String).join('\n') : ''
const splitLines = (s: string) =>
  s.split('\n').map((l) => l.trim()).filter(Boolean)

function TextFields({ content, set }: { content: Record<string, unknown>; set: (patch: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-2.5">
      <input
        value={str(content.heading)}
        onChange={(e) => set({ heading: e.target.value })}
        placeholder="Heading"
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm min-h-[44px]"
      />
      <textarea
        value={lines(content.paragraphs)}
        onChange={(e) => set({ paragraphs: splitLines(e.target.value) })}
        placeholder="Paragraphs (blank line between)"
        rows={3}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-y"
      />
      <textarea
        value={lines(content.bullets)}
        onChange={(e) => set({ bullets: splitLines(e.target.value) })}
        placeholder="Bullets (one per line)"
        rows={3}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-y"
      />
    </div>
  )
}

function CalloutFields({ content, set }: { content: Record<string, unknown>; set: (patch: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <input
          value={str(content.title)}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Title"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm min-h-[44px]"
        />
        <select
          value={str(content.tone) || 'info'}
          onChange={(e) => set({ tone: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm min-h-[44px]"
        >
          {['info', 'tip', 'warning'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <textarea
        value={str(content.body)}
        onChange={(e) => set({ body: e.target.value })}
        placeholder="Body"
        rows={2}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-y"
      />
    </div>
  )
}

interface Step {
  operation: string
  reason: string
  result: string
  predictPrompt: string
}

function WorkedFields({ content, set }: { content: Record<string, unknown>; set: (patch: Record<string, unknown>) => void }) {
  const steps = (Array.isArray(content.steps) ? content.steps : []) as Step[]
  const setStep = (i: number, patch: Partial<Step>) => {
    const next = steps.map((s, j) => (j === i ? { ...s, ...patch } : s))
    set({ steps: next })
  }
  return (
    <div className="space-y-3">
      <textarea
        value={str(content.problem)}
        onChange={(e) => set({ problem: e.target.value })}
        placeholder="Problem"
        rows={2}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-y"
      />
      {steps.map((step, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-2">
          <p className="text-xs font-extrabold text-gray-500">STEP {i + 1}</p>
          {(['operation', 'reason', 'result', 'predictPrompt'] as const).map((field) => (
            <input
              key={field}
              value={step[field] ?? ''}
              onChange={(e) => setStep(i, { [field]: e.target.value })}
              placeholder={field === 'predictPrompt' ? 'Predict prompt (optional)' : field[0]!.toUpperCase() + field.slice(1)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm min-h-[44px]"
            />
          ))}
          <button
            onClick={() => set({ steps: steps.filter((_, j) => j !== i) })}
            className="text-xs font-bold text-red-600 min-h-[36px] cursor-pointer"
          >
            Remove step
          </button>
        </div>
      ))}
      <button
        onClick={() => set({ steps: [...steps, { operation: '', reason: '', result: '', predictPrompt: '' }] })}
        className="rounded-xl border-2 border-dashed border-gray-300 w-full py-2.5 text-xs font-extrabold text-gray-500 min-h-[44px] cursor-pointer"
      >
        + Add step
      </button>
    </div>
  )
}

function GuidedFields({ content, set }: { content: Record<string, unknown>; set: (patch: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-2.5">
      <textarea
        value={str(content.question)}
        onChange={(e) => set({ question: e.target.value })}
        placeholder="Prompt question"
        rows={2}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-y"
      />
      <textarea
        value={lines(content.hints)}
        onChange={(e) => set({ hints: splitLines(e.target.value) })}
        placeholder="Hints (one per line, revealing order)"
        rows={3}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-y"
      />
    </div>
  )
}

function VocabFields({ content, set }: { content: Record<string, unknown>; set: (patch: Record<string, unknown>) => void }) {
  const words = (Array.isArray(content.words) ? content.words : []) as Record<string, unknown>[]
  const setWord = (i: number, patch: Record<string, unknown>) => {
    set({ words: words.map((w, j) => (j === i ? { ...w, ...patch } : w)) })
  }
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-gray-500">One word per line: word | definition | contrast | example sentence</p>
      {words.map((w, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-gray-100 bg-gray-50/60 p-2.5">
          {(Object.keys({ word: '', definition: '', contrast: '', sentence: '' }) as ('word' | 'definition' | 'contrast' | 'sentence')[]).map((field) => (
            <input
              key={field}
              value={String(w[field] ?? '')}
              onChange={(e) => setWord(i, { [field]: e.target.value })}
              placeholder={field}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm min-h-[44px]"
            />
          ))}
          <button
            onClick={() => set({ words: words.filter((_, j) => j !== i) })}
            className="col-span-2 text-xs font-bold text-red-600 min-h-[36px] cursor-pointer text-left"
          >
            Remove word
          </button>
        </div>
      ))}
      <button
        onClick={() => set({ words: [...words, { word: '', definition: '', contrast: '', sentence: '' }] })}
        className="rounded-xl border-2 border-dashed border-gray-300 w-full py-2.5 text-xs font-extrabold text-gray-500 min-h-[44px] cursor-pointer"
      >
        + Add word
      </button>
    </div>
  )
}

function RawFields({ content, set, error }: { content: Record<string, unknown>; set: (patch: Record<string, unknown> | string) => void; error: string | null }) {
  const [text, setText] = useState(() => JSON.stringify(content, null, 2))
  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          try {
            set(JSON.parse(e.target.value) as Record<string, unknown>)
          } catch {
            // validated on save; live typing stays lenient
          }
        }}
        rows={6}
        spellCheck={false}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 font-mono text-xs resize-y"
      />
      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
    </div>
  )
}

const BLOCK_LABELS: Record<string, string> = {
  intro: 'Intro',
  text: 'Text',
  image_explainer: 'Image',
  audio_explainer: 'Audio',
  worked_example: 'Worked example',
  guided_question: 'Guided question',
  independent_question: 'Independent question',
  reflection: 'Reflection',
  vocabulary_card: 'Vocabulary',
  passage: 'Passage',
  diagram: 'Diagram',
  callout: 'Callout',
  recap: 'Recap',
  minimal_pair: 'Minimal pair',
  sentence_rebuild: 'Sentence rebuild',
}

export default function BlockEditor({
  lessonId,
  lessonStatus,
  moveTargets,
  initial,
}: {
  lessonId: string
  lessonStatus: string
  moveTargets: { id: string; title: string; status: string }[]
  initial: Block[]
}) {
  const [blocks, setBlocks] = useState<Block[]>(initial)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<Record<string, string>>({})
  const [newType, setNewType] = useState('text')
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [moveTo, setMoveTo] = useState('')
  const [moving, setMoving] = useState(false)

  const patch = (id: string, p: Record<string, unknown> | string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        if (typeof p === 'string') {
          try {
            return { ...b, content: JSON.parse(p) as Record<string, unknown> }
          } catch {
            return b
          }
        }
        return { ...b, content: { ...b.content, ...p } }
      }),
    )
  }

  const save = async (block: Block) => {
    setSavingId(block.id)
    setRowError((prev) => ({ ...prev, [block.id]: '' }))
    try {
      const res = await fetch('/api/admin/lesson-blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: block.id, block_type: block.block_type, content: block.content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setNotice('Saved.')
    } catch (err) {
      setRowError((prev) => ({ ...prev, [block.id]: err instanceof Error ? err.message : 'Save failed' }))
    } finally {
      setSavingId(null)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this block?')) return
    await fetch(`/api/admin/lesson-blocks?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...blocks]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    const [moved] = next.splice(index, 1)
    next.splice(j, 0, moved!)
    setBlocks(next)
    await fetch('/api/admin/lesson-blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lessonId, ordered_ids: next.map((b) => b.id) }),
    })
  }

  const add = async () => {
    setAdding(true)
    try {
      const res = await fetch('/api/admin/lesson-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lessonId, block_type: newType, content: {} }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Add failed')
      setBlocks((prev) => [...prev, { id: data.id, block_type: newType, content: {} }])
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Add failed')
    } finally {
      setAdding(false)
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

  const moveSelected = async () => {
    if (selected.size === 0 || !moveTo || moving) return
    const target = moveTargets.find((t) => t.id === moveTo)
    if (
      (lessonStatus === 'published' || target?.status === 'published') &&
      !window.confirm(
        `This changes a PUBLISHED lesson — learners see it immediately. Move ${selected.size} block(s)${
          target?.status === 'published' ? ` into "${target.title}"` : ''
        }${lessonStatus === 'published' ? ' out of this lesson' : ''}?`,
      )
    ) {
      return
    }
    setMoving(true)
    try {
      const res = await fetch('/api/admin/lesson-blocks/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), to_lesson_id: moveTo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Move failed')
      setBlocks((prev) => prev.filter((b) => !selected.has(b.id)))
      setSelected(new Set())
      setNotice(`Moved ${data.moved} block(s).`)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Move failed')
    } finally {
      setMoving(false)
    }
  }

  const deleteSelected = async () => {
    if (selected.size === 0 || moving) return
    if (!window.confirm(`Delete ${selected.size} block(s)? This cannot be undone.`)) return
    setMoving(true)
    try {
      const res = await fetch('/api/admin/lesson-blocks/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')
      setBlocks((prev) => prev.filter((b) => !selected.has(b.id)))
      setSelected(new Set())
      setNotice(`Deleted ${data.deleted} block(s).`)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setMoving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-gray-900">Blocks ({blocks.length})</h2>
        {notice && <p className="text-xs font-bold text-green-700">{notice}</p>}
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50/60 p-3">
          <span className="text-xs font-extrabold text-violet-800">{selected.size} selected</span>
          <select
            value={moveTo}
            onChange={(e) => setMoveTo(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 min-h-[44px]"
          >
            <option value="">Move to lesson…</option>
            {moveTargets.map((t) => (
              <option key={t.id} value={t.id}>{t.title}{t.status === 'published' ? ' (published)' : ''}</option>
            ))}
          </select>
          <button
            onClick={() => void moveSelected()}
            disabled={!moveTo || moving}
            className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            {moving ? 'Moving…' : 'Move'}
          </button>
          <button
            onClick={() => void deleteSelected()}
            disabled={moving}
            className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            Delete selected
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:bg-white min-h-[44px] cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {blocks.map((block, i) => (
        <div key={block.id} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.has(block.id)}
              onChange={() => toggleSelect(block.id)}
              aria-label="Select block"
              className="h-4 w-4 rounded border-gray-300 text-violet-600 cursor-pointer"
            />
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700 uppercase">
              {BLOCK_LABELS[block.block_type] ?? block.block_type}
            </span>
            <span className="text-[11px] font-bold text-gray-400">#{i + 1}</span>
            <div className="flex-1" />
            <button onClick={() => void move(i, -1)} disabled={i === 0} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-500 disabled:opacity-40 min-h-[36px] cursor-pointer">↑</button>
            <button onClick={() => void move(i, 1)} disabled={i === blocks.length - 1} className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-500 disabled:opacity-40 min-h-[36px] cursor-pointer">↓</button>
            <button onClick={() => void remove(block.id)} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 min-h-[36px] cursor-pointer">Delete</button>
          </div>

          {block.block_type === 'text' && (
            <TextFields content={block.content} set={(p) => patch(block.id, p)} />
          )}
          {block.block_type === 'callout' && (
            <CalloutFields content={block.content} set={(p) => patch(block.id, p)} />
          )}
          {block.block_type === 'worked_example' && (
            <WorkedFields content={block.content} set={(p) => patch(block.id, p)} />
          )}
          {block.block_type === 'guided_question' && (
            <GuidedFields content={block.content} set={(p) => patch(block.id, p)} />
          )}
          {block.block_type === 'vocabulary_card' && (
            <VocabFields content={block.content} set={(p) => patch(block.id, p)} />
          )}
          {!['text', 'callout', 'worked_example', 'guided_question', 'vocabulary_card'].includes(block.block_type) && (
            <RawFields content={block.content} set={(raw) => patch(block.id, raw)} error={rowError[block.id] ?? null} />
          )}

          <button
            onClick={() => void save(block)}
            disabled={savingId === block.id}
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[40px] cursor-pointer"
          >
            {savingId === block.id ? 'Saving...' : 'Save block'}
          </button>
          {rowError[block.id] && <p className="text-xs font-bold text-red-600">{rowError[block.id]}</p>}
        </div>
      ))}

      <div className="flex gap-2.5 rounded-2xl border border-gray-200 bg-white p-4">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold min-h-[44px]"
        >
          {Object.entries(BLOCK_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          onClick={() => void add()}
          disabled={adding}
          className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
        >
          {adding ? 'Adding...' : '+ Add block'}
        </button>
      </div>
    </div>
  )
}

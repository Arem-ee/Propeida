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
  initial,
}: {
  lessonId: string
  initial: Block[]
}) {
  const [blocks, setBlocks] = useState<Block[]>(initial)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<Record<string, string>>({})
  const [newType, setNewType] = useState('text')
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-gray-900">Blocks ({blocks.length})</h2>
        {notice && <p className="text-xs font-bold text-green-700">{notice}</p>}
      </div>

      {blocks.map((block, i) => (
        <div key={block.id} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
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

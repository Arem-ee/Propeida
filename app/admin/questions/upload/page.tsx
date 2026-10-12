'use client'

import { useState, useRef } from 'react'
import { Upload, ArrowLeft, Check, X, File, ClipboardPaste, Download } from 'lucide-react'
import Link from 'next/link'
import { parsePastedQuestions } from '@/lib/question-text'

interface PreviewRow {
  row: number
  file: string
  reason: string
}

interface PreviewResult {
  valid: number
  invalid: PreviewRow[]
  fileCount: number
}

const PASTE_EXAMPLE = `# subject: english | exam: unilorin-post-utme | difficulty: medium
Q: Complete the sentence: 'She ___ the piano every day for three years.'
A) practice
B) practicing
C) has practiced
D) will practice
Answer: C
Explanation: Duration since the past needs the perfect tense.
---
Q: AGGRAVATE — most nearly opposite in meaning:
A) Ameliorate
B) Scrape
C) Improve
D) Harden
Answer: A
Explanation: Aggravate worsens; ameliorate betters — the precise reversal.`

const CSV_TEMPLATE =
  'exam_slug,subject_slug,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty,cognitive_level,source\n' +
  'unilorin-post-utme,english,Complete the sentence: She ___ the piano every day for three years.,practice,practicing,has practiced,will practice,c,Duration since the past needs the perfect tense.,medium,apply,template\n'

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'propeida-questions-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function PastePreview({
  text,
  issues,
  loading,
  result,
  error,
  onImport,
}: {
  text: string
  issues: { block: number; reason: string }[]
  loading: boolean
  result: { inserted: number; errors: string[] } | null
  error: string | null
  onImport: () => void
}) {
  const { questions } = parsePastedQuestions(text)
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Check className="h-4 w-4 text-green-500" />
        <span className="font-semibold text-green-700">{questions.length} valid question(s)</span>
        {issues.length > 0 && (
          <>
            <X className="h-4 w-4 text-red-500 ml-2" />
            <span className="font-semibold text-red-700">{issues.length} problem block(s)</span>
          </>
        )}
      </div>

      {issues.length > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-4">
          <p className="text-xs font-bold text-red-600 uppercase mb-2">Fix these blocks</p>
          <ul className="space-y-1">
            {issues.map((item, i) => (
              <li key={i} className="text-sm text-red-700">
                [block {item.block}] {item.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {questions.length > 0 && (
        <button
          onClick={onImport}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer disabled:opacity-50"
        >
          <ClipboardPaste className="h-4 w-4" />
          {loading ? 'Importing...' : `Import ${questions.length} question(s)`}
        </button>
      )}

      {result && (
        <div className="rounded-xl bg-green-50 border border-green-100 p-4">
          <p className="text-sm font-semibold text-green-800">
            Successfully inserted {result.inserted} question(s)
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.errors.map((err, i) => (
                <li key={i} className="text-sm text-amber-700">{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}

export default function AdminUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'csv' | 'paste'>('csv')
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [pasteIssues, setPasteIssues] = useState<{ block: number; reason: string }[]>([])

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const fileList = Array.from(newFiles)
    setFiles(fileList)
    setResult(null)
    setError(null)
    previewFiles(fileList)
  }

  const previewFiles = async (fileList: File[]) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      for (const f of fileList) formData.append('files', f)

      const res = await fetch('/api/admin/questions/preview', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPreview(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      for (const f of files) formData.append('files', f)

      const res = await fetch('/api/admin/questions/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setPreview(null)
      setFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const importPaste = async () => {
    if (!pasteText.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/questions/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Import failed')
      setResult(data)
      if (data.inserted > 0) setPasteText('')
      setPasteIssues([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Link href="/admin/questions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Questions
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Bulk Import</h1>
      <p className="text-sm text-gray-500 mb-6">
        Two ways in: CSV files, or pasted text in a human format that survives Word and Google Docs.
      </p>

      <div className="mb-6 flex gap-2">
        {(['csv', 'paste'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); setResult(null) }}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold min-h-[44px] cursor-pointer transition-colors ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {t === 'csv' ? 'CSV files' : 'Paste text'}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 min-h-[44px] cursor-pointer"
        >
          <Download className="h-4 w-4" />
          CSV template
        </button>
      </div>

      {tab === 'paste' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500 mb-3">
            One <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold"># header</code> sets
            subject, exam, and difficulty — then blocks separated by <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold">---</code>.
            Preview updates as you type; the server re-validates on import.
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => {
              const text = e.target.value
              setPasteText(text)
              setResult(null)
              setError(null)
              if (!text.trim()) {
                setPasteIssues([])
                return
              }
              setPasteIssues(parsePastedQuestions(text).issues)
            }}
            rows={14}
            placeholder={PASTE_EXAMPLE}
            spellCheck={false}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-[13px] leading-relaxed resize-y min-h-[280px] focus:border-blue-600 focus:outline-none"
          />

          {pasteText.trim() && (
            <PastePreview
              text={pasteText}
              issues={pasteIssues}
              loading={loading}
              result={result}
              error={error}
              onImport={importPaste}
            />
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      ) : (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleFiles(e.dataTransfer.files)
          }}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-4" />
          <p className="text-sm font-semibold text-gray-700 mb-1">Drop one or more CSV files here, or click to browse</p>
          <p className="text-xs text-gray-400 mb-4">CSV files only</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
          >
            Select Files
          </button>
        </div>

        {files.length > 0 && !preview && !loading && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <File className="h-4 w-4" />
            {files.length} file(s) selected: {files.map((f) => f.name).join(', ')}
          </div>
        )}

        {loading && (
          <div className="mt-6 flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        )}

        {preview && !loading && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-green-700">{preview.valid} valid rows across {preview.fileCount} file(s)</span>
              {preview.invalid.length > 0 && (
                <>
                  <X className="h-4 w-4 text-red-500 ml-2" />
                  <span className="font-semibold text-red-700">{preview.invalid.length} invalid rows</span>
                </>
              )}
            </div>

            {preview.invalid.length > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                <p className="text-xs font-bold text-red-600 uppercase mb-2">Invalid rows</p>
                <ul className="space-y-1">
                  {preview.invalid.map((item, i) => (
                    <li key={i} className="text-sm text-red-700">
                      [{item.file}:{item.row}] {item.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleUpload}
              className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 min-h-[44px] cursor-pointer"
            >
              Insert {preview.valid} valid question(s)
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-xl bg-green-50 border border-green-100 p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <p className="text-sm font-semibold text-green-800">
                Successfully inserted {result.inserted} question(s)
              </p>
            </div>
            {result.errors.length > 0 && (
              <ul className="mt-2 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-sm text-amber-700">{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-100 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
      )}
    </div>
  )
}

'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type ImportType = 'careers' | 'courses' | 'universities' | 'career_courses' | 'course_universities'

interface ImportReport {
  total: number
  imported: number
  skipped: number
  errors: { row: number; reason: string }[]
}

const TYPE_OPTIONS: { value: ImportType; label: string; hint: string }[] = [
  { value: 'careers', label: 'Careers', hint: 'name, slug, category, short_description, description, what_you_do (one per ;), work_environments, industries, common_job_titles, skills, misconceptions, career_progression, related_careers, published' },
  { value: 'courses', label: 'Courses', hint: 'name, slug, description, published' },
  { value: 'universities', label: 'Universities', hint: 'name, slug, location, type, description, website, published' },
  { value: 'career_courses', label: 'Career ↔ Course links', hint: 'career_slug, course_slug' },
  { value: 'course_universities', label: 'Course ↔ University links', hint: 'course_slug, university_slug' },
]

const COLUMN_HINTS: Record<ImportType, string> = {
  careers: 'name* | slug | category | short_description | description | what_you_do | work_environments | industries | common_job_titles | skills | misconceptions | career_progression | related_careers | published',
  courses: 'name* | slug | description | published',
  universities: 'name* | slug | location | type | description | website | published',
  career_courses: 'career_slug* | course_slug*',
  course_universities: 'course_slug* | university_slug*',
}

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [type, setType] = useState<ImportType>('careers')
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [report, setReport] = useState<ImportReport | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFile = (file: File | undefined) => {
    if (!file) return
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data)
        setFileName(file.name)
        setReport(null)
        setError(null)
      },
      error: () => {
        setError('Could not read that CSV file. Check the format and try again.')
        setRows(null)
        setFileName('')
        setReport(null)
      },
    })
  }

  const run = async (dryRun: boolean) => {
    if (!rows || rows.length === 0) return
    setBusy(true)
    setError(null)
    setReport(null)
    try {
      const res = await fetch('/api/admin/explore/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, rows, dryRun }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Import failed')
      setReport(data.report as ImportReport)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  const preview = (rows ?? []).slice(0, 5)

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-extrabold text-gray-900">Import Explore Content</h1>
      <p className="mt-1 text-sm text-gray-500">
        Bulk-add careers, courses, universities or link them together from a CSV file. Rows are
        upserted by slug, so re-importing updates existing entries.
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            What are you importing?
          </label>
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as ImportType)
              setRows(null)
              setFileName('')
              setReport(null)
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm min-h-[44px]"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 rounded-xl bg-gray-50 px-4 py-3 font-mono text-xs text-gray-500">
            Columns: {COLUMN_HINTS[type]}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            List fields (e.g. what_you_do) accept multiple items separated by ; or , — one per line
            also works. published accepts true/false/yes/no. * = required.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            CSV file
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => onFile(event.target.files?.[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white file:hover:bg-blue-700 file:cursor-pointer min-h-[44px]"
          />
          {fileName && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              {fileName} · {(rows ?? []).length} rows
            </p>
          )}
        </div>

        {rows && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(rows[0] ?? {}).slice(0, 6).map((key) => (
                    <th key={key} className="px-4 py-2 text-left text-xs font-bold uppercase text-gray-500">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).slice(0, 6).map((value, j) => (
                      <td key={j} className="max-w-[160px] truncate px-4 py-2 text-xs text-gray-600">
                        {String(value ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {(rows ?? []).length > 5 && (
              <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
                Showing first 5 of {(rows ?? []).length} rows
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {report && (
          <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {report.imported} imported
              </span>
              {report.skipped > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600">
                  <XCircle className="h-4 w-4" />
                  {report.skipped} skipped
                </span>
              )}
            </div>
            {report.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg bg-red-50 p-3">
                {report.errors.map((entry, i) => (
                  <p key={i} className="text-xs text-red-700">
                    Row {entry.row}: {entry.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => run(true)}
            disabled={busy || !rows || rows.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Validate
          </button>
          <button
            onClick={() => run(false)}
            disabled={busy || !rows || rows.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import {rows && rows.length > 0 ? `${rows.length} rows` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
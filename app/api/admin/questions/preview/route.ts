import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import Papa from 'papaparse'
import { createClient } from '@supabase/supabase-js'

async function getLookups() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const [examsRes, subjectsRes] = await Promise.all([
    supabase.from('exams').select('id, slug'),
    supabase.from('subjects').select('id, slug'),
  ])
  return {
    examMap: new Map((examsRes.data ?? []).map((e) => [e.slug, e.id])),
    subjectMap: new Map((subjectsRes.data ?? []).map((s) => [s.slug, s.id])),
  }
}

function validateFile(
  text: string,
  filename: string,
  examMap: Map<string, string>,
  subjectMap: Map<string, string>
): { validRows: number; invalidRows: { row: number; file: string; reason: string }[] } {
  const invalidRows: { row: number; file: string; reason: string }[] = []
  let validRows = 0

  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    const first = parsed.errors[0]!
    return {
      validRows: 0,
      invalidRows: [{ row: first.row ?? 0, file: filename, reason: `CSV parse error: ${first.message}` }],
    }
  }

  if (parsed.data.length === 0) {
    return { validRows: 0, invalidRows: [{ row: 0, file: filename, reason: 'CSV has no data rows' }] }
  }

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i]!
    const examSlug = (row.exam_slug ?? '').trim()
    const subjectSlug = (row.subject_slug ?? '').trim()
    const correctAnswer = (row.correct_answer ?? '').trim().toLowerCase()
    const diff = (row.difficulty ?? '').trim().toLowerCase()
    const errors: string[] = []

    if (examSlug === 'post-utme') errors.push('"post-utme" has been renamed — use "unilorin-post-utme" (or your institution-specific slug)')
    else if (!examSlug || !examMap.has(examSlug)) errors.push('unknown exam_slug')
    if (!subjectSlug || !subjectMap.has(subjectSlug)) errors.push('unknown subject_slug')
    if (!row.question_text?.trim()) errors.push('empty question_text')
    if (!row.option_a?.trim() || !row.option_b?.trim() || !row.option_c?.trim() || !row.option_d?.trim()) errors.push('missing options')
    if (!['a', 'b', 'c', 'd'].includes(correctAnswer)) errors.push('correct_answer must be a/b/c/d')
    if (!['easy', 'medium', 'hard'].includes(diff)) errors.push('difficulty must be easy/medium/hard')
    if (!row.explanation?.trim()) errors.push('explanation is required')

    if (errors.length > 0) {
      invalidRows.push({ row: i + 2, file: filename, reason: errors.join('; ') })
    } else {
      validRows++
    }
  }

  return { validRows, invalidRows }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const { examMap, subjectMap } = await getLookups()
    let totalValid = 0
    const allInvalid: { row: number; file: string; reason: string }[] = []

    for (const file of files) {
      const text = await file.text()
      const result = validateFile(text, file.name, examMap, subjectMap)
      totalValid += result.validRows
      allInvalid.push(...result.invalidRows)
    }

    return NextResponse.json({ valid: totalValid, invalid: allInvalid, fileCount: files.length })
  } catch {
    return NextResponse.json({ error: 'Preview failed' }, { status: 500 })
  }
}

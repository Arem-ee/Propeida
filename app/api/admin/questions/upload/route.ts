import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'

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

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = createAdminClient()

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const { examMap, subjectMap } = await getLookups()
    const allInsertErrors: string[] = []
    let totalInserted = 0

    for (const file of files) {
      const text = await file.text()

      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      })

      if (parsed.errors.length > 0) {
        allInsertErrors.push(`[${file.name}] Parse error: ${parsed.errors[0]!.message}`)
        continue
      }

      const inserts: Record<string, unknown>[] = []
      let fileErrorCount = 0

      for (let i = 0; i < parsed.data.length; i++) {
        const row = parsed.data[i]!
        const examSlug = (row.exam_slug ?? '').trim()
        const subjectSlug = (row.subject_slug ?? '').trim()
        const correctAnswer = (row.correct_answer ?? '').trim().toLowerCase()
        const diff = (row.difficulty ?? '').trim().toLowerCase()

        if (examSlug === 'post-utme') {
          allInsertErrors.push(`[${file.name}:${i + 2}] "post-utme" has been renamed — use "unilorin-post-utme"`)
          fileErrorCount++
          continue
        }
        if (!examSlug || !examMap.has(examSlug)) {
          allInsertErrors.push(`[${file.name}:${i + 2}] invalid exam_slug "${examSlug}"`)
          fileErrorCount++
          continue
        }
        if (!subjectSlug || !subjectMap.has(subjectSlug)) {
          allInsertErrors.push(`[${file.name}:${i + 2}] invalid subject_slug "${subjectSlug}"`)
          fileErrorCount++
          continue
        }
        if (!['a', 'b', 'c', 'd'].includes(correctAnswer)) {
          allInsertErrors.push(`[${file.name}:${i + 2}] correct_answer must be a/b/c/d`)
          fileErrorCount++
          continue
        }
        if (!['easy', 'medium', 'hard'].includes(diff)) {
          allInsertErrors.push(`[${file.name}:${i + 2}] difficulty must be easy/medium/hard`)
          fileErrorCount++
          continue
        }
        if (!row.explanation?.trim()) {
          allInsertErrors.push(`[${file.name}:${i + 2}] explanation is required`)
          fileErrorCount++
          continue
        }

        inserts.push({
          exam_id: examMap.get(examSlug),
          subject_id: subjectMap.get(subjectSlug),
          question_text: row.question_text?.trim() ?? '',
          options: [
            { key: 'a', text: row.option_a?.trim() ?? '' },
            { key: 'b', text: row.option_b?.trim() ?? '' },
            { key: 'c', text: row.option_c?.trim() ?? '' },
            { key: 'd', text: row.option_d?.trim() ?? '' },
          ],
          correct_answer: correctAnswer,
          explanation: row.explanation.trim(),
          difficulty: diff,
          source: row.source?.trim() || 'csv_upload',
        })
      }

      if (inserts.length > 0) {
        const { error } = await supabase.from('questions').insert(inserts)
        if (error) {
          allInsertErrors.push(`[${file.name}] DB insert error: ${error.message}`)
        } else {
          totalInserted += inserts.length
        }
      }

      if (fileErrorCount > 0) {
        allInsertErrors.push(`[${file.name}] ${fileErrorCount} row(s) skipped due to validation errors`)
      }
    }

    return NextResponse.json({ inserted: totalInserted, errors: allInsertErrors })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unauthorized' }, { status: 401 })
  }
}

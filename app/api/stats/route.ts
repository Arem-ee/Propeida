import { createClient } from '@/lib/supabase/server'
import { siteConfig } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_platform_stats')

  if (error || !data) {
    return Response.json(null)
  }

  const stats = Array.isArray(data) ? data[0] : data

  return Response.json({
    questionsAnswered: Number(stats?.questions_answered ?? 0),
    practiceSessions: Number(stats?.practice_sessions ?? 0),
    mockSessions: Number(stats?.mock_sessions ?? 0),
    activeStudents30d: Number(stats?.active_students_30d ?? 0),
    studentsTotal: Number(stats?.students_total ?? 0),
    baselineQuestions: siteConfig.trustMetrics.verifiedQuestions,
    baselineStudents: siteConfig.trustMetrics.activeStudents,
  })
}
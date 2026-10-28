// Phase 1 privilege regression: admin escalation and answer-key exfiltration.
//
// Run after applying 20261027000001_phase1_lock_critical_grants.sql:
//   node --env-file=.env scripts/verify-phase1-security.mjs
//
// Uses a disposable auth user. Verifies that client roles keep SELECT but lose
// every write path on profiles/exam_sessions/session_answers, that the
// authorization columns are not updatable, and that service-role writes and
// the record_session_answer security-definer RPC still work.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SERVICE || !ANON) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

let passed = 0
let failed = 0
const pass = (name, cond, extra = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}${extra ? ` (${extra})` : ''}`) }
  else { failed++; console.log(`  FAIL  ${name}${extra ? ` (${extra})` : ''}`) }
}

// PostgREST reports a missing table/column privilege as SQLSTATE 42501.
const permissionDenied = (error) =>
  Boolean(error) && (
    error.code === '42501' ||
    /permission denied/i.test(error.message ?? '')
  )

const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } })

const EMAIL = `phase1-test-${Date.now()}@propeida.test`
const PASSWORD = `Phase1-${Math.random().toString(36).slice(2, 10)}!a1`

console.log('=== PHASE 1: CLIENT WRITE PATHS ===')
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
})
pass('service role created a disposable user', !createErr, EMAIL)
if (createErr) process.exit(1)

const userId = created.user.id
let session = null
let answerId = null

try {
  const user = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } })
  const { error: signInErr } = await user.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  pass('disposable user signed in with the anon key', !signInErr)

  // ---- profiles -------------------------------------------------------
  const { data: profile, error: readErr } = await user
    .from('profiles')
    .select('is_admin, ai_features_enabled, referral_code, referred_by, full_name')
    .eq('id', userId)
    .single()
  pass('client can still read its own profile', !readErr && Boolean(profile))

  const marker = `Phase1 ${Date.now()}`
  const { error: safeErr } = await user
    .from('profiles')
    .update({ full_name: marker, onboarding_completed: true })
    .eq('id', userId)
  pass('client can update app-editable profile columns', !safeErr, safeErr?.message)

  const { data: afterSafe } = await admin
    .from('profiles')
    .select('full_name, onboarding_completed')
    .eq('id', userId)
    .single()
  pass('app-editable profile write persisted', afterSafe?.full_name === marker && afterSafe?.onboarding_completed === true)

  for (const [column, value] of [
    ['is_admin', true],
    ['ai_features_enabled', true],
    ['referral_code', `HACK${Date.now()}`],
    ['referred_by', userId],
  ]) {
    const { error } = await user.from('profiles').update({ [column]: value }).eq('id', userId)
    pass(`client cannot update profiles.${column}`, permissionDenied(error), error?.message)
  }

  const { data: guarded } = await admin
    .from('profiles')
    .select('is_admin, ai_features_enabled, referral_code, referred_by')
    .eq('id', userId)
    .single()
  pass(
    'authorization columns unchanged after client attempts',
    guarded?.is_admin === false &&
      guarded?.ai_features_enabled === false &&
      guarded?.referral_code === profile?.referral_code &&
      guarded?.referred_by === null,
  )

  // ---- pick a gradeable question -------------------------------------
  const { data: keyRow } = await admin.from('question_answers').select('question_id').limit(1).maybeSingle()
  const { data: question } = keyRow
    ? await admin.from('questions').select('id, exam_id').eq('id', keyRow.question_id).maybeSingle()
    : { data: null }

  // ---- exam_sessions --------------------------------------------------
  if (question) {
    const { data: rogue, error: rogueErr } = await user
      .from('exam_sessions')
      .insert({ user_id: userId, exam_id: question.exam_id, mode: 'practice' })
      .select('id')
      .single()
    pass('client cannot insert exam_sessions', permissionDenied(rogueErr), rogueErr?.message)
    if (rogue) await admin.from('exam_sessions').delete().eq('id', rogue.id)

    const { data: seeded, error: seedErr } = await admin
      .from('exam_sessions')
      .insert({ user_id: userId, exam_id: question.exam_id, mode: 'practice', status: 'in_progress' })
      .select('id')
      .single()
    pass('service role can seed an exam session', !seedErr, seedErr?.message)
    session = seeded

    if (session) {
      const { data: visible } = await user
        .from('exam_sessions')
        .select('id')
        .eq('id', session.id)
        .maybeSingle()
      pass('client can still read its own session', visible?.id === session.id)

      const { error: sessionUpdErr } = await user
        .from('exam_sessions')
        .update({ mode: 'mock', status: 'completed' })
        .eq('id', session.id)
      pass('client cannot update its own exam_sessions', permissionDenied(sessionUpdErr), sessionUpdErr?.message)

      const { error: sessionDelErr } = await user
        .from('exam_sessions')
        .delete()
        .eq('id', session.id)
      pass('client cannot delete its own exam_sessions', permissionDenied(sessionDelErr), sessionDelErr?.message)

      const { data: unchanged } = await admin
        .from('exam_sessions')
        .select('mode, status')
        .eq('id', session.id)
        .single()
      pass('session unchanged after client write attempts', unchanged?.mode === 'practice' && unchanged?.status === 'in_progress')

      // ---- session_answers --------------------------------------------
      const { data: rogueAnswer, error: answerInsErr } = await user
        .from('session_answers')
        .insert({ session_id: session.id, question_id: question.id })
        .select('id')
        .single()
      pass('client cannot insert session_answers', permissionDenied(answerInsErr), answerInsErr?.message)
      if (rogueAnswer) await admin.from('session_answers').delete().eq('id', rogueAnswer.id)

      const { data: seededAnswer, error: answerSeedErr } = await admin
        .from('session_answers')
        .insert({ session_id: session.id, question_id: question.id })
        .select('id')
        .single()
      pass('service role can seed a session answer', !answerSeedErr, answerSeedErr?.message)
      answerId = seededAnswer?.id ?? null
    }

    if (session && answerId) {
      const { error: answerUpdErr } = await user
        .from('session_answers')
        .update({ selected_answer: 'a' })
        .eq('id', answerId)
      pass('client cannot update session_answers', permissionDenied(answerUpdErr), answerUpdErr?.message)

      const { error: answerDelErr } = await user
        .from('session_answers')
        .delete()
        .eq('id', answerId)
      pass('client cannot delete session_answers', permissionDenied(answerDelErr), answerDelErr?.message)

      // The RPC is security definer; it must keep recording. Since phase 2 it
      // returns nothing, so the grade is checked through the service role.
      const { data: graded, error: rpcErr } = await user.rpc('record_session_answer', {
        p_session_id: session.id,
        p_question_id: question.id,
        p_selected_answer: 'a',
      })
      pass('record_session_answer writes through security definer', !rpcErr && graded == null, rpcErr?.message)

      const { data: gradedRow } = await admin
        .from('session_answers')
        .select('selected_answer, is_correct')
        .eq('id', answerId)
        .single()
      pass('graded answer persisted', gradedRow?.selected_answer === 'a' && typeof gradedRow?.is_correct === 'boolean')
    }
  } else {
    console.log('  SKIP  session/answer checks (no question_answers row available)')
  }

  // ---- service role path ----------------------------------------------
  const { error: promoteErr } = await admin
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', userId)
  pass('service role can still manage profiles.is_admin', !promoteErr, promoteErr?.message)
  const { data: promoted } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  pass('service-role is_admin write persisted', promoted?.is_admin === true)
  await admin.from('profiles').update({ is_admin: false }).eq('id', userId)
} catch (e) {
  failed++
  console.log('  FAIL  test flow crashed:', e.message)
} finally {
  if (answerId) await admin.from('session_answers').delete().eq('id', answerId)
  if (session) await admin.from('exam_sessions').delete().eq('id', session.id)
  const { error: delErr } = await admin.auth.admin.deleteUser(userId)
  pass('disposable user cleaned up', !delErr)
}

console.log('')
console.log(`RESULT: ${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)

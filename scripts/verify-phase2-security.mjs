// Phase 2 privilege regression: mock answer oracle and free-pool writes.
//
// Run after applying 20261027000002_phase2_close_answer_oracle_and_pool_writes.sql:
//   node --env-file=.env scripts/verify-phase2-security.mjs
//
// Uses a disposable auth user. Verifies that record_session_answer returns no
// grade in any mode, that the grading columns are service-role only, that the
// practice reveal still works, and that free-pool rows cannot be read or
// written directly by a client.

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

// PostgREST reports a missing table/column privilege as SQLSTATE 42501. RLS
// denials also surface as 42501, so the message check covers both forms.
const denied = (error) =>
  Boolean(error) && (
    error.code === '42501' ||
    /permission denied|row-level security/i.test(error.message ?? '')
  )

const sameSet = (a, b) => {
  const left = [...a].sort()
  const right = [...b].sort()
  return left.length === right.length && left.every((value, i) => value === right[i])
}

const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } })

const EMAIL = `phase2-test-${Date.now()}@propeida.test`
const PASSWORD = `Phase2-${Math.random().toString(36).slice(2, 10)}!a1`

console.log('=== PHASE 2: ANSWER ORACLE AND FREE POOLS ===')
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
let practiceSession = null
let practiceAnswerId = null

try {
  const user = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } })
  const { error: signInErr } = await user.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  pass('disposable user signed in with the anon key', !signInErr)

  // ---- pick a gradeable question --------------------------------------
  const { data: keyRow } = await admin
    .from('question_answers')
    .select('question_id, correct_answer')
    .limit(1)
    .maybeSingle()
  const { data: question } = keyRow
    ? await admin.from('questions').select('id, exam_id').eq('id', keyRow.question_id).maybeSingle()
    : { data: null }

  if (!keyRow || !question) {
    console.log('  SKIP  answer-oracle checks (no question_answers row available)')
  } else {
    const correct = keyRow.correct_answer
    const wrong = ['a', 'b', 'c', 'd', 'e'].find((key) => key !== correct)

    // ---- seed a mock session and its answer row ----------------------
    const { data: seededSession, error: seedSessionErr } = await admin
      .from('exam_sessions')
      .insert({ user_id: userId, exam_id: question.exam_id, mode: 'mock', status: 'in_progress' })
      .select('id')
      .single()
    pass('service role seeded a mock session', !seedSessionErr, seedSessionErr?.message)
    session = seededSession

    if (session) {
      const { data: seededAnswer, error: seedAnswerErr } = await admin
        .from('session_answers')
        .insert({ session_id: session.id, question_id: question.id })
        .select('id')
        .single()
      pass('service role seeded a session answer', !seedAnswerErr, seedAnswerErr?.message)
      answerId = seededAnswer?.id ?? null
    }

    if (session && answerId) {
      // ---- grading columns are closed --------------------------------
      const { error: correctReadErr } = await user
        .from('session_answers')
        .select('is_correct')
        .eq('id', answerId)
      pass('client cannot select session_answers.is_correct', denied(correctReadErr), correctReadErr?.message)

      const { error: codeReadErr } = await user
        .from('session_answers')
        .select('misconception_code')
        .eq('id', answerId)
      pass('client cannot select session_answers.misconception_code', denied(codeReadErr), codeReadErr?.message)

      const { data: safeRow, error: safeReadErr } = await user
        .from('session_answers')
        .select('id, session_id, question_id, selected_answer, time_taken_seconds')
        .eq('id', answerId)
        .maybeSingle()
      pass('client can still read the player columns', !safeReadErr && safeRow?.id === answerId, safeReadErr?.message)

      // ---- the RPC no longer returns a grade -------------------------
      const { data: wrongGrade, error: wrongErr } = await user.rpc('record_session_answer', {
        p_session_id: session.id,
        p_question_id: question.id,
        p_selected_answer: wrong,
      })
      pass('mock record returns no grade (wrong option)', !wrongErr && wrongGrade == null, wrongErr?.message)

      const { data: wrongRow } = await admin
        .from('session_answers')
        .select('selected_answer, is_correct')
        .eq('id', answerId)
        .single()
      pass(
        'wrong mock answer is still graded server-side',
        wrongRow?.selected_answer === wrong && wrongRow?.is_correct === false,
      )

      const { data: correctGrade, error: correctErr } = await user.rpc('record_session_answer', {
        p_session_id: session.id,
        p_question_id: question.id,
        p_selected_answer: correct,
      })
      pass('mock record returns no grade (correct option)', !correctErr && correctGrade == null, correctErr?.message)

      const { data: correctRow } = await admin
        .from('session_answers')
        .select('selected_answer, is_correct')
        .eq('id', answerId)
        .single()
      pass(
        'correct mock answer is still graded server-side',
        correctRow?.selected_answer === correct && correctRow?.is_correct === true,
      )

      // ---- reveal and review stay gated ------------------------------
      const { data: mockReveal } = await user.rpc('get_session_answer_reveal', {
        p_session_id: session.id,
        p_question_id: question.id,
      })
      pass('in-progress mock reveal returns no key', Array.isArray(mockReveal) && mockReveal.length === 0)

      const { data: mockReview } = await user.rpc('get_session_review', {
        p_session_id: session.id,
      })
      pass('in-progress mock review returns no rows', Array.isArray(mockReview) && mockReview.length === 0)

      await admin
        .from('exam_sessions')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', session.id)

      const { data: completedReveal } = await user.rpc('get_session_answer_reveal', {
        p_session_id: session.id,
        p_question_id: question.id,
      })
      const revealRow = Array.isArray(completedReveal) ? completedReveal[0] : null
      pass('completed session reveal returns the key', revealRow?.correct_answer === correct)

      // Practice still gets immediate feedback: the reveal is gated on
      // mode = 'practice' and a recorded selected_answer, not on completion.
      const { data: seededPractice } = await admin
        .from('exam_sessions')
        .insert({ user_id: userId, exam_id: question.exam_id, mode: 'practice', status: 'in_progress' })
        .select('id')
        .single()
      practiceSession = seededPractice
      if (practiceSession) {
        const { data: seededPracticeAnswer } = await admin
          .from('session_answers')
          .insert({ session_id: practiceSession.id, question_id: question.id })
          .select('id')
          .single()
        practiceAnswerId = seededPracticeAnswer?.id ?? null
      }

      if (practiceSession && practiceAnswerId) {
        const { error: practiceRecordErr } = await user.rpc('record_session_answer', {
          p_session_id: practiceSession.id,
          p_question_id: question.id,
          p_selected_answer: correct,
        })
        pass('practice record succeeds with no grade returned', !practiceRecordErr, practiceRecordErr?.message)

        const { data: practiceReveal } = await user.rpc('get_session_answer_reveal', {
          p_session_id: practiceSession.id,
          p_question_id: question.id,
        })
        const practiceRow = Array.isArray(practiceReveal) ? practiceReveal[0] : null
        pass('practice reveal returns the key after recording', practiceRow?.correct_answer === correct)
      }
    }
  }

  // ---- free pools -----------------------------------------------------
  const { data: poolIds, error: poolErr } = await user.rpc('ensure_free_question_pool', {
    p_user_id: userId,
  })
  pass('client can build its free pool through the RPC', !poolErr && Array.isArray(poolIds) && poolIds.length === 50, poolErr?.message)

  const { data: poolIdsAgain, error: poolAgainErr } = await user.rpc('ensure_free_question_pool', {
    p_user_id: userId,
  })
  pass(
    'free pool is stable across calls',
    !poolAgainErr && Array.isArray(poolIds) && Array.isArray(poolIdsAgain) && sameSet(poolIds, poolIdsAgain),
  )

  const { data: adminPool } = await admin
    .from('user_free_questions')
    .select('question_id')
    .eq('user_id', userId)
  pass('service role reads the assigned pool', adminPool?.length === 50)

  const { error: poolReadErr } = await user
    .from('user_free_questions')
    .select('question_id')
    .eq('user_id', userId)
  pass('client cannot select user_free_questions directly', denied(poolReadErr), poolReadErr?.message)

  const { error: poolInsErr } = await user
    .from('user_free_questions')
    .insert({ user_id: userId, question_id: poolIds?.[0] })
  pass('client cannot insert user_free_questions', denied(poolInsErr), poolInsErr?.message)

  const { error: poolUpdErr } = await user
    .from('user_free_questions')
    .update({ assigned_at: new Date().toISOString() })
    .eq('user_id', userId)
  pass('client cannot update user_free_questions', denied(poolUpdErr), poolUpdErr?.message)

  const { error: poolDelErr } = await user
    .from('user_free_questions')
    .delete()
    .eq('user_id', userId)
  pass('client cannot delete user_free_questions', denied(poolDelErr), poolDelErr?.message)

  const { error: otherPoolErr } = await user.rpc('ensure_free_question_pool', {
    p_user_id: '00000000-0000-4000-8000-000000000000',
  })
  pass('pool RPC rejects another user id', Boolean(otherPoolErr) && /User ID mismatch/i.test(otherPoolErr.message), otherPoolErr?.message)

  const anon = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } })
  const { error: anonPoolErr } = await anon.rpc('ensure_free_question_pool', {
    p_user_id: userId,
  })
  pass('anon cannot execute the pool RPC', denied(anonPoolErr), anonPoolErr?.message)

  // ---- exam pools keep their read path, lose the write path ----------
  const { error: examPoolInsErr } = await user
    .from('user_exam_free_pools')
    .insert({ user_id: userId, exam_id: question?.exam_id, question_id: question?.id })
  pass('client cannot insert user_exam_free_pools', denied(examPoolInsErr), examPoolInsErr?.message)

  const { error: examPoolDelErr } = await user
    .from('user_exam_free_pools')
    .delete()
    .eq('user_id', userId)
  pass('client cannot delete user_exam_free_pools', denied(examPoolDelErr), examPoolDelErr?.message)
} catch (e) {
  failed++
  console.log('  FAIL  test flow crashed:', e.message)
} finally {
  await admin.from('user_free_questions').delete().eq('user_id', userId)
  if (answerId) await admin.from('session_answers').delete().eq('id', answerId)
  if (practiceAnswerId) await admin.from('session_answers').delete().eq('id', practiceAnswerId)
  if (practiceSession) await admin.from('exam_sessions').delete().eq('id', practiceSession.id)
  if (session) await admin.from('exam_sessions').delete().eq('id', session.id)
  const { error: delErr } = await admin.auth.admin.deleteUser(userId)
  pass('disposable user cleaned up', !delErr)
}

console.log('')
console.log(`RESULT: ${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)

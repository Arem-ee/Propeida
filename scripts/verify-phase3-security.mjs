// Phase 3 privilege regression: privacy leaks and client-writable learning state.
//
// Run after applying 20261027000003_phase3_learning_state_and_privacy.sql:
//   node --env-file=.env scripts/verify-phase3-security.mjs
//
// Uses two disposable auth users. Verifies that push subscriptions are
// own-row only, misconception maps are server-only, learning state is
// read-only for clients, dead write grants are gone, and the self-service
// exam-access feature still works.

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

const denied = (error) =>
  Boolean(error) && (
    error.code === '42501' ||
    /permission denied|row-level security/i.test(error.message ?? '')
  )

const admin = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } })

const STAMP = Date.now()
const EMAIL = `phase3-test-${STAMP}@propeida.test`
const OTHER_EMAIL = `phase3-test-other-${STAMP}@propeida.test`
const PASSWORD = `Phase3-${Math.random().toString(36).slice(2, 10)}!a1`

console.log('=== PHASE 3: PRIVACY AND LEARNING STATE ===')
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
})
pass('service role created a disposable user', !createErr, EMAIL)
if (createErr) process.exit(1)

const { data: otherCreated, error: otherCreateErr } = await admin.auth.admin.createUser({
  email: OTHER_EMAIL,
  password: PASSWORD,
  email_confirm: true,
})
pass('service role created a second disposable user', !otherCreateErr, OTHER_EMAIL)

const userId = created.user.id
const otherUserId = otherCreated?.user?.id ?? null
let schoolExam = null
let nationalExam = null
let question = null
let attemptId = null
let reviewId = null
let accessId = null

try {
  const user = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } })
  const { error: signInErr } = await user.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  pass('disposable user signed in with the anon key', !signInErr)

  const [{ data: subject }, { data: school }, { data: national }, { data: q }] = await Promise.all([
    admin.from('subjects').select('id').limit(1).maybeSingle(),
    admin.from('exams').select('id').not('school_id', 'is', null).limit(1).maybeSingle(),
    admin.from('exams').select('id').is('school_id', null).limit(1).maybeSingle(),
    admin.from('questions').select('id').limit(1).maybeSingle(),
  ])
  schoolExam = school
  nationalExam = national
  question = q

  // ---- #6 push subscriptions are own-row only -------------------------
  const ownEndpoint = `https://push.example.test/${STAMP}/own`
  const otherEndpoint = `https://push.example.test/${STAMP}/other`

  const { error: ownSubErr } = await user.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: ownEndpoint,
    p256dh: 'test-p256dh',
    auth: 'test-auth',
  }, { onConflict: 'user_id,endpoint' })
  pass('client can save its own push subscription', !ownSubErr, ownSubErr?.message)

  if (otherUserId) {
    const { error: otherSubErr } = await admin.from('push_subscriptions').insert({
      user_id: otherUserId,
      endpoint: otherEndpoint,
      p256dh: 'other-p256dh',
      auth: 'other-auth',
    })
    pass('service role seeded a second user subscription', !otherSubErr, otherSubErr?.message)
  }

  if (otherUserId) {
    const { data: visible, error: readErr } = await user
      .from('push_subscriptions')
      .select('user_id, endpoint')
    const onlyOwn = (visible ?? []).every((row) => row.user_id === userId)
    pass('client cannot read another user push subscription', !readErr && onlyOwn && (visible ?? []).length === 1, readErr?.message)

    const { data: leaked } = await user
      .from('push_subscriptions')
      .select('endpoint')
      .eq('endpoint', otherEndpoint)
    pass('cross-user subscription lookup returns nothing', (leaked ?? []).length === 0)
  }

  const { error: ownSubDelErr } = await user
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', ownEndpoint)
  pass('client can remove its own push subscription', !ownSubDelErr, ownSubDelErr?.message)

  const anon = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } })
  const { error: anonSubReadErr } = await anon.from('push_subscriptions').select('endpoint').limit(1)
  pass('anon cannot read push subscriptions', denied(anonSubReadErr), anonSubReadErr?.message)

  // ---- #7 misconception maps are server-only --------------------------
  const { error: mcReadErr } = await user.from('question_misconceptions').select('question_id').limit(1)
  pass('client cannot read question_misconceptions', denied(mcReadErr), mcReadErr?.message)

  const { error: anonMcReadErr } = await anon.from('question_misconceptions').select('question_id').limit(1)
  pass('anon cannot read question_misconceptions', denied(anonMcReadErr), anonMcReadErr?.message)

  const { data: mcAdmin, error: mcAdminErr } = await admin
    .from('question_misconceptions')
    .select('question_id')
    .limit(1)
  pass('service role can read question_misconceptions', !mcAdminErr, mcAdminErr?.message)

  // ---- #8 learning state is read-only for clients ---------------------
  if (subject) {
    const { error: attemptReadErr } = await user
      .from('learning_attempts')
      .select('id')
      .eq('user_id', userId)
    pass('client can read its own learning attempts', !attemptReadErr, attemptReadErr?.message)

    const { error: attemptInsErr } = await user.from('learning_attempts').insert({
      user_id: userId,
      subject_id: subject.id,
      lesson_id: 'phase3-test',
      attempt_type: 'diagnostic',
      is_correct: true,
    })
    pass('client cannot insert learning_attempts', denied(attemptInsErr), attemptInsErr?.message)

    const { error: attemptUpdErr } = await user
      .from('learning_attempts')
      .update({ is_correct: false })
      .eq('user_id', userId)
    pass('client cannot update learning_attempts', denied(attemptUpdErr), attemptUpdErr?.message)

    const { error: attemptDelErr } = await user
      .from('learning_attempts')
      .delete()
      .eq('user_id', userId)
    pass('client cannot delete learning_attempts', denied(attemptDelErr), attemptDelErr?.message)

    const { error: masteryInsErr } = await user.from('learner_topic_mastery').insert({
      user_id: userId,
      subject_id: subject.id,
    })
    pass('client cannot insert learner_topic_mastery', denied(masteryInsErr), masteryInsErr?.message)

    const { error: masteryUpdErr } = await user
      .from('learner_topic_mastery')
      .update({ mastery_score: 100, status: 'secured' })
      .eq('user_id', userId)
    pass('client cannot update learner_topic_mastery', denied(masteryUpdErr), masteryUpdErr?.message)

    const { error: queueInsErr } = await user.from('review_queue').insert({
      user_id: userId,
      subject_id: subject.id,
    })
    pass('client cannot insert review_queue', denied(queueInsErr), queueInsErr?.message)

    const { error: queueUpdErr } = await user
      .from('review_queue')
      .update({ state: 'done' })
      .eq('user_id', userId)
    pass('client cannot update review_queue', denied(queueUpdErr), queueUpdErr?.message)

    const { error: streakInsErr } = await user.from('streaks').insert({ user_id: userId })
    pass('client cannot insert streaks', denied(streakInsErr), streakInsErr?.message)

    const { error: streakUpdErr } = await user
      .from('streaks')
      .update({ current_streak: 999, longest_streak: 999 })
      .eq('user_id', userId)
    pass('client cannot update streaks', denied(streakUpdErr), streakUpdErr?.message)

    const { error: streakReadErr } = await user
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
    pass('client can still read its own streak', !streakReadErr, streakReadErr?.message)

    // The server path still writes: a service-role attempt is visible to its
    // owner through the own-row SELECT policy.
    const { data: seededAttempt, error: seedAttemptErr } = await admin
      .from('learning_attempts')
      .insert({
        user_id: userId,
        subject_id: subject.id,
        lesson_id: 'phase3-test',
        attempt_type: 'diagnostic',
        is_correct: true,
      })
      .select('id')
      .single()
    attemptId = seededAttempt?.id ?? null
    pass('service role can insert learning_attempts', !seedAttemptErr, seedAttemptErr?.message)

    const { data: visibleAttempts } = await user
      .from('learning_attempts')
      .select('id')
      .eq('user_id', userId)
    pass('owner sees the server-written attempt', (visibleAttempts ?? []).some((row) => row.id === attemptId))
  } else {
    console.log('  SKIP  learning-state checks (no subject available)')
  }

  // ---- #9 dead client write grants are gone ---------------------------
  const { error: resultsInsErr } = await user.from('results').insert({ session_id: crypto.randomUUID() })
  pass('client cannot insert results', denied(resultsInsErr), resultsInsErr?.message)

  const { error: paymentsInsErr } = await user.from('payments').insert({ user_id: userId })
  pass('client cannot insert payments', denied(paymentsInsErr), paymentsInsErr?.message)

  const { error: entitlementsInsErr } = await user.from('entitlements').insert({ user_id: userId })
  pass('client cannot insert entitlements', denied(entitlementsInsErr), entitlementsInsErr?.message)

  const { error: usageInsErr } = await user.from('usage_counters').insert({ user_id: userId })
  pass('client cannot insert usage_counters', denied(usageInsErr), usageInsErr?.message)

  if (question) {
    const { error: reviewInsErr } = await user.from('question_reviews').insert({
      question_id: question.id,
      verified_state: 'human_verified',
    })
    pass('client cannot insert question_reviews', denied(reviewInsErr), reviewInsErr?.message)

    const { data: seededReview, error: seedReviewErr } = await admin
      .from('question_reviews')
      .insert({
        question_id: question.id,
        reviewer: userId,
        verified_state: 'human_verified',
        note: 'phase3-test',
      })
      .select('id')
      .single()
    reviewId = seededReview?.id ?? null
    pass('service role can insert question_reviews', !seedReviewErr, seedReviewErr?.message)

    if (reviewId) {
      const { data: clientReviews, error: clientReviewErr } = await user
        .from('question_reviews')
        .select('id')
        .eq('id', reviewId)
      pass('non-admin cannot read question review history', !clientReviewErr && (clientReviews ?? []).length === 0, clientReviewErr?.message)

      const { data: adminReviews } = await admin
        .from('question_reviews')
        .select('id')
        .eq('id', reviewId)
      pass('service role reads question review history', (adminReviews ?? []).length === 1)

      await admin.from('question_reviews').delete().eq('id', reviewId)
      reviewId = null
    }
  }

  const { error: anonResultsErr } = await anon.from('results').select('id').limit(1)
  pass('anon cannot read results', denied(anonResultsErr), anonResultsErr?.message)

  const { error: anonPaymentsErr } = await anon.from('payments').select('id').limit(1)
  pass('anon cannot read payments', denied(anonPaymentsErr), anonPaymentsErr?.message)

  // ---- user_exam_access keeps its self-service feature ----------------
  if (schoolExam) {
    const { data: row, error: accessInsErr } = await user
      .from('user_exam_access')
      .insert({ user_id: userId, exam_id: schoolExam.id })
      .select('id')
      .single()
    accessId = row?.id ?? null
    pass('client can add a school-specific exam', !accessInsErr, accessInsErr?.message)

    const { error: accessUpdErr } = await user
      .from('user_exam_access')
      .update({ added_at: new Date().toISOString() })
      .eq('user_id', userId)
    pass('client cannot update user_exam_access', denied(accessUpdErr), accessUpdErr?.message)

    if (accessId) {
      const { error: accessDelErr } = await user
        .from('user_exam_access')
        .delete()
        .eq('id', accessId)
      pass('client can remove its own exam access', !accessDelErr, accessDelErr?.message)
      if (!accessDelErr) accessId = null
    }
  }

  if (nationalExam) {
    const { error: nationalInsErr } = await user
      .from('user_exam_access')
      .insert({ user_id: userId, exam_id: nationalExam.id })
    pass('client cannot add a national exam', denied(nationalInsErr), nationalInsErr?.message)
  }
} catch (e) {
  failed++
  console.log('  FAIL  test flow crashed:', e.message)
} finally {
  if (accessId) await admin.from('user_exam_access').delete().eq('id', accessId)
  if (attemptId) await admin.from('learning_attempts').delete().eq('id', attemptId)
  if (reviewId) await admin.from('question_reviews').delete().eq('id', reviewId)
  await admin.from('push_subscriptions').delete().eq('user_id', userId)
  if (otherUserId) await admin.from('push_subscriptions').delete().eq('user_id', otherUserId)
  if (otherUserId) await admin.auth.admin.deleteUser(otherUserId)
  const { error: delErr } = await admin.auth.admin.deleteUser(userId)
  pass('disposable users cleaned up', !delErr)
}

console.log('')
console.log(`RESULT: ${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)

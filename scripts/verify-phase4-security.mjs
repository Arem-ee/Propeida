// Phase 4 privilege regression: public write surface and dead write grants.
//
// Run after applying 20261027000004_phase4_public_write_surface.sql:
//   node --env-file=.env scripts/verify-phase4-security.mjs
//
// Uses one disposable auth user. Verifies that analytics and inquiry rows are
// server-authored, that content tables reject client writes, and that the four
// reviewed client-write tables still work.

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
const EMAIL = `phase4-test-${STAMP}@propeida.test`
const PASSWORD = `Phase4-${Math.random().toString(36).slice(2, 10)}!a1`
const MISSING_ID = '00000000-0000-0000-0000-000000000000'

console.log('=== PHASE 4: PUBLIC WRITE SURFACE ===')
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: EMAIL,
  password: PASSWORD,
  email_confirm: true,
})
pass('service role created a disposable user', !createErr, EMAIL)
if (createErr) process.exit(1)

const userId = created.user.id
const seeded = { analyticsId: null, contactId: null, lessonReflectionId: null, targetId: null }

try {
  const user = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } })
  const { error: signInErr } = await user.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  pass('disposable user signed in with the anon key', !signInErr)
  const anon = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } })

  // ---- #10 analytics rows are server-authored -------------------------
  const event = { event_name: 'phase4-test', event_data: {}, url_path: '/phase4' }

  const { error: anonAnalyticsErr } = await anon.from('analytics_events').insert(event)
  pass('anon cannot insert analytics_events', denied(anonAnalyticsErr), anonAnalyticsErr?.message)

  const { error: userAnalyticsErr } = await user.from('analytics_events').insert(event)
  pass('authenticated cannot insert analytics_events', denied(userAnalyticsErr), userAnalyticsErr?.message)

  const { data: seededEvent, error: seedEventErr } = await admin
    .from('analytics_events')
    .insert({ ...event, user_id: userId })
    .select('id')
    .single()
  seeded.analyticsId = seededEvent?.id ?? null
  pass('service role can insert analytics_events', !seedEventErr, seedEventErr?.message)

  const { data: visibleEvents } = await user
    .from('analytics_events')
    .select('id')
    .eq('id', seeded.analyticsId)
  pass('authenticated cannot read analytics_events', (visibleEvents ?? []).length === 0)

  const { error: userAnalyticsUpdErr } = await user
    .from('analytics_events')
    .update({ event_name: 'tampered' })
    .eq('id', seeded.analyticsId)
  pass('authenticated cannot update analytics_events', denied(userAnalyticsUpdErr), userAnalyticsUpdErr?.message)

  // ---- #10 contact submissions are server-authored --------------------
  const submission = { email: EMAIL, message: 'phase4 disposable submission' }

  const { error: anonContactErr } = await anon.from('contact_submissions').insert(submission)
  pass('anon cannot insert contact_submissions', denied(anonContactErr), anonContactErr?.message)

  const { error: userContactErr } = await user.from('contact_submissions').insert(submission)
  pass('authenticated cannot insert contact_submissions', denied(userContactErr), userContactErr?.message)

  const { data: seededContact, error: seedContactErr } = await admin
    .from('contact_submissions')
    .insert({ ...submission, user_id: userId })
    .select('id')
    .single()
  seeded.contactId = seededContact?.id ?? null
  pass('service role can insert contact_submissions', !seedContactErr, seedContactErr?.message)

  const { data: visibleContacts } = await user
    .from('contact_submissions')
    .select('id')
    .eq('id', seeded.contactId)
  pass('authenticated cannot read contact_submissions', (visibleContacts ?? []).length === 0)

  // ---- content tables reject dead client write grants -----------------
  const { error: questionInsErr } = await user.from('questions').insert({})
  pass('client cannot insert questions', denied(questionInsErr), questionInsErr?.message)

  const { error: subjectUpdErr } = await user
    .from('subjects')
    .update({ name: 'phase4' })
    .eq('id', MISSING_ID)
  pass('client cannot update subjects', denied(subjectUpdErr), subjectUpdErr?.message)

  const { error: lessonDelErr } = await user
    .from('lessons')
    .delete()
    .eq('id', MISSING_ID)
  pass('client cannot delete lessons', denied(lessonDelErr), lessonDelErr?.message)

  const { error: examInsErr } = await user.from('exams').insert({})
  pass('client cannot insert exams', denied(examInsErr), examInsErr?.message)

  // ---- reviewed client writes still work ------------------------------
  const endpoint = `https://push.example.test/${STAMP}/phase4`
  const { error: subErr } = await user.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint,
    p256dh: 'phase4-p256dh',
    auth: 'phase4-auth',
  }, { onConflict: 'user_id,endpoint' })
  pass('client can save its own push subscription', !subErr, subErr?.message)

  const { error: subDelErr } = await user
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)
  pass('client can remove its own push subscription', !subDelErr, subDelErr?.message)

  const { data: reflection, error: reflectionErr } = await user
    .from('lesson_reflections')
    .insert({
      user_id: userId,
      lesson_id: `phase4-${STAMP}`,
      explanation_text: 'phase4 disposable reflection',
    })
    .select('id')
    .single()
  seeded.lessonReflectionId = reflection?.id ?? null
  pass('client can submit a lesson reflection', !reflectionErr, reflectionErr?.message)

  const { data: school } = await admin
    .from('schools')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (school) {
    const { data: target, error: targetErr } = await user
      .from('student_targets')
      .insert({ user_id: userId, school_id: school.id, priority: 1 })
      .select('id')
      .single()
    seeded.targetId = target?.id ?? null
    pass('client can add a target school', !targetErr, targetErr?.message)

    const { data: targets, error: targetReadErr } = await user
      .from('student_targets')
      .select('id, school_id')
      .eq('user_id', userId)
    pass('client can read its own targets', !targetReadErr && (targets ?? []).length === 1, targetReadErr?.message)

    const { error: targetUpdErr } = await user
      .from('student_targets')
      .update({ active: false })
      .eq('id', seeded.targetId)
    pass('client can update its own target', !targetUpdErr, targetUpdErr?.message)
  } else {
    console.log('  SKIP  target checks (no school available)')
  }

  // ---- profile editable columns survived the global revoke ------------
  const { error: profileUpdErr } = await user
    .from('profiles')
    .update({ full_name: 'Phase 4 Test' })
    .eq('id', userId)
  pass('client can still update its editable profile columns', !profileUpdErr, profileUpdErr?.message)

  const { error: profileAdminErr } = await user
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', userId)
  pass('client cannot escalate profiles.is_admin', denied(profileAdminErr), profileAdminErr?.message)
} catch (e) {
  failed++
  console.log('  FAIL  test flow crashed:', e.message)
} finally {
  if (seeded.analyticsId) await admin.from('analytics_events').delete().eq('id', seeded.analyticsId)
  if (seeded.contactId) await admin.from('contact_submissions').delete().eq('id', seeded.contactId)
  if (seeded.lessonReflectionId) await admin.from('lesson_reflections').delete().eq('id', seeded.lessonReflectionId)
  if (seeded.targetId) await admin.from('student_targets').delete().eq('id', seeded.targetId)
  await admin.from('push_subscriptions').delete().eq('user_id', userId)
  const { error: delErr } = await admin.auth.admin.deleteUser(userId)
  pass('disposable user cleaned up', !delErr)
}

console.log('')
console.log(`RESULT: ${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)

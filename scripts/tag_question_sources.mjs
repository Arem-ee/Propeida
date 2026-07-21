import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function ensureSourceColumn() {
  // Check if column exists via Supabase JS client
  const { data: sample, error } = await supabase.from('questions').select('source').limit(0);
  if (!error && !(error?.message?.includes('does not exist'))) {
    console.log('source column already exists, skipping migration.');
    return true;
  }

  // Column doesn't exist. Try direct pg connection.
  console.log('source column missing — attempting ALTER TABLE via direct DB connection...');

  // Extract project ref from URL
  const ref = SUPABASE_URL.replace('https://', '').split('.')[0];
  const key = SERVICE_KEY;

  // Try session pooler (port 5432)
  const configs = [
    { label: 'Session pooler', uri: `postgresql://postgres.${ref}:${encodeURIComponent(key)}@aws-0-us-west-1.pooler.supabase.com:5432/postgres` },
    { label: 'Transaction pooler', uri: `postgresql://postgres.${ref}:${encodeURIComponent(key)}@aws-0-us-west-1.pooler.supabase.com:6543/postgres` },
  ];

  for (const cfg of configs) {
    const pool = new Pool({ connectionString: cfg.uri, connectionTimeoutMillis: 5000, max: 1 });
    try {
      const client = await pool.connect();
      await client.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'unknown'`);
      console.log(`  ✓ source column added via ${cfg.label}`);
      client.release();
      await pool.end();
      return true;
    } catch (e) {
      console.log(`  ✗ ${cfg.label} failed: ${e.message}`);
      await pool.end().catch(() => {});
    }
  }

  // None worked — print SQL for manual application
  console.log('\n❌ Could not run ALTER TABLE automatically.');
  console.log('   Please run this SQL in Supabase Dashboard SQL Editor:\n');
  console.log('   ALTER TABLE questions ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT \'unknown\';\n');
  return false;
}

async function main() {
  // Step 1: Ensure source column
  const columnReady = await ensureSourceColumn();
  if (!columnReady) {
    console.log('Cannot proceed with tagging until source column is added.');
    console.log('Apply the SQL above, then re-run this script.');
    process.exit(1);
  }

  // Step 2: Get unilorin-post-utme exam ID
  const { data: exam } = await supabase.from('exams').select('id').eq('slug', 'unilorin-post-utme').single();
  if (!exam) {
    console.error('unilorin-post-utme exam not found');
    process.exit(1);
  }
  const examId = exam.id;
  console.log(`\nUnilorin exam ID: ${examId}`);

  // Step 3: Read verified texts
  const verifiedTexts = JSON.parse(readFileSync(new URL('./known_verified_texts.json', import.meta.url), 'utf-8'));
  console.log(`Loaded ${verifiedTexts.length} verified texts from known_verified_texts.json`);

  // Step 4: Count how many match
  const { data: allUnilorin } = await supabase
    .from('questions')
    .select('id, question_text')
    .eq('exam_id', examId);

  if (!allUnilorin) {
    console.error('Failed to fetch questions for unilorin-post-utme');
    process.exit(1);
  }

  console.log(`Total unilorin-post-utme questions in DB: ${allUnilorin.length}`);

  // Build set of verified texts for O(1) lookup
  const verifiedSet = new Set(verifiedTexts.map(t => t.trim()));

  // Classify
  const verifiedIds = [];
  const unverifiedIds = [];
  for (const q of allUnilorin) {
    if (verifiedSet.has(q.question_text)) {
      verifiedIds.push(q.id);
    } else {
      unverifiedIds.push(q.id);
    }
  }

  console.log(`\nMatches found: ${verifiedIds.length} / ${verifiedTexts.length} verified texts`);
  if (verifiedIds.length < verifiedTexts.length) {
    const matchedSet = new Set(verifiedIds);
    const missing = verifiedTexts.filter(t => !allUnilorin.some(q => q.question_text === t));
    console.log(`  ${verifiedTexts.length - verifiedIds.length} texts had no match in DB.`);
    if (missing.length > 0 && missing.length <= 10) {
      console.log('  Unmatched texts:');
      for (const m of missing) console.log(`    - "${m}"`);
    }
  }

  // Step 5: Tag verified_manual
  if (verifiedIds.length > 0) {
    // Batch in chunks of 500
    const BATCH = 500;
    for (let i = 0; i < verifiedIds.length; i += BATCH) {
      const batch = verifiedIds.slice(i, i + BATCH);
      const { error } = await supabase
        .from('questions')
        .update({ source: 'verified_manual' })
        .in('id', batch);
      if (error) {
        console.error(`Batch ${i / BATCH} update error:`, error.message);
        process.exit(1);
      }
    }
    console.log(`  ✓ Tagged ${verifiedIds.length} rows as verified_manual`);
  }

  // Step 6: Tag gemini_unverified for remaining unilorin rows not yet tagged
  if (unverifiedIds.length > 0) {
    // Only tag rows where source is still 'unknown'
    const BATCH = 500;
    for (let i = 0; i < unverifiedIds.length; i += BATCH) {
      const batch = unverifiedIds.slice(i, i + BATCH);
      const { error } = await supabase
        .from('questions')
        .update({ source: 'gemini_unverified' })
        .in('id', batch)
        .eq('source', 'unknown');
      if (error) {
        console.error(`Batch ${i / BATCH} update error (gemini):`, error.message);
      }
    }
    console.log(`  ✓ Tagged remaining unilorin rows as gemini_unverified`);
  }

  // Step 7: Verify counts
  const { count: verifiedCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('source', 'verified_manual')
    .eq('exam_id', examId);

  const { count: geminiCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('source', 'gemini_unverified')
    .eq('exam_id', examId);

  console.log(`\n=== FINAL COUNTS for unilorin-post-utme ===`);
  console.log(`  verified_manual:  ${verifiedCount}`);
  console.log(`  gemini_unverified: ${geminiCount}`);
  console.log(`  total:             ${(verifiedCount ?? 0) + (geminiCount ?? 0)}`);

  // Step 8: Pull 25 random gemini_unverified rows in CSV format
  console.log(`\n=== RANDOM SAMPLE: 25 gemini_unverified rows ===`);
  const { data: sample } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      options,
      correct_answer,
      explanation,
      difficulty,
      exam_id,
      subjects!inner(slug)
    `)
    .eq('source', 'gemini_unverified')
    .eq('exam_id', examId)
    .order('id', { ascending: false })
    .limit(50);

  // Shuffle
  const shuffled = (sample ?? []).sort(() => Math.random() - 0.5).slice(0, 25);

  // Header
  console.log('exam_slug,subject_slug,question_text,option_a,option_b,option_c,option_d,correct_answer,explanation,difficulty');
  for (const q of shuffled) {
    const opts = Array.isArray(q.options) ? q.options : [];
    const getOption = (k) => {
      const o = opts.find(o => o.key === k);
      return o ? `"${o.text.replace(/"/g, '""')}"` : '""';
    };
    const subject = Array.isArray(q.subjects) ? q.subjects[0]?.slug : q.subjects?.slug;
    const qtext = `"${(q.question_text ?? '').replace(/"/g, '""')}"`;
    const expl = `"${(q.explanation ?? '').replace(/"/g, '""')}"`;
    const diff = q.difficulty ?? 'medium';
    console.log(`unilorin-post-utme,${subject},${qtext},${getOption('a')},${getOption('b')},${getOption('c')},${getOption('d')},"${q.correct_answer}",${expl},${diff}`);
  }
  console.log(`\nSample size: ${shuffled.length} rows output above.`);
}

main().catch(e => console.error('FATAL:', e));

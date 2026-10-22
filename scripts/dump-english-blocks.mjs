import { createClient } from "@supabase/supabase-js"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: subject } = await db.from("subjects").select("id").eq("slug","english").single()
const { data: lessons } = await db.from("lessons").select("id,slug,status").eq("subject_id", subject.id).eq("status","published")
for (const l of lessons) {
  const { data: blocks } = await db.from("lesson_blocks").select("position,block_type,content").eq("lesson_id", l.id).order("position")
  console.log(`\n=== ${l.slug} (${blocks.length} blocks)`)
  for (const b of blocks) {
    const c = b.content
    const keys = Object.keys(c ?? {})
    console.log(`  [${String(b.position).padStart(2)}] ${b.block_type.padEnd(18)} keys=${keys.join(",")}`)
  }
}

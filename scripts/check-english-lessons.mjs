import { createClient } from "@supabase/supabase-js"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: subject } = await db.from("subjects").select("id").eq("slug","english").single()
const { data: lessons } = await db.from("lessons").select("id,slug,title").eq("subject_id",subject.id).order("title")
for (const l of lessons) {
  const { data: blocks } = await db.from("lesson_blocks").select("block_type").eq("lesson_id",l.id)
  console.log(`${l.slug.padEnd(30)} ${l.title.padEnd(35)} blocks=${blocks?.length??0}`)
}

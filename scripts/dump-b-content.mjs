import { createClient } from "@supabase/supabase-js"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: subject } = await db.from("subjects").select("id").eq("slug","english").single()
for (const slug of ["parts-of-speech","concord-rules","common-grammar-errors","vocabulary-and-idioms","comprehension-tips"]) {
  const { data: l } = await db.from("lessons").select("id,title").eq("subject_id", subject.id).eq("slug", slug).single()
  const { data: blocks } = await db.from("lesson_blocks").select("position,block_type,content").eq("lesson_id", l.id).order("position")
  console.log(`\n=== ${slug} — ${l.title}`)
  for (const b of blocks) {
    if (b.block_type === "text") {
      const c = b.content
      console.log(`  [${b.position}] TEXT "${c.heading}"`)
      console.log(`       para: ${(c.paragraphs?.[0] ?? "").slice(0,120)}`)
      console.log(`       bullets: ${(c.bullets ?? []).map(x=>x.slice(0,70)).join(" // ")}`)
    } else if (b.block_type === "callout") {
      console.log(`  [${b.position}] CALLOUT: ${(b.content.body ?? "").slice(0,140)}`)
    } else if (b.block_type === "vocabulary_card") {
      console.log(`  [${b.position}] VOCAB: ${(b.content.words??[]).map(w=>w.word).join(", ")}`)
    } else if (b.block_type === "minimal_pair") {
      console.log(`  [${b.position}] PAIR: ${b.content.pair?.join("  ||  ")}`)
    } else if (b.block_type === "passage") {
      console.log(`  [${b.position}] PASSAGE "${b.content.title}" (${b.content.paragraphs?.length} paras, ${b.content.questions?.length} q)`)
    } else if (b.block_type === "sentence_rebuild") {
      console.log(`  [${b.position}] REBUILD: ${(b.content.prompt??"").slice(0,90)}`)
    } else {
      console.log(`  [${b.position}] ${b.block_type}`)
    }
  }
}

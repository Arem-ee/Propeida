import { createClient } from "@supabase/supabase-js"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data } = await db.from("questions").select("question_text, options, correct_answer, difficulty").eq("subject_id", (await db.from("subjects").select("id").eq("slug","english").single()).data.id).limit(2)
for (const q of data ?? []) console.log(JSON.stringify(q).slice(0, 420))

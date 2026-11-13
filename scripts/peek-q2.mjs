import { createClient } from "@supabase/supabase-js"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data } = await db.from("questions").select("*").limit(1)
console.log("questions columns:", Object.keys(data?.[0] ?? {}).join(", "))
const r = data?.[0]
for (const k of Object.keys(r ?? {})) console.log(`   ${k} = ${JSON.stringify(r[k])?.slice(0,90)}`)

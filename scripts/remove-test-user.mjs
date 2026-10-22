import { createClient } from "@supabase/supabase-js"
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 200 })
const u = (list?.users ?? []).find(x => x.email === "adaeze@propeida.app")
if (u) {
  await db.from("learning_attempts").delete().eq("user_id", u.id)
  await db.from("lesson_reflections").delete().eq("user_id", u.id)
  await db.from("profiles").delete().eq("id", u.id)
  await db.auth.admin.deleteUser(u.id)
  console.log("removed test user", u.email)
} else console.log("no test user")

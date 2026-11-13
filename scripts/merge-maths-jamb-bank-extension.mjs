// Merges content-folder/_work/maths-extension-batches/*.json into
// content-folder/maths-jamb-bank-extension.json (created with the first 10
// questions inline). Run once; idempotent by question text.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const extPath = join(root, 'content-folder', 'maths-jamb-bank-extension.json')
const batchDir = join(root, 'content-folder', '_work', 'maths-extension-batches')

const ext = JSON.parse(readFileSync(extPath, 'utf8'))
const baseCount = ext.questions.length
const seen = new Set(ext.questions.map((q) => q.question.trim()))

const files = readdirSync(batchDir).filter((f) => f.endsWith('.json')).sort()
let added = 0
for (const f of files) {
  const batch = JSON.parse(readFileSync(join(batchDir, f), 'utf8'))
  for (const q of batch) {
    if (seen.has(q.question.trim())) {
      console.error(`duplicate question text skipped from ${f}: ${q.question.slice(0, 60)}`)
      continue
    }
    ext.questions.push(q)
    seen.add(q.question.trim())
    added += 1
  }
}

writeFileSync(extPath, JSON.stringify(ext, null, 2))
console.log(`base ${baseCount} + batches ${added} = ${ext.questions.length} questions`)

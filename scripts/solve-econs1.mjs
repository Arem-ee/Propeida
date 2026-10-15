// Stage 1a: Econs triage — explanations for verified-clean rows, repairs
// where reconstruction is certain, key-dispute flags where the publisher
// key contradicts analysis, deletes for fused/unrecoverable rows.
// NOTHING here marks anything verified: all rows stay draft/unverified
// for the human review queue.
//
// Usage: node --env-file=.env scripts/solve-econs1.mjs

import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}
const db = createClient(URL, KEY)

const EXPLAIN = {
  'f2fa0d0c-29b5-4ae5-bbea-176646abb850': 'Administrative instruction, not economics: the correct paper type is printed on your own question script — for this 2010 set it was Type C.',
  '6503c9d0-efa2-4f8d-99b0-4671409782f7': 'Lionel Robbins defined economics as the science of human behaviour as a relationship between ends and scarce means with alternative uses — hence the efficient allocation of resources.',
  '83593c03-1ad3-4b0c-8c6e-875145acb607': 'Falling share prices show market forces operating with no one directing them — Adam Smith\u2019s invisible hand, the self-regulation of the market.',
  'bf458aea-17cf-4082-b0ce-83884ed0482b': 'A firm hires labour while the extra output the last worker adds covers the wage — hiring follows labour\u2019s marginal productivity.',
  'bc049ae8-071c-40db-8310-7cb4e7f28f69': 'Administrative instruction: the correct paper type is printed on your own script — for this 2011 set it was Type B.',
  '3c656d34-3493-4792-937d-d13596a2c73d': 'When buying one good prevents buying another (tea instead of coffee), the goods compete for the same need — competitive demand.',
  'e095ba8f-9f6c-4ef0-bf87-cba82234771d': 'Total product stops growing exactly when the extra worker adds nothing — at MP = 0, TP is at its maximum.',
  '6df590bc-d196-492a-a39c-2db221e66000': 'Administrative instruction: the correct type is printed on your own script — for this 2012 set it was Type Green (B).',
  'd2b68b1d-e822-43ad-9a0f-c99121343319': 'Elasticity = %\u0394Q \u00F7 %\u0394P = (8 \u00F7 1500) \u00F7 8% \u2248 0.067. Below 1, so demand is inelastic — quantity hardly responds to the price rise.',
  'e8ac350b-a337-44a9-a826-cc5285ea0d9f': 'Public and private sectors producing side by side is the mixed economy — Nigeria\u2019s system.',
  '5eaf03e9-4c37-401d-b628-256c784a9a64': 'Variance is the square of the standard deviation: 53\u00B2 = 2,809.',
  'dd77d0b4-52f3-47cf-bec3-c942ba6c4fa4': 'Less money in circulation means money is scarcer, so its price — the interest rate — rises.',
  '6ebba975-f160-430d-a20a-f2f2865a62f6': 'Expansionary fiscal policy puts money into private hands: cutting company profit tax leaves firms with more to invest. (Buying securities or moving the bank rate is monetary policy.)',
  '0a1dc77d-1fd0-40d7-abd0-50eab43292b4': 'Land supply is fixed — the owner cannot shift the tax to anyone, so the whole of a land tax sticks to owners.',
  'ed14ca26-6e95-421d-89fb-a361d637e9a6': 'Development plans exist to raise citizens\u2019 living standards — every other option is a means to that end, not the goal.',
  'cbcd8fdc-5c50-4fc1-a406-8f587067beea': 'Training and skill acquisition raise each worker\u2019s output directly — that is what improves labour quality.',
  'c83c6db5-9881-4555-bab2-30faded108ea': 'Emigration means people leave the country, so the resident population falls.',
  'c1949d24-3560-4561-98bd-d037f14bbdbd': 'Lenders charge for risk — the riskier the borrower, the higher the interest on the loan.',
  '84b9288e-a3c1-49f7-942b-9630d2786aa8': 'Real wages can only rise sustainably when each worker produces more — productivity growth.',
  'e283d465-cc59-4f1c-b1d1-a0fb40192fbb': 'Searching for a similar job between employments is frictional unemployment — the friction of moving between jobs.',
  'bc646514-e0f4-46e7-b37b-57b1e0689a58': 'In a command economy the state answers what, how and for whom to produce — so government decides how to produce.',
  'd4574a70-bd99-4188-9415-17669ca95512': 'Freezing wages holds down production costs and spending power — an incomes-policy attack on inflation.',
  '2517e21e-2a48-4d53-9771-870b32800e54': 'Firms locate near buyers to cut transport cost and reach demand — market proximity.',
  '3b2f213b-7db9-4974-990b-12c7d8072b2e': 'OPEC\u2019s quota system steadies world oil prices, and steady prices secure Nigeria\u2019s oil revenue — its main contribution.',
  '1335a3a5-d8f4-43b9-a468-0bad328987b9': 'The Nigerian Export Promotion Council exists to push Nigerian goods into foreign markets — export enhancement.',
  '24913607-943f-4bb4-8fa0-e122072875cf': 'Too much money chasing too few goods pulls prices up — demand-pull inflation.',
  '31ce3850-864c-4ee5-b7fb-a3293c7acc9f': 'Only the Central Bank of Nigeria manages the naira\u2019s external value and foreign exchange.',
  '7c0e91f5-c142-4dc9-aea7-d3565a6bb396': 'Factories run on power, roads and water — efficient infrastructure is what industrialises.',
  '56349a67-dc7a-426b-af26-206bf271dd64': 'Capital gains tax takes a cut of income from asset sales — a direct tax on income.',
  'dcddcf75-4448-44ec-aaf9-5eee4f820457': 'Every other option is a channel government actually collects through; (c) merely lists kinds of income, not a revenue source.',
  '7eae1432-63a2-4cde-ae46-2d11f0bca438': 'Banks drive development by lending to businesses — provision of credit facilities.',
  '73e9ec28-1067-439e-a148-01fa28cecfa4': 'Members own and patronise the co-operative society — the owners are mostly the customers.',
  'e77167bd-9dea-42b2-bc1f-1b7d1d866233': 'Services cross borders unseen — banking is an invisible (service) export, while rice and milk are visible goods.',
  'e313ed53-68f8-45b5-8906-0cfa56f5f91d': 'Economics exists because wants exceed resources — scarcity forces choice.',
  'a6a50e78-fa1c-430e-904c-c14cf0d91f59': 'Skills, attitude, training and conditions all raise efficiency; the sheer headcount (total population) does not.',
  '77b8b301-2e6c-4f43-a607-3fd8f5e0086a': 'Growth rate = change \u00F7 base year: (49 \u2212 32) \u00F7 32 = 17 \u00F7 32 \u2248 53%, nearest option 50%.',
  '36511175-488b-4414-9702-0a9d5d61a43e': 'Deregulation lets competition set prices and routes — efficiency in pricing and distribution.',
  '5aceb9d6-3437-4d47-8ae1-4a6cc9ba5f1d': 'A cartel is a formal agreement among firms to fix prices and share markets — stronger and more organised than mere collusion.',
  '2b8a36ed-8dcc-4fdb-9717-4d061b853b1a': 'In national income accounting, tax liability follows earnings — determined by the level of income.',
  '8d441238-b94a-47ee-a059-9d8bfb2158fc': 'An import embargo forces demand onto home farms — the fastest boost to domestic agricultural output.',
  '2b041905-ab6d-403e-8ea7-cfcd7b2ef2e0': 'Governments steer industries to poorer regions to spread development evenly.',
  'ef9f7273-0cbd-444f-9201-da1b1c4bfd9c': 'Growth over time is tracked with GDP at market prices.',
  '563f0cf4-9d7a-4a88-b35a-c5b4d98b93c3': 'Where people work follows where the jobs and pay are — economic factors.',
  'c9f9174c-0688-4f01-af75-23890891aae3': 'The working population is exactly those qualified and offering themselves for work.',
  'a5f66d8a-fbec-49d5-bce6-b696d988fad2': 'Administrative instruction: the correct type is printed on your own script — for this 2013 set it was Type D.',
  'f71bc6f6-ea7a-4ec6-81d2-efd1cb422a6d': 'Administrative instruction: the correct paper type is printed on your own script — for this 2010 set it was Type C.',
}

const REPAIR = {
  // trim next-stem leak from option D
  '36511175-488b-4414-9702-0a9d5d61a43e': { optionsD: 'fixing appropriate production quotas' },
  '5aceb9d6-3437-4d47-8ae1-4a6cc9ba5f1d': { optionsD: 'specialization' },
  'c0110a6a-e02c-4370-89f1-d098daff75cf': { optionsD: 'non-government ownership' },
  '2ec956ea-c6cc-4580-a5ba-f22640cd35de': { optionsD: 'the consumption of inferior goods increases with income' },
  '53a33c90-6055-49f6-940b-f5c20a946fa6': { optionsD: '4.5' },
  '30481d4c-9133-45eb-be38-47e19f403875': { optionsD: 'decrease' },
  // restore stem heads from same-source leaks (flagged as repaired)
  '2b8a36ed-8dcc-4fdb-9717-4d061b853b1a': { stem: 'In national income accounting, tax is determined by the' },
  '8d441238-b94a-47ee-a059-9d8bfb2158fc': { stem: 'Government can boost agricultural output in Nigeria primarily by' },
  '2b041905-ab6d-403e-8ea7-cfcd7b2ef2e0': { stem: 'Governments influence the location of industries in order to' },
  '666cfa52-ad97-4219-9848-105c9c3a2439': { stem: 'If the demand for a good is more elastic than its supply, the tax burden is borne' },
  '679deeac-1282-49f0-842a-2bd14817226d': { stem: 'One of the assumptions of ordinal utility theory is that' },
  'cb0e59c1-0749-415e-a703-4577595ae781': { stem: 'A set of factors that can shift the supply curve are changes in' },
  'b0912400-f820-4bff-8e27-a842138bf56e': { stem: 'The formula: index of export prices \u00F7 index of import prices \u00D7 100 is used to measure the' },
  // rebuilt from fragments across two fused rows (flagged, verify key)
  'de4ae396-3601-400c-9a15-cb9a28f443b2': {
    stem: 'If commodity X is a by-product of commodity Y, this implies that both commodities are',
    options: [
      { key: 'a', text: 'in competitive supply' },
      { key: 'b', text: 'in composite supply' },
      { key: 'c', text: 'jointly supplied' },
      { key: 'd', text: 'in excess supply' },
    ],
  },
  // typo-level repairs (certain)
  'c19df686-014a-4472-8b09-42dc4420462c': {
    optionsC: 'reveals the cost of living',
    optionsD: 'provides the government with statistics on present size of the labour force',
  },
}

const REPAIR_EXPLAIN = {
  'cb0e59c1-0749-415e-a703-4577595ae781': 'Supply shifts when weather, technology or input conditions change — (a) lists supply-side shifters.',
  'de4ae396-3601-400c-9a15-cb9a28f443b2': 'By-products emerge together from one process — goods produced together are jointly supplied.',
  'c19df686-014a-4472-8b09-42dc4420462c': 'Age structure tells government how many people are entering working age — statistics on the labour force.',
  'b0912400-f820-4bff-8e27-a842138bf56e': 'Export price index \u00F7 import price index \u00D7 100 is the commodity terms of trade.',
  'dba0a2e2-cc4a-46aa-a7c2-aae678d4f623': 'A torch is useless without a battery — goods used together have complementary demand.',
  '1c78cabb-34f1-4d95-89fd-d89202557b74': 'In capitalism, firms\u2019 output decisions — guided by profit and demand — ultimately settle what gets produced.',
}

const REPAIR_FLAG = {
  'cb0e59c1-0749-415e-a703-4577595ae781': 'AI-solving: stem restored from fragments; verify key (a) against source.',
  'b0912400-f820-4bff-8e27-a842138bf56e': 'AI-solving: stem reworded from fragments; verify against source.',
  'de4ae396-3601-400c-9a15-cb9a28f443b2': 'AI-solving: rebuilt from fragments across two fused rows; verify key and wording against source.',
  'dba0a2e2-cc4a-46aa-a7c2-aae678d4f623': 'AI-solving: options C/D are leaked text from neighbours — verify or reject.',
  '1c78cabb-34f1-4d95-89fd-d89202557b74': 'AI-solving: option D is leaked text from the next question — verify or reject.',
  '666cfa52-ad97-4219-9848-105c9c3a2439': 'AI-solving: less elastic side bears more tax, so producers (b) — publisher key (a) contradicts; verify against source.',
  '679deeac-1282-49f0-842a-2bd14817226d': 'AI-solving: ordinal utility ranks satisfaction (b); measurability (d) is cardinal — publisher key contradicts; verify.',
  '2ec956ea-c6cc-4580-a5ba-f22640cd35de': 'AI-solving: diminishing MU explains the negative demand slope (a); publisher key (b) contradicts; verify.',
  '53a33c90-6055-49f6-940b-f5c20a946fa6': 'AI-solving: mean = (4+15+8+5)/10 = 3.2 (c); publisher key (b) contradicts; verify figures against source.',
  '30481d4c-9133-45eb-be38-47e19f403875': 'AI-solving: elastic demand plus price rise cuts total revenue (d); publisher key (c) contradicts; verify.',
  'c19df686-014a-4472-8b09-42dc4420462c': 'AI-solving: source typos repaired (sitatistics/provsides); verify wording.',
}

const FLAG = {
  '2f3a6df4-7f4c-4242-b800-c60a5641ea35': 'AI-solving: demand rise with fixed supply raises price AND quantity (d); publisher key (b) contradicts — verify against source.',
  '04462b01-25a8-456a-ba8a-4a4616058092': 'AI-solving: doubling inputs with less-than-doubled output is decreasing returns (d); publisher key (b) contradicts — verify.',
  '46b943ec-8bb1-4c00-bfc3-802b4955246f': 'AI-solving: the money market\u2019s core function is short-term funds (b); publisher key (c) contradicts — verify.',
  '1b0660b1-bc73-4f1d-a0a7-d813e477e11a': 'AI-solving: emerging export crop points to cassava (a), not cocoa (c) — verify key against source.',
  'd9ccd0b2-8780-4af0-b5cc-02935db9fd85': 'AI-solving: -20%/+2% is elastic; key (b) with typos quiantity/damanded — verify all.',
  '207b32b3-4cc5-4060-b01b-c3a2bc0095e7': 'AI-solving: 40\u22122P=6P+24 gives P=2, matching no option; publisher key (d) inconsistent — verify figures against source.',
  '8618d83f-fb18-4f0a-aa03-ce42f1cb458d': 'AI-solving: precautionary motive follows income (c); publisher key (a) names the speculative motive — verify.',
  'e1bf6742-7ab2-40eb-a754-a1b3ee65be6e': 'AI-solving: short-term loans come from the money market (c); development banks are long-term — verify publisher key (b).',
  '32858bb2-fce7-47d0-af50-57b2a33b48ec': 'AI-solving: 175% index means prices up 75% — cost of living rises, money value falls (d); publisher key (a) contradicts — verify.',
  '9fc070fd-7ddc-462c-8ca3-dbab70c95732': 'AI-solving: insurers supply long-term capital (a); publisher key (c) contradicts — verify.',
  '3b6a95a8-e913-4ae1-a9ec-3432fe9a551d': 'AI-solving: adding value means processing into finished goods (b); publisher key (d) contradicts — verify.',
  '4046f61f-da06-42d4-af55-4a1d6a3c9b34': 'AI-solving: state participation is classically explained by huge investment outlay (d); publisher key (b) contradicts — verify.',
  '85139dd7-0334-4f49-892b-31263ce943cb': 'AI-solving: no option names unlimited liability; publisher key (b) unclear — verify question and key.',
  '05218396-b947-429f-a29c-3a8851275e37': 'AI-solving: defending the naira means buying it with reserves (d); publisher key (b) inverts this — verify.',
  'e8797187-dc4f-42cf-b550-7f934cfbd5a8': 'AI-solving: pattern-of-demand effects point to tariff (d) as much as income tax (c) — verify publisher key.',
  'fd6d700d-3ee1-48b9-8f8a-10aad799be52': 'AI-solving: ECA is known for transport/communications work (b); publisher key (a) fits trade blocs better — verify.',
  '07af719b-ab01-444e-a3d5-317c5b992e43': 'AI-solving: textbook aim is food self-sufficiency, absent here; publisher key (a) uncertain — verify.',
  '99b79511-65aa-4465-b969-e30357534dee': 'AI-solving: publisher key (b) does not read as a disadvantage of import dependence — verify question and key.',
  'fc323316-46b6-4ade-9704-f1bd770a2c1a': 'AI-solving: comparative advantage — Sierra Leone (coffee 8t vs 2t) takes coffee, Ghana (cocoa 9t vs 7t) takes cocoa; publisher key (d) reverses this — verify.',
  'ecf36509-085f-4175-93ba-00f27aea6dc7': 'AI-solving: per-capita plus output growth reads as economic growth (d); publisher key (c) — verify which definition source uses.',
  'dba0a2e2-cc4a-46aa-a7c2-aae678d4f623': 'AI-solving: options C/D are leaked text from neighbours — verify or reject.',
  '1c78cabb-34f1-4d95-89fd-d89202557b74': 'AI-solving: option D is leaked text from the next question — verify or reject.',
  'ddef3a18-bdf4-4d5c-952e-81b01be133ee': 'AI-solving: textbook socialist disadvantage is lost consumer sovereignty (b); publisher key (a) — verify.',
  'cbbbf3ac-745c-400b-a4de-45530b452ebf': 'AI-solving: deficit financing stimulates; curb-inflation (c) contradicts the instrument — verify publisher key.',
}

const DELETE = [
  '8f3cb76b-7b09-43cd-82ad-5b01484ef640',
  'ad315d59-3986-4d2f-9f70-2c0304146b08',
  'a8453bff-5695-4961-af97-03cd72616a0d',
  '9b6df656-637d-4f5f-ba78-ba391bb5ce4c',
  '431e79bf-dc6e-4005-9ea1-de0b648bdf9b',
  '5f8eceb5-d290-4f24-9bf4-dd63fcda8bf8',
  '41b2e195-5e8a-464d-af80-07179b3b10fc',
  'fa29cf87-6077-43bd-963a-cbde97d2706e',
  '913fabd1-44b5-415d-8a7d-996a0a708be8',
  'b06a9fbe-193d-4822-aca1-e078e9ad79f6',
  '0f4d4887-482a-4d5d-a396-f1bdfd747f73',
  '1de96931-dc7e-45cb-ac26-cadb47d162ef',
  '60f04ca5-67e1-400e-ad50-4122f5759c9c',
  '75f31b1a-0976-410a-8e20-05fb2e29cc21',
  'a29354fd-9a26-48e2-951c-62435bc81fa8',
  'e4ea090e-783f-41f7-b096-d5b8d5fe1398',
  '2a7534ca-7622-4ade-9704-f1bd770a2c1a',
  '40a055ec-82e7-4e67-be54-27fc4d33d76c',
  '7fee1248-d4a3-4edd-b4f1-a94f0d3d34ea',
  '90d19be1-e0bc-40e6-b15a-1bade8ae057a',
  '91a61a2a-8561-493e-81bf-c0b3dcd27ae1',
  'afb6e9ce-0c7e-4d5f804a-5897d927dd16',
  'ead2c573-c8ac-4935-851f-7d51236e00eb',
  '035a48a4-d6a5-465b-816e-37f9a602d212',
  '3bf4cb40-6bd0-4d67-bc93-6115c9b8c5c8',
  '9d55eef8-1d05-4577-b096-d5b8d5fe1398',
]

let nExp = 0
for (const [id, explanation] of Object.entries(EXPLAIN)) {
  const { error } = await db.from('questions').update({ explanation }).eq('id', id)
  if (error) throw new Error(`explain ${id}: ${error.message}`)
  nExp++
}

let nRep = 0
for (const [id, fix] of Object.entries(REPAIR)) {
  const { data: row, error: readErr } = await db
    .from('questions')
    .select('id, question_text, options, review_note')
    .eq('id', id)
    .single()
  if (readErr || !row) throw new Error(`repair read ${id}: missing`)
  const patch = {}
  if (fix.stem) patch.question_text = fix.stem
  if (fix.options) {
    patch.options = fix.options
  } else {
    patch.options = (row.options ?? []).map((o) => {
      const k = (o.key ?? '').toUpperCase()
      if (k === 'D' && fix.optionsD) return { ...o, text: fix.optionsD }
      if (k === 'C' && fix.optionsC) return { ...o, text: fix.optionsC }
      return o
    })
  }
  const notes = [row.review_note, 'AI-solving: repaired from fragments — verify wording against source', REPAIR_FLAG[id] ?? null, REPAIR_EXPLAIN[id] ? null : null]
    .filter(Boolean)
    .join(' | ')
  patch.review_note = notes || null
  if (REPAIR_EXPLAIN[id]) patch.explanation = REPAIR_EXPLAIN[id]
  const { error } = await db.from('questions').update(patch).eq('id', id)
  if (error) throw new Error(`repair ${id}: ${error.message}`)
  nRep++
}

let nFlag = 0
for (const [id, note] of Object.entries(FLAG)) {
  const { data: row } = await db.from('questions').select('review_note').eq('id', id).single()
  const notes = [row?.review_note, note].filter(Boolean).join(' | ')
  const { error } = await db.from('questions').update({ review_note: notes }).eq('id', id)
  if (error) throw new Error(`flag ${id}: ${error.message}`)
  nFlag++
}

let nDel = 0
if (DELETE.length > 0) {
  const { error } = await db.from('questions').delete().in('id', DELETE)
  if (error) throw new Error(`delete: ${error.message}`)
  nDel = DELETE.length
}

console.log(`explained: ${nExp} | repaired: ${nRep} | flagged: ${nFlag} | deleted: ${nDel}`)

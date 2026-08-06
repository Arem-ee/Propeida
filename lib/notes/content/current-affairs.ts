import type { RevisionNote } from '@/lib/notes'

export const currentAffairsNotes: RevisionNote[] = [
  {
    id: 'current-affairs-nigerian-government',
    subject: 'current-affairs',
    topic: 'Nigerian Government',
    slug: 'nigerian-government',
    summary: 'The three arms of government, the federal structure, and how the presidency works.',
    practiceTopic: 'nigerian-government',
    sections: [
      {
        heading: 'The three arms of government',
        paragraphs: [
          'Nigerian government works through three separate arms that balance one another. Nearly every "which arm belongs to…" question tests whether you can attach an institution to the correct arm.',
        ],
        bullets: [
          'Executive — implements laws: the President, governors, ministers, and their agencies.',
          'Legislature — makes laws: the National Assembly (Senate + House of Representatives) and state Houses of Assembly.',
          'Judiciary — interprets laws and settles disputes: courts from magistrate level up to the Supreme Court, the apex court.',
          'Separation of powers keeps the arms independent; checks and balances let each arm limit the others.',
        ],
      },
      {
        heading: 'The federal structure',
        paragraphs: [
          'Nigeria is a federation, so power is shared between the centre and the states. Remember the key numbers and the document everything rests on.',
        ],
        bullets: [
          'Nigeria is a federation of 36 states plus the Federal Capital Territory (Abuja).',
          'There are 774 local government areas.',
          'The 1999 Constitution (as amended) is the supreme law of the land.',
          'Federal law overrides state law on items in the exclusive list; states legislate on the concurrent list.',
        ],
      },
      {
        heading: 'The executive',
        paragraphs: [
          'The presidential system makes the President both head of state and head of government. Tests frequently ask about how the President is chosen and who appoints what.',
        ],
        bullets: [
          'The President is both head of state and head of government (presidential system).',
          'The President is elected by popular vote for a four-year term, renewable once (a maximum of two terms).',
          'The President appoints ministers subject to Senate confirmation, and appoints the Chief Justice on the recommendation of the National Judicial Council.',
          'The Vice President stands in when the President is absent or incapacitated.',
          'As of 2026, Bola Tinubu is President (sworn in 29 May 2023) with Vice President Kashim Shettima.',
        ],
      },
      {
        heading: 'The legislature and judiciary',
        paragraphs: [
          'Laws pass through both chambers of the National Assembly before they become binding. Courts hear cases in order, ending at the Supreme Court.',
        ],
        bullets: [
          'The 10th National Assembly: Senate President Godswill Akpabio; Speaker of the House Tajudeen Abbas.',
          'Bills become law after passing both chambers and receiving presidential assent.',
          'The Supreme Court hears final appeals; the Court of Appeal is next in line.',
        ],
      },
    ],
    examTip:
      'For "which arm does X belong to?" questions, attach every agency to one of the three arms first — the wrong options are usually agencies from another arm.',
  },
  {
    id: 'current-affairs-national-institutions',
    subject: 'current-affairs',
    topic: 'Major National Institutions',
    slug: 'major-national-institutions',
    summary: 'Match the acronym to the function — the standard Current Affairs question in Nigerian exams.',
    practiceTopic: 'national-institutions',
    sections: [
      {
        heading: 'Institutions you will be asked to match',
        paragraphs: [
          'Most Current Affairs questions give an acronym and expect one function. Learn the big six first — they cover the majority of questions.',
        ],
        bullets: [
          'INEC — Independent National Electoral Commission: organises and conducts elections.',
          'EFCC — Economic and Financial Crimes Commission: investigates and prosecutes financial crimes such as fraud and money laundering.',
          'CBN — Central Bank of Nigeria: issues the naira, sets monetary policy, and supervises banks.',
          'NAFDAC — National Agency for Food and Drug Administration and Control: regulates food, drugs, and related products.',
          'NNPC Ltd — Nigerian National Petroleum Company: manages the country’s oil and gas interests.',
          'NUC — National Universities Commission: accredits university programmes and sets academic standards.',
          'JAMB — Joint Admissions and Matriculation Board: conducts the Unified Tertiary Matriculation Examination (UTME) and centralises admissions.',
        ],
      },
      {
        heading: 'Regulators and service agencies',
        paragraphs: [
          'A second wave of institutions regulates specific sectors. Pair each with the industry it touches, from phones and power to tax and national service.',
        ],
        bullets: [
          'NCC — Nigerian Communications Commission: regulates telecoms (SIM cards, networks).',
          'NERC — Nigerian Electricity Regulatory Commission regulates the electricity market; TCN — Transmission Company of Nigeria runs the grid.',
          'FIRS — Federal Inland Revenue Service collects federal taxes such as VAT and company income tax.',
          'NYSC — National Youth Service Corps runs the mandatory one-year service for graduates.',
          'NDLEA — National Drug Law Enforcement Agency fights drug trafficking and abuse.',
          'NIA (foreign intelligence) and DSS (domestic intelligence) handle intelligence internally and externally.',
        ],
      },
      {
        heading: 'Exam tactics for institutions',
        paragraphs: [
          'Two tactics rescue marks here: watch for look-alike acronyms and match by the last word of the name.',
        ],
        bullets: [
          'Read the acronym twice: EFCC and EFFC are favourite distractors.',
          'Match by the lead word: "Commission" usually means regulation; "Agency" usually means enforcement or service.',
          'Where two options both exist (e.g. NNPC vs NPDC), pick the one named in the question’s context.',
        ],
      },
    ],
    examTip:
      'Learn each institution by one unique phrase: INEC → elections, CBN → the naira, NAFDAC → food and drugs, NUC → universities. One phrase per institution is enough to score.',
  },
  {
    id: 'current-affairs-international-organizations',
    slug: 'international-organizations',
    subject: 'current-affairs',
    topic: 'International Organizations',
    summary: 'The UN system, African and West African bodies, and the organisations Nigeria belongs to.',
    practiceTopic: 'international-organizations',
    sections: [
      {
        heading: 'Global organisations',
        paragraphs: [
          'The United Nations and its agencies dominate this part of the syllabus. Nigeria joined the UN at independence in 1960.',
        ],
        bullets: [
          'UN — United Nations: founded 1945, headquarters in New York; Nigeria joined in 1960 on independence.',
          'The UN Security Council has five permanent members (China, France, Russia, the UK, the US) with veto power.',
          'WHO — World Health Organization: global health, based in Geneva.',
          'UNESCO — United Nations Educational, Scientific and Cultural Organization: education, science and culture.',
          'IMF and the World Bank: international finance; both are headquartered in Washington, DC.',
          'WTO — World Trade Organization: rules of international trade.',
          'UNICEF — United Nations Children’s Fund: children’s welfare.',
          'ILO — International Labour Organization: labour standards.',
          'ICJ — International Court of Justice: settles legal disputes between states, seated in The Hague.',
          'FAO — Food and Agriculture Organization: works on food security and farming, a UN agency based in Rome.',
        ],
      },
      {
        heading: 'African and regional bodies',
        paragraphs: [
          'Nigeria sits at the heart of African and West African groupings. Know each headquarters, what the body does, and roughly how many members it claims.',
        ],
        bullets: [
          'AU — African Union: 55 member states, headquartered in Addis Ababa; successor to the OAU (founded in 1963, transformed in 2002).',
          'ECOWAS — Economic Community of West African States: 15 West African member states; headquarters in Abuja.',
          'AfDB — African Development Bank: finances development across the continent.',
          'The Commonwealth: an association of mainly former British colonies, including Nigeria, linking countries through shared values and the English language.',
        ],
      },
      {
        heading: 'Oil and trade bodies',
        paragraphs: [
          'Nigeria, as a major oil producer, sits in the bodies that shape energy and trade policy.',
        ],
        bullets: [
          'OPEC — Organization of the Petroleum Exporting Countries: coordinates oil policy; Nigeria has been a member since 1971; headquarters in Vienna.',
          'AfCFTA — African Continental Free Trade Area: aims to create a single continental market for goods and services.',
        ],
      },
    ],
    examTip:
      'Pair each acronym with its HQ: UN — New York, WHO — Geneva, AU — Addis Ababa, ECOWAS — Abuja, OPEC — Vienna. HQ questions are guaranteed marks.',
  },
  {
    id: 'current-affairs-recent-developments',
    subject: 'current-affairs',
    topic: 'Recent National Developments',
    slug: 'recent-national-developments',
    summary: 'The economic and political landmarks of the current administration, framed for revision.',
    practiceTopic: 'recent-developments',
    sections: [
      {
        heading: 'Economy and reform (2023–2026)',
        paragraphs: [
          'The defining economic story of the current years is a cluster of reforms: subsidy removal, exchange-rate liberalisation, and tax restructuring.',
        ],
        bullets: [
          'Fuel subsidy removal: announced in May 2023; petrol prices rose sharply and subsidy spending was redirected.',
          'Exchange-rate reform: the naira was allowed to float more freely, which made it weaken sharply against the dollar.',
          'Tax reform: the Tax Reform Acts signed into law in mid-2025 restructure how VAT is shared and how taxation is administered.',
          'The national minimum wage was raised to ₦70,000 in 2024.',
          'The federal government announced a CNG (Compressed Natural Gas) vehicle conversion programme from late 2023 as a cheaper transport option after subsidy removal.',
          'Inflation stayed elevated, with the CBN raising the monetary policy rate repeatedly in response.',
        ],
      },
      {
        heading: 'Politics and elections',
        paragraphs: [
          'On the political side, remember who won in 2023, how the result was administered, and what comes next.',
        ],
        bullets: [
          'The 2023 general elections returned Bola Ahmed Tinubu of the APC as President, with the 2023–2027 administration still in office as of 2026.',
          'INEC conducted the 2023 elections under the new Electoral Act, 2022, including electronic transmission of results.',
          'The next general election (presidential and National Assembly) is constitutionally due in 2027; by 2026 parties were already holding primaries.',
          'The student loan scheme (NELFUND) began disbursing loans to students in tertiary institutions in 2024.',
          'The Supreme Court’s 2024 ruling granted local government councils financial autonomy, ending state governors’ control of council funds.',
        ],
      },
      {
        heading: 'How to stay current',
        paragraphs: [
          'Revision notes age. On exam day, check names and dates against the latest news and prefer change questions (what changed recently?) over memorised old facts.',
        ],
        bullets: [
          'Revision notes age; check dates and names against the news before exam day.',
          'Prefer asking "what has changed recently in X?" to memorising an old year’s facts.',
          'State institutions carry most of the marks — be careful with office holders’ names that often change.',
        ],
      },
    ],
    examTip:
      'For "recent development" questions, anchor every answer in the administration’s timeline: subsidy removal (2023), minimum wage (2024), tax reform (2025), and the 2027 election build-up.',
  },
]
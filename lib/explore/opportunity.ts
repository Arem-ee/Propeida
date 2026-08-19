import type { SceneKey } from '@/lib/explore/visual-scenes'

export type DemandLevel =
  | 'high'
  | 'growing'
  | 'moderate'
  | 'competitive'
  | 'emerging'
  | 'limited'
  | 'uncertain'

export type OutlookLevel =
  | 'growing'
  | 'stable'
  | 'emerging'
  | 'competitive'
  | 'declining'
  | 'uncertain'

export type OutlookBasis = 'evidence' | 'trend' | 'projection' | 'interpretation'

export type SkillGroup = 'core' | 'practical' | 'modern' | 'professional'
export type SkillImportance = 'essential' | 'valuable' | 'specialization' | 'bonus'

export interface EvidenceEntry {
  source: string
  title: string
  url: string | null
  publishedAt: string | null
  accessedAt: string | null
  claim: string
}

export interface SkillEntry {
  name: string
  group: SkillGroup
  importance: SkillImportance
  why: string
  connectsTo?: {
    specializations: string[]
    sectors: string[]
    roles: string[]
  }
}

export interface LearningStage {
  stage: 'foundation' | 'build' | 'specialize' | 'employable'
  title: string
  whatToDo: string
  skills: string[]
}

export interface SpecializationPath {
  name: string
  chain: string[]
  sectors: string[]
  roles: string[]
}

export interface ProjectIdea {
  level: 'beginner' | 'intermediate' | 'advanced'
  ideas: string[]
}

export interface CareerOpportunity {
  careerSlug: string
  demand: {
    level: DemandLevel
    summary: string
    evidenceNote: string
  }
  outlook: {
    level: OutlookLevel
    basis: OutlookBasis
    summary: string
    horizon: string
    drivers?: Array<{ label: string; note: string; scene?: SceneKey }>
  }
  sectors: string[]
  employerTypes: string[]
  nigerianReality: string
  dayInCareer?: Array<{ time: string; activity: string; detail: string; scene?: SceneKey }>
  employability: {
    intro: string
    skills: SkillEntry[]
  }
  learningPath: {
    intro: string
    stages: LearningStage[]
    specializations: SpecializationPath[]
    startHere: string[]
    projects: ProjectIdea[]
  }
  internationalTransferability: {
    intro: string
    destinations: { country: string; note: string }[]
  }
  evidence: EvidenceEntry[]
  lastReviewed: string
}

export const DEMAND_LABELS: Record<DemandLevel, string> = {
  high: 'High demand',
  growing: 'Growing',
  moderate: 'Moderate',
  competitive: 'Competitive',
  emerging: 'Emerging',
  limited: 'Limited',
  uncertain: 'Uncertain',
}

export const OUTLOOK_LABELS: Record<OutlookLevel, string> = {
  growing: 'Growing',
  stable: 'Stable',
  emerging: 'Emerging',
  competitive: 'Competitive',
  declining: 'Declining',
  uncertain: 'Uncertain',
}

export const BASIS_LABELS: Record<OutlookBasis, string> = {
  evidence: 'Evidence-backed',
  trend: 'Observed trend',
  projection: 'Industry projection',
  interpretation: 'Propeida interpretation',
}

export const SKILL_GROUP_LABELS: Record<SkillGroup, string> = {
  core: 'Core knowledge',
  practical: 'Practical skills',
  modern: 'Modern & adjacent skills',
  professional: 'Professional skills',
}

export const SKILL_IMPORTANCE_LABELS: Record<SkillImportance, string> = {
  essential: 'Essential',
  valuable: 'Valuable',
  specialization: 'Specialization',
  bonus: 'Bonus',
}

export const STAGE_LABELS: Record<LearningStage['stage'], string> = {
  foundation: 'Foundation',
  build: 'Build',
  specialize: 'Specialize',
  employable: 'Become employable',
}

export interface SectorRef {
  name: string
  description: string
}

export const SECTORS: Record<string, SectorRef> = {
  'power-energy': { name: 'Power & Energy', description: 'Generation, transmission and distribution of electricity' },
  'renewable-energy': { name: 'Renewable Energy', description: 'Solar, wind and other clean energy systems' },
  'telecommunications': { name: 'Telecommunications', description: 'Networks, data centres and communication infrastructure' },
  'manufacturing': { name: 'Manufacturing', description: 'Factories producing goods, food and materials' },
  'oil-gas': { name: 'Oil & Gas', description: 'Upstream and downstream petroleum operations' },
  'construction': { name: 'Construction', description: 'Buildings, roads and civil works' },
  'automation-control': { name: 'Automation & Control', description: 'Industrial automation, instrumentation and process control' },
  'technology': { name: 'Technology', description: 'Software, hardware and digital services' },
  'infrastructure': { name: 'Infrastructure', description: 'Public works, rail, aviation and utilities' },
  'research': { name: 'Research', description: 'Universities, laboratories and applied R&D' },
  'banking-finance': { name: 'Banking & Finance', description: 'Banks, fintech and financial services' },
  'healthcare': { name: 'Healthcare', description: 'Hospitals, clinics and public health' },
  'agriculture': { name: 'Agriculture', description: 'Farming, food processing and agri-business' },
  'education': { name: 'Education', description: 'Schools, universities and training' },
  'public-service': { name: 'Public Service', description: 'Government agencies and parastatals' },
  'media-communication': { name: 'Media & Communication', description: 'Publishing, broadcasting and content' },
  'real-estate': { name: 'Real Estate', description: 'Property development and management' },
  'e-commerce': { name: 'E-commerce', description: 'Online retail and logistics platforms' },
  'fmcg': { name: 'FMCG', description: 'Fast-moving consumer goods' },
  'transport-logistics': { name: 'Transport & Logistics', description: 'Mobility, shipping and supply chains' },
  'startups': { name: 'Startups', description: 'Early-stage technology ventures' },
  'mining-solid-minerals': { name: 'Mining & Solid Minerals', description: 'Extraction and processing of mineral resources' },
}

export const EMPLOYER_TYPES: Record<string, string> = {
  'power-generation-companies': 'Power generation companies (GENCOs)',
  'distribution-companies': 'Distribution companies (DISCOs)',
  'telecom-operators': 'Telecommunications operators',
  'manufacturing-companies': 'Manufacturing companies',
  'engineering-consultancies': 'Engineering consultancies',
  'construction-companies': 'Construction companies',
  'oil-gas-companies': 'Oil & gas companies',
  'renewable-energy-companies': 'Renewable energy companies',
  'technology-companies': 'Technology companies',
  'government-agencies': 'Government agencies',
  'research-institutions': 'Research institutions',
  'startups': 'Startups',
  'banks-financial-services': 'Banks and financial services',
  'insurance-companies': 'Insurance companies',
  'hospitals-clinics': 'Hospitals and clinics',
  'pharmaceutical-companies': 'Pharmaceutical companies',
  'public-health-agencies': 'Public health agencies',
  'law-firms-chambers': 'Law firms and chambers',
  'corporate-legal-departments': 'Corporate legal departments',
  'courts-tribunals': 'Courts and tribunals',
  'ngo-public-interest': 'NGOs and public interest bodies',
}

export const OPPORTUNITIES: Record<string, CareerOpportunity> = {
  'software-engineer': {
    careerSlug: 'software-engineer',
    demand: {
      level: 'high',
      summary:
        'Across Nigerian banks, telecoms, fintech and tech companies, software engineers are among the most actively recruited roles. Hiring is visible year-round on job boards, and salaries for skilled engineers are consistently above the national average for graduate roles.',
      evidenceNote:
        'Editorial assessment based on persistent recruitment activity across Nigerian employers (V1 curated data). No counts or percentages are claimed.',
    },
    outlook: {
      level: 'growing',
      basis: 'trend',
      horizon: '2026 to 2031',
      summary:
        'Digital payments, banking digitisation, logistics and government digital services continue to expand, which keeps demand for engineers growing. AI tooling changes how engineers work rather than removing the role: the bar shifts toward product thinking and integration skills.',
      drivers: [
        {
          label: 'Digital payments and fintech',
          note: 'Banks and fintechs keep expanding digital products, which needs engineers across the stack.',
          scene: 'finance',
        },
        {
          label: 'Government digitisation',
          note: 'Public services moving online creates steady demand for integration and platform work.',
          scene: 'public',
        },
        {
          label: 'Global remote work',
          note: 'International employers hiring Nigerian engineers widen the market beyond local salaries.',
          scene: 'devices',
        },
        {
          label: 'AI in the workflow',
          note: 'AI tools shift the job toward product thinking and integration rather than removing roles.',
          scene: 'code',
        },
      ],
    },
    sectors: ['technology', 'banking-finance', 'telecommunications', 'e-commerce', 'startups'],
    employerTypes: ['technology-companies', 'banks-financial-services', 'telecom-operators', 'government-agencies', 'startups'],
    nigerianReality:
      'Employers want proof you can build, not just grades. Interview loops for junior roles commonly include take-home projects or live coding, and CVs are often screened by how much you have actually shipped. Portfolio work, internships and contributing to real products matter more than your university ranking. Remote and hybrid roles with both local and international employers are a realistic path, especially with strong English communication and time-zone overlap.',
    dayInCareer: [
      {
        time: '08:00',
        activity: 'Stand-up and plan',
        detail: 'A short team stand-up sets priorities for the day; you pick up the highest-impact task first.',
        scene: 'code',
      },
      {
        time: '09:30',
        activity: 'Deep work on a feature',
        detail: 'Focused hours writing and testing code for the feature you own this sprint.',
        scene: 'code',
      },
      {
        time: '13:00',
        activity: 'Review and fix',
        detail: 'After lunch you review teammates\u2019 changes and fix bugs found in the morning build.',
        scene: 'devices',
      },
      {
        time: '15:30',
        activity: 'Sync with product',
        detail: 'A quick call with product or design to clarify requirements and flag trade-offs.',
        scene: 'devices',
      },
      {
        time: '17:30',
        activity: 'Ship and reflect',
        detail: 'Merge approved work, write a short summary, and note what to improve tomorrow.',
        scene: 'rocket',
      },
    ],
    employability: {
      intro: 'The gap between a degree and an offer is almost always bridged by demonstrable skill. These are the layers that matter, in order.',
      skills: [
        {
          name: 'Programming fundamentals',
          group: 'core',
          importance: 'essential',
          why: 'Data structures, algorithms and clean code are what every interview loop tests, regardless of stack.',
          connectsTo: { specializations: ['Backend', 'Frontend', 'Mobile'], sectors: ['technology', 'banking-finance'], roles: ['Junior Developer', 'Backend Engineer'] },
        },
        {
          name: 'One production language, deeply',
          group: 'core',
          importance: 'essential',
          why: 'Depth in one language (for example JavaScript/TypeScript or Python) beats breadth across five, because Nigerian employers hire for immediate contribution.',
        },
        {
          name: 'Databases and API design',
          group: 'practical',
          importance: 'essential',
          why: 'Every Nigerian software job, from bank systems to e-commerce, is built on data. SQL and REST skills are the common denominator.',
          connectsTo: { specializations: ['Backend', 'Data Engineering'], sectors: ['banking-finance', 'e-commerce'], roles: ['Backend Engineer', 'Data Engineer'] },
        },
        {
          name: 'Version control and shipping',
          group: 'practical',
          importance: 'essential',
          why: 'Git, code review and deployment basics are assumed. You cannot show you can ship without them.',
        },
        {
          name: 'Cloud and deployment basics',
          group: 'modern',
          importance: 'valuable',
          why: 'AWS or Azure exposure is increasingly listed in Nigerian job posts, and free tiers let you learn without spending.',
          connectsTo: { specializations: ['DevOps', 'Backend'], sectors: ['technology', 'telecommunications'], roles: ['Platform Engineer', 'Backend Engineer'] },
        },
        {
          name: 'AI-assisted development',
          group: 'modern',
          importance: 'valuable',
          why: 'Coding assistants are now part of the workflow. Employers increasingly expect you to work with them, not against them.',
        },
        {
          name: 'Mobile development',
          group: 'modern',
          importance: 'specialization',
          why: 'Nigeria is a mobile-first market. Flutter or native Android/iOS skills open a large slice of local opportunities.',
          connectsTo: { specializations: ['Mobile'], sectors: ['e-commerce', 'startups', 'banking-finance'], roles: ['Mobile Developer'] },
        },
        {
          name: 'Communication and documentation',
          group: 'professional',
          importance: 'essential',
          why: 'Writing, explaining and documenting your work is what distinguishes engineers who get promoted from engineers who get stuck.',
        },
        {
          name: 'Business context',
          group: 'professional',
          importance: 'valuable',
          why: 'Understanding how the business makes money helps you build what is actually needed, which is the fastest route to trust.',
        },
      ],
    },
    learningPath: {
      intro: 'A realistic path from zero to your first Nigerian software role, usually 6 to 18 months of consistent work depending on your starting point.',
      stages: [
        {
          stage: 'foundation',
          title: 'Learn to program',
          whatToDo: 'Pick one language (JavaScript or Python), master the basics, then learn data structures and algorithms. Solve problems daily, no matter how small.',
          skills: ['JavaScript or Python', 'Data structures & algorithms', 'Problem-solving practice'],
        },
        {
          stage: 'build',
          title: 'Build real things',
          whatToDo: 'Build at least three complete projects that solve real problems you or people around you have. Deploy them so they are publicly viewable. This becomes your portfolio.',
          skills: ['Web or mobile development', 'Databases', 'Git & deployment'],
        },
        {
          stage: 'specialize',
          title: 'Pick a lane',
          whatToDo: 'Choose backend, frontend, mobile or data. Go deep enough to answer interview questions about it without notes.',
          skills: ['One specialization in depth', 'API design', 'Cloud basics'],
        },
        {
          stage: 'employable',
          title: 'Prove it',
          whatToDo: 'Write a CV around your projects, prepare for take-home tests and live coding, and apply in waves. Internships and junior roles are the entry point, then the market takes over.',
          skills: ['CV & interview preparation', 'Portfolio polish', 'Application pipeline'],
        },
      ],
      specializations: [
        {
          name: 'Backend engineering',
          chain: ['Foundation', 'Build', 'Backend', 'First backend role'],
          sectors: ['technology', 'banking-finance', 'e-commerce'],
          roles: ['Backend Engineer', 'API Developer', 'Database Engineer'],
        },
        {
          name: 'Frontend engineering',
          chain: ['Foundation', 'Build', 'Frontend', 'First frontend role'],
          sectors: ['technology', 'startups', 'media-communication'],
          roles: ['Frontend Developer', 'Web Developer', 'UI Engineer'],
        },
        {
          name: 'Mobile development',
          chain: ['Foundation', 'Build', 'Mobile', 'First mobile role'],
          sectors: ['e-commerce', 'startups', 'banking-finance'],
          roles: ['Mobile Developer', 'Flutter Developer', 'Android/iOS Developer'],
        },
        {
          name: 'Data engineering',
          chain: ['Foundation', 'Build', 'Data', 'First data role'],
          sectors: ['banking-finance', 'telecommunications', 'e-commerce'],
          roles: ['Data Engineer', 'Analytics Engineer', 'BI Developer'],
        },
      ],
      startHere: [
        'Start with JavaScript or Python and be consistent for 90 days before judging whether it is for you.',
        'Do not wait to "finish learning" before building. Build something tiny on week one.',
        'Learn in public: document your projects, share progress, and ask questions in Nigerian developer communities.',
      ],
      projects: [
        {
          level: 'beginner',
          ideas: [
            'A personal finance tracker that records income and expenses',
            'A restaurant menu and ordering page for a local business',
            'A simple to-do app with categories and reminders',
          ],
        },
        {
          level: 'intermediate',
          ideas: [
            'A marketplace listing platform for freelancers or artisans',
            'An electricity or transport fare calculator for your city',
            'A club or church/society membership management tool',
          ],
        },
        {
          level: 'advanced',
          ideas: [
            'A payments or wallet sandbox integrating a local payment gateway',
            'A logistics and delivery tracking system with driver views',
            'An open-source library or tool used by other developers',
          ],
        },
      ],
    },
    internationalTransferability: {
      intro: 'Software engineering is one of the most globally portable careers. Your skills transfer directly; the main gate is experience and communication.',
      destinations: [
        { country: 'Remote-first companies worldwide', note: 'Remote roles for African engineers are an established market, with time-zone overlap with Europe and the US being a common filter.' },
        { country: 'United Kingdom & Europe', note: 'Skilled worker and digital nomad routes exist; local experience plus a strong portfolio is the realistic entry point.' },
        { country: 'Canada', note: 'Fast-growing tech hubs; provincial nomination and express entry routes reward software experience.' },
        { country: 'United Arab Emirates', note: 'Large engineering workforce; demand for fintech and platform engineers remains steady.' },
      ],
    },
    evidence: [
      {
        source: 'Propeida editorial review',
        title: 'V1 opportunity assessment (curated)',
        url: null,
        publishedAt: null,
        accessedAt: '2026-08-19',
        claim: 'Demand and outlook labels for this career are editorial assessments for V1. They will be replaced with cited sources as evidence is collected.',
      },
    ],
    lastReviewed: '2026-08-19',
  },

  'medical-doctor': {
    careerSlug: 'medical-doctor',
    demand: {
      level: 'high',
      summary:
        'Doctors are consistently needed in Nigerian hospitals, and the gap between demand and supply is a widely reported national issue. In practice, demand is real but entry is long: the training pipeline itself (six years of study, housemanship, NYSC, residency) is the real constraint, not the number of openings.',
      evidenceNote:
        'Editorial assessment of a widely reported national workforce gap (V1 curated data). The long training pipeline is the binding constraint, not vacancy counts.',
    },
    outlook: {
      level: 'stable',
      basis: 'projection',
      horizon: '2026 to 2031',
      summary:
        'Population growth and expanding healthcare access keep the need for doctors steady. Salaries in public hospitals are improving but remain below what many graduates expect, which pushes many into private practice, locum work or emigration. The role itself is not going anywhere; the conditions around it are the variable.',
      drivers: [
        {
          label: 'Expanding healthcare access',
          note: 'More people are insured and more facilities are opening, which raises the need for doctors.',
          scene: 'health',
        },
        {
          label: 'Public health programmes',
          note: 'Federal and state health programmes need doctors in programmatic and leadership roles.',
          scene: 'public',
        },
        {
          label: 'Private and specialist care',
          note: 'Private hospitals and specialist centres grow faster than public payroll, creating a parallel market.',
          scene: 'health',
        },
        {
          label: 'Health technology',
          note: 'Telemedicine, hospital information systems and health data roles open new paths for doctors.',
          scene: 'devices',
        },
      ],
    },
    sectors: ['healthcare', 'research', 'education', 'public-service'],
    employerTypes: ['hospitals-clinics', 'public-health-agencies', 'research-institutions', 'pharmaceutical-companies'],
    nigerianReality:
      'Getting in is a marathon: six years of medical school, a year of housemanship, then NYSC, then residency (postgraduate training) if you want to specialise. Public hospital pay during training is modest, so many junior doctors supplement with private and locum work. The junior doctor years are demanding, and that reality filters out many people before they reach the specialist stage. If you are willing to commit to the long pipeline, opportunities in private hospitals, specialist practice and public health administration are substantial.',
    dayInCareer: [
      {
        time: '07:30',
        activity: 'Ward rounds',
        detail: 'Review patients admitted overnight, adjust treatment plans and update records.',
        scene: 'health',
      },
      {
        time: '10:00',
        activity: 'Clinic consultations',
        detail: 'See outpatients in the consulting room; history-taking drives most decisions.',
        scene: 'health',
      },
      {
        time: '13:30',
        activity: 'Procedures and theatres',
        detail: 'Assist or perform scheduled procedures under supervision during the training years.',
        scene: 'lab',
      },
      {
        time: '16:00',
        activity: 'Teaching and notes',
        detail: 'Teach medical students, complete notes and prepare for the next day\u2019s lists.',
        scene: 'education',
      },
      {
        time: '20:00',
        activity: 'On-call duties',
        detail: 'Cover emergencies in rotation; the pace and stakes are what the training pipeline is built for.',
        scene: 'health',
      },
    ],
    employability: {
      intro: 'For medicine, employability is mostly about surviving and excelling in a long, structured pipeline. These skills make the difference within it.',
      skills: [
        {
          name: 'Deep clinical knowledge',
          group: 'core',
          importance: 'essential',
          why: 'Everything downstream depends on passing professional exams and performing in clinical placements.',
        },
        {
          name: 'Communication with patients',
          group: 'practical',
          importance: 'essential',
          why: 'Patients and families across Nigeria expect clear, respectful explanation. Doctors who communicate well are the ones who are remembered and referred.',
        },
        {
          name: 'History-taking and diagnosis',
          group: 'practical',
          importance: 'essential',
          why: 'Clinical reasoning is the core craft: most diagnoses start with a careful history, not a scan.',
        },
        {
          name: 'Digital health and data',
          group: 'modern',
          importance: 'valuable',
          why: 'Hospital information systems, telemedicine and electronic records are spreading. Familiarity makes you more useful from day one.',
        },
        {
          name: 'Resilience and teamwork',
          group: 'professional',
          importance: 'essential',
          why: 'Shift work, high-stakes decisions and hierarchy are constants. Emotional steadiness is what sustains a career, not just a ward rotation.',
        },
        {
          name: 'Research fundamentals',
          group: 'professional',
          importance: 'valuable',
          why: 'Residency applications and fellowship opportunities value research output; a basic grounding in study design and writing pays off repeatedly.',
        },
      ],
    },
    learningPath: {
      intro: 'Unlike most careers in this guide, medicine has a fixed, regulated pipeline. These stages describe what to do at each point.',
      stages: [
        {
          stage: 'foundation',
          title: 'Get in and survive the basics',
          whatToDo: 'Aim for excellent JAMB/UTME results and a strong medical school. The first two to three years are about mastering anatomy, physiology, biochemistry and pathology.',
          skills: ['Strong UTME preparation', 'Anatomy & physiology', 'Study discipline'],
        },
        {
          stage: 'build',
          title: 'Clinical years',
          whatToDo: 'Take clinical rotations seriously, practice history-taking, and build patient communication skills on the wards.',
          skills: ['Clinical rotations', 'History-taking', 'Patient communication'],
        },
        {
          stage: 'specialize',
          title: 'Postgraduate training',
          whatToDo: 'After housemanship and NYSC, decide between residency (specialisation), public health, administration, or practice outside the hospital.',
          skills: ['Residency (WACS/WACP or equivalent)', 'Fellowship exams', 'Research output'],
        },
        {
          stage: 'employable',
          title: 'The consultant or senior-doctor stage',
          whatToDo: 'Consultants, public health specialists and medical administrators are the senior roles that combine impact with better conditions. Private practice becomes a realistic option.',
          skills: ['Specialist certification', 'Practice management', 'Mentorship'],
        },
      ],
      specializations: [
        {
          name: 'Clinical specialisation',
          chain: ['Medical school', 'Housemanship', 'Residency', 'Consultant'],
          sectors: ['healthcare'],
          roles: ['Consultant Physician', 'Surgeon', 'Paediatrician', 'Obstetrician'],
        },
        {
          name: 'Public health',
          chain: ['Medical school', 'Housemanship', 'MPH', 'Public health specialist'],
          sectors: ['public-service', 'healthcare', 'research'],
          roles: ['Epidemiologist', 'Public Health Officer', 'Program Manager'],
        },
        {
          name: 'Hospital administration',
          chain: ['Medical school', 'Housemanship', 'Administration experience', 'Hospital administrator'],
          sectors: ['healthcare'],
          roles: ['Medical Director', 'Quality Officer', 'Operations Lead'],
        },
        {
          name: 'Research and academia',
          chain: ['Medical school', 'Housemanship', 'Research fellowship', 'Academic clinician'],
          sectors: ['research', 'education'],
          roles: ['Clinical Researcher', 'Lecturer', 'Trial Investigator'],
        },
      ],
      startHere: [
        'Be honest with yourself about the length of the pipeline before committing. Six-plus years is the floor, not the exception.',
        'Build a strong foundation in biology and chemistry at secondary school; UTME preparation is the first real gate.',
        'Volunteer or shadow in a hospital if you can, before you apply, to see the reality before you commit.',
      ],
      projects: [
        {
          level: 'beginner',
          ideas: [
            'Volunteer at a community health outreach or blood drive',
            'Shadow a doctor or nurse in a local hospital',
            'Start a study group for sciences with classmates',
          ],
        },
        {
          level: 'intermediate',
          ideas: [
            'Organise a first-aid and basic health talk at your school or community',
            'Run a health awareness campaign on a topic like malaria or hypertension',
            'Document and present a patient-education resource in your local language',
          ],
        },
        {
          level: 'advanced',
          ideas: [
            'Design a community health screening event with a mentor',
            'Write a case study or review article with a supervisor',
            'Build a simple health data collection tool for a clinic or outreach',
          ],
        },
      ],
    },
    internationalTransferability: {
      intro: 'Medical qualifications transfer, but the route is regulated in every country. Plan early if international practice is the goal.',
      destinations: [
        { country: 'United Kingdom', note: 'The GMC registration pathway and PLAB exams are a well-trodden route for Nigerian-trained doctors, with structured visa routes.' },
        { country: 'United States', note: 'USMLE route with residency matching; competitive and costly, but a mature pathway for Nigerian graduates.' },
        { country: 'Canada', note: 'MCCQE pathway with provincial licensure differences; increasingly popular with strong demand for family medicine.' },
        { country: 'Middle East', note: 'Gulf countries recruit experienced Nigerian doctors and specialists through established licensure processes.' },
      ],
    },
    evidence: [
      {
        source: 'Propeida editorial review',
        title: 'V1 opportunity assessment (curated)',
        url: null,
        publishedAt: null,
        accessedAt: '2026-08-19',
        claim: 'Demand and outlook labels for this career are editorial assessments for V1. They will be replaced with cited sources as evidence is collected.',
      },
    ],
    lastReviewed: '2026-08-19',
  },

  'lawyer': {
    careerSlug: 'lawyer',
    demand: {
      level: 'competitive',
      summary:
        'Law graduates are produced in large numbers each year, which makes the entry level genuinely competitive. Demand is real but concentrated: corporate and commercial law (banking, energy, M&A), litigation, and newer fields like tech and data protection offer the strongest routes, while general practice at entry level is crowded.',
      evidenceNote:
        'Editorial assessment of the competitive graduate pipeline and observed demand concentration in commercial and regulatory practice (V1 curated data).',
    },
    outlook: {
      level: 'growing',
      basis: 'trend',
      horizon: '2026 to 2031',
      summary:
        'Fintech regulation, data protection, energy transition and dispute resolution are growing practice areas. The number of law graduates is not shrinking, so growth in demand is uneven: it favours those who specialise early and combine law with another discipline such as finance, technology or energy.',
      drivers: [
        {
          label: 'Fintech and data regulation',
          note: 'NDPA enforcement and fintech licensing create steady compliance and advisory work.',
          scene: 'finance',
        },
        {
          label: 'Energy transition deals',
          note: 'Solar, gas and power-sector transactions need lawyers who understand the sector.',
          scene: 'power',
        },
        {
          label: 'Dispute resolution demand',
          note: 'Commercial disputes and enforcement actions keep litigation chambers busy.',
          scene: 'court',
        },
        {
          label: 'Technology and IP',
          note: 'Software licensing, IP and digital contracts are growth areas with few specialists.',
          scene: 'devices',
        },
      ],
    },
    sectors: ['banking-finance', 'public-service', 'real-estate', 'technology', 'media-communication'],
    employerTypes: ['law-firms-chambers', 'corporate-legal-departments', 'courts-tribunals', 'government-agencies'],
    nigerianReality:
      'The pipeline is: law degree (usually five years), Law School, then the Bar. From there, most new lawyers start in chambers, often with little or no pay while they build reputation and clients. The people who progress fastest typically combine legal skill with a sector specialism, or with strong writing and advocacy that gets them noticed. Tech, data protection and energy are the areas where demand is visibly outstripping supply.',
    dayInCareer: [
      {
        time: '08:30',
        activity: 'Matter review',
        detail: 'Start the day by reviewing the status of each active matter and today\u2019s deadlines.',
        scene: 'court',
      },
      {
        time: '10:00',
        activity: 'Drafting and research',
        detail: 'Draft contracts, briefs or opinions; research statutes and precedents to support them.',
        scene: 'court',
      },
      {
        time: '13:00',
        activity: 'Client meetings',
        detail: 'Meet clients in person or by call to update them and gather instructions.',
        scene: 'briefcase',
      },
      {
        time: '15:30',
        activity: 'Court or negotiation',
        detail: 'Appear for hearings, or negotiate terms and settlement positions with the other side.',
        scene: 'court',
      },
      {
        time: '17:30',
        activity: 'File and follow up',
        detail: 'File documents, log work, and prepare the next day\u2019s appearances and deadlines.',
        scene: 'briefcase',
      },
    ],
    employability: {
      intro: 'The Bar gets you in the room; these skills decide how far you go once you are there.',
      skills: [
        {
          name: 'Legal writing and drafting',
          group: 'core',
          importance: 'essential',
          why: 'Contracts, briefs and opinions are the product. Drafting quality is the fastest signal of competence in chambers.',
        },
        {
          name: 'Statute and case research',
          group: 'core',
          importance: 'essential',
          why: 'Every argument stands on authority. Knowing how to find and weigh precedents quickly is a core craft skill.',
        },
        {
          name: 'Advocacy and argument',
          group: 'practical',
          importance: 'essential',
          why: 'Courtroom and negotiation presence matter in litigation; persuasive clarity matters everywhere in law.',
        },
        {
          name: 'Commercial awareness',
          group: 'practical',
          importance: 'essential',
          why: 'Corporate clients pay for legal advice that understands how deals and businesses work, not just rules.',
          connectsTo: { specializations: ['Corporate & commercial law', 'Banking & finance law'], sectors: ['banking-finance', 'real-estate', 'energy'], roles: ['Associate', 'In-house Counsel'] },
        },
        {
          name: 'Data protection and technology law',
          group: 'modern',
          importance: 'valuable',
          why: 'NDPA (Nigeria Data Protection Act) compliance, privacy and technology contracting are growth areas with a visible shortage of specialists.',
          connectsTo: { specializations: ['Technology law'], sectors: ['technology', 'banking-finance', 'telecommunications'], roles: ['DPO', 'Technology Lawyer'] },
        },
        {
          name: 'Client management and networking',
          group: 'professional',
          importance: 'essential',
          why: 'Legal careers, especially in private practice, are built on relationships and referrals.',
        },
      ],
    },
    learningPath: {
      intro: 'The regulated route through the Law School is fixed; the choices after the Bar are what shape your career.',
      stages: [
        {
          stage: 'foundation',
          title: 'Law degree',
          whatToDo: 'Five years of LLB (or four with the right entry qualifications). Master contract, tort, criminal and constitutional law; start writing and debating early.',
          skills: ['LLB foundations', 'Legal writing', 'Mooting and debating'],
        },
        {
          stage: 'build',
          title: 'Law School',
          whatToDo: 'The Bar Vocational programme: advocacy, drafting, ethics and professional skills. The final bar exams gate entry to the profession.',
          skills: ['Advocacy', 'Drafting', 'Bar finals'],
        },
        {
          stage: 'specialize',
          title: 'Choose your lane',
          whatToDo: 'Chambers (litigation), commercial practice, in-house counsel, or a hybrid with another discipline. Specialising in a growth area early compounds faster than waiting.',
          skills: ['Practice area depth', 'Commercial awareness', 'Regulatory knowledge'],
        },
        {
          stage: 'employable',
          title: 'Build a practice or a career',
          whatToDo: 'Senior associates, partners, in-house counsel roles, regulatory positions, or academia. A visible specialism plus a client or employer network is what unlocks these.',
          skills: ['Reputation building', 'Client network', 'Leadership'],
        },
      ],
      specializations: [
        {
          name: 'Litigation and advocacy',
          chain: ['LLB', 'Law School', 'Chambers', 'Litigator'],
          sectors: ['public-service', 'real-estate', 'banking-finance'],
          roles: ['Barrister', 'Solicitor in chambers', 'State counsel'],
        },
        {
          name: 'Corporate & commercial law',
          chain: ['LLB', 'Law School', 'Commercial practice', 'Corporate lawyer'],
          sectors: ['banking-finance', 'energy', 'technology', 'fmcg'],
          roles: ['Associate', 'In-house Counsel', 'Transaction lawyer'],
        },
        {
          name: 'Technology & data protection law',
          chain: ['LLB', 'Law School', 'Tech/DPA specialisation', 'Technology lawyer or DPO'],
          sectors: ['technology', 'banking-finance', 'telecommunications'],
          roles: ['Data Protection Officer', 'Technology Lawyer', 'Privacy Consultant'],
        },
        {
          name: 'Public and regulatory law',
          chain: ['LLB', 'Law School', 'Public service', 'Regulator or government lawyer'],
          sectors: ['public-service'],
          roles: ['State Counsel', 'Regulatory Officer', 'Legal Adviser'],
        },
      ],
      startHere: [
        'If you are still in secondary school, prioritise English, Literature and Government, and start reading court reports and news commentary on Nigerian law.',
        'Join or start a debate and mooting culture early; it is the single best training for advocacy.',
        'Talk to lawyers in different practice areas before you pick a university, so you understand which fields are actually hiring.',
      ],
      projects: [
        {
          level: 'beginner',
          ideas: [
            'Write plain-language explainers of recent Nigerian court judgments',
            'Run a school debate series on legal issues',
            'Draft a mock contract or will for practice',
          ],
        },
        {
          level: 'intermediate',
          ideas: [
            'Publish case summaries on a blog or LinkedIn',
            'Volunteer with a legal aid or rights organisation',
            'Organise a law career talk with alumni at your school',
          ],
        },
        {
          level: 'advanced',
          ideas: [
            'Write a note or article on a topical Nigerian legal issue with a mentor',
            'Draft a compliance checklist for a small business under the NDPA',
            'Moot competitively at national level',
          ],
        },
      ],
    },
    internationalTransferability: {
      intro: 'Law is jurisdiction-specific, so international transfer requires conversion exams or a second qualification. The skills transfer; the licence does not.',
      destinations: [
        { country: 'United Kingdom', note: 'Conversion routes (QLTS / SQE) let Nigerian lawyers requalify; UK firms value common-law training.' },
        { country: 'Other common-law countries', note: 'Ghana, Kenya, South Africa and Caribbean jurisdictions offer conversion routes for common-law-trained lawyers.' },
        { country: 'International organisations', note: 'UN, AU and compliance roles value Nigerian legal training combined with international law or policy experience.' },
        { country: 'Global compliance roles', note: 'Anti-money-laundering, sanctions and data protection roles in global companies are open to strong Nigerian legal professionals.' },
      ],
    },
    evidence: [
      {
        source: 'Propeida editorial review',
        title: 'V1 opportunity assessment (curated)',
        url: null,
        publishedAt: null,
        accessedAt: '2026-08-19',
        claim: 'Demand and outlook labels for this career are editorial assessments for V1. They will be replaced with cited sources as evidence is collected.',
      },
    ],
    lastReviewed: '2026-08-19',
  },

  'electrical-engineer': {
    careerSlug: 'electrical-engineer',
    demand: {
      level: 'high',
      summary:
        'Electrical engineers sit at the centre of Nigeria\u2019s most active infrastructure conversations: power generation and distribution, renewable energy installations, telecoms, manufacturing and construction all need them. Power-sector reform and the rapid spread of solar and backup power systems keep the demand wide and persistent.',
      evidenceNote:
        'Editorial assessment based on persistent recruitment across power, energy, telecoms and construction (V1 curated data). No counts or percentages are claimed.',
    },
    outlook: {
      level: 'growing',
      basis: 'trend',
      horizon: '2026 to 2031',
      summary:
        'Electricity market reforms, expanding renewable energy (especially solar) and infrastructure renewal are visible growth drivers. The role is broadening: modern electrical engineers increasingly pair power skills with digital skills such as smart metering, automation and data.',
      drivers: [
        {
          label: 'Power sector reform',
          note: 'Privatisation and market reform keep generation, transmission and distribution busy.',
          scene: 'power',
        },
        {
          label: 'Solar and renewables',
          note: 'Residential, commercial and utility-scale solar is the fastest-growing installation market.',
          scene: 'solar',
        },
        {
          label: 'Infrastructure renewal',
          note: 'Construction, telecoms and manufacturing need electrical design and maintenance on site.',
          scene: 'construction',
        },
        {
          label: 'Smart and digital systems',
          note: 'Smart metering, automation and instrumentation broaden what an electrical engineer does.',
          scene: 'automation',
        },
      ],
    },
    sectors: [
      'power-energy',
      'renewable-energy',
      'telecommunications',
      'manufacturing',
      'oil-gas',
      'construction',
      'automation-control',
      'technology',
      'infrastructure',
      'research',
    ],
    employerTypes: [
      'power-generation-companies',
      'distribution-companies',
      'telecom-operators',
      'manufacturing-companies',
      'engineering-consultancies',
      'construction-companies',
      'oil-gas-companies',
      'renewable-energy-companies',
      'technology-companies',
      'government-agencies',
      'research-institutions',
      'startups',
    ],
    nigerianReality:
      'This is a hands-on career in Nigeria: employers value practical skills like wiring, fault-finding, instrumentation and site work, often before paper credentials. Entry commonly flows through internships and industrial training (SIWES), and graduates who can install, maintain and troubleshoot solar and power systems find work faster than those with theory alone. Field travel and site conditions are normal parts of the job.',
    dayInCareer: [
      {
        time: '07:30',
        activity: 'Site inspection',
        detail: 'Start on site checking installations, safety compliance and contractor work quality.',
        scene: 'construction',
      },
      {
        time: '09:30',
        activity: 'Design and drawings',
        detail: 'Review electrical designs, load calculations and single-line diagrams for projects.',
        scene: 'power',
      },
      {
        time: '12:30',
        activity: 'Testing and commissioning',
        detail: 'Run tests on panels, inverters or metering systems; log results and resolve faults.',
        scene: 'automation',
      },
      {
        time: '15:00',
        activity: 'Team coordination',
        detail: 'Sync with contractors, suppliers and project teams on materials and schedules.',
        scene: 'briefcase',
      },
      {
        time: '17:00',
        activity: 'Reports and planning',
        detail: 'Write progress and incident reports, then plan the next day\u2019s work order.',
        scene: 'devices',
      },
    ],
    employability: {
      intro: 'Theory gets you the degree; the practical and digital layers are what employers actually screen for.',
      skills: [
        {
          name: 'Circuit theory and power systems',
          group: 'core',
          importance: 'essential',
          why: 'Everything else builds on understanding how current, voltage, power and protection work, from the grid to a circuit board.',
          connectsTo: { specializations: ['Power systems', 'Electronics'], sectors: ['power-energy', 'renewable-energy'], roles: ['Power Engineer', 'Design Engineer'] },
        },
        {
          name: 'Electrical installation and safety',
          group: 'practical',
          importance: 'essential',
          why: 'Installation standards, earthing, protection and safety codes are non-negotiable on Nigerian sites and inspections.',
        },
        {
          name: 'Solar and renewable energy design',
          group: 'practical',
          importance: 'essential',
          why: 'Solar PV sizing, installation and maintenance is one of the fastest routes to work in Nigeria today, in residential, commercial and utility segments.',
          connectsTo: { specializations: ['Renewable energy'], sectors: ['renewable-energy', 'construction'], roles: ['Solar Engineer', 'Project Engineer'] },
        },
        {
          name: 'Control systems and automation',
          group: 'practical',
          importance: 'valuable',
          why: 'PLC and instrumentation skills are in demand across manufacturing and process industries, where downtime is expensive.',
          connectsTo: { specializations: ['Automation & control'], sectors: ['manufacturing', 'oil-gas', 'automation-control'], roles: ['Control Engineer', 'Instrumentation Engineer'] },
        },
        {
          name: 'Programming and data basics',
          group: 'modern',
          importance: 'valuable',
          why: 'Python, C and data analysis increasingly appear in power and automation roles, from smart metering to predictive maintenance.',
          connectsTo: { specializations: ['Power systems', 'Smart grids'], sectors: ['power-energy', 'technology'], roles: ['Smart Grid Engineer', 'Data Analyst'] },
        },
        {
          name: 'Project and site management',
          group: 'professional',
          importance: 'valuable',
          why: 'Large electrical projects run on budgets, timelines and teams. Engineers who can manage site work advance faster than pure technicians.',
        },
        {
          name: 'Communication and documentation',
          group: 'professional',
          importance: 'essential',
          why: 'Reports, drawings and client explanations are part of every role, from consultancy to utility work.',
        },
      ],
    },
    learningPath: {
      intro: 'A practical-first path from secondary school to your first engineering role, typically five to six years including the degree.',
      stages: [
        {
          stage: 'foundation',
          title: 'Strong science base',
          whatToDo: 'Physics and mathematics at secondary school are the gate to every engineering programme. Aim high in JAMB/UTME subjects for engineering.',
          skills: ['Physics', 'Mathematics', 'UTME preparation'],
        },
        {
          stage: 'build',
          title: 'Degree and industrial training',
          whatToDo: 'Complete your BEng/BSc in electrical or electronics engineering. Take SIWES seriously: the internship experience is what employers check first.',
          skills: ['Degree coursework', 'SIWES internship', 'Laboratory and project work'],
        },
        {
          stage: 'specialize',
          title: 'Pick your lane',
          whatToDo: 'Choose between power systems, renewable energy, automation, electronics or telecoms. Certification and practical projects matter here more than class rank.',
          skills: ['One specialisation in depth', 'Solar PV design certification', 'PLC / instrumentation practice'],
        },
        {
          stage: 'employable',
          title: 'Prove it on site',
          whatToDo: 'Apply for trainee and graduate roles across utilities, telecoms, construction and solar companies. A portfolio of installations or projects you have done makes the difference.',
          skills: ['Application pipeline', 'Portfolio of projects', 'Interview preparation'],
        },
      ],
      specializations: [
        {
          name: 'Power systems',
          chain: ['Foundation', 'Degree', 'Power specialisation', 'Power engineer'],
          sectors: ['power-energy', 'renewable-energy', 'infrastructure'],
          roles: ['Power Engineer', 'Transmission Engineer', 'Protection Engineer'],
        },
        {
          name: 'Renewable energy',
          chain: ['Foundation', 'Degree', 'Solar PV design', 'Solar / renewables engineer'],
          sectors: ['renewable-energy', 'construction'],
          roles: ['Solar Engineer', 'Project Engineer', 'Installation Manager'],
        },
        {
          name: 'Automation and control',
          chain: ['Foundation', 'Degree', 'PLC & instrumentation', 'Control engineer'],
          sectors: ['manufacturing', 'oil-gas', 'automation-control'],
          roles: ['Control Engineer', 'Instrumentation Engineer', 'Maintenance Engineer'],
        },
        {
          name: 'Electronics and embedded systems',
          chain: ['Foundation', 'Degree', 'Electronics specialisation', 'Electronics engineer'],
          sectors: ['technology', 'telecommunications', 'manufacturing'],
          roles: ['Electronics Engineer', 'Embedded Systems Engineer', 'Hardware Designer'],
        },
        {
          name: 'Telecoms engineering',
          chain: ['Foundation', 'Degree', 'Telecoms specialisation', 'Telecom engineer'],
          sectors: ['telecommunications', 'infrastructure'],
          roles: ['Telecom Engineer', 'Radio Engineer', 'Network Engineer'],
        },
      ],
      startHere: [
        'If you are in secondary school, put everything into Physics and Further Mathematics; they are the gatekeepers.',
        'Find out whether your preferred university has functional labs and industry links; it matters more than you think.',
        'Watch how electricity, solar and telecoms systems work in your own neighbourhood; practical curiosity is a real advantage in this field.',
      ],
      projects: [
        {
          level: 'beginner',
          ideas: [
            'Build a simple battery or solar-powered lighting system',
            'Learn to read electrical wiring diagrams and single-line diagrams',
            'Repair and repurpose small household electronics with supervision',
          ],
        },
        {
          level: 'intermediate',
          ideas: [
            'Design and build a small solar PV system for a home or shop, from sizing to installation',
            'Build a basic Arduino or microcontroller project such as an automated switch',
            'Wire and test a control panel for a simple machine in a workshop',
          ],
        },
        {
          level: 'advanced',
          ideas: [
            'Design a smart metering or energy-monitoring demo for a facility',
            'Undertake an energy audit of a building and propose savings with a mentor',
            'Develop a mini substation protection or automation design project',
          ],
        },
      ],
    },
    internationalTransferability: {
      intro: 'Electrical engineering is recognised worldwide, and Nigerian-trained engineers work across Africa, the Gulf and beyond. Certification and registration travel with you when documented.',
      destinations: [
        { country: 'Middle East', note: 'The Gulf is a long-standing destination for Nigerian electrical engineers, especially in power, construction and oil & gas.' },
        { country: 'United Kingdom & Europe', note: 'Registration with engineering bodies (for example IET pathways) supports migration routes; experience in power and renewables is valued.' },
        { country: 'Other African markets', note: 'Kenya, Ghana, Rwanda and South Africa recruit electrical engineers for energy and infrastructure projects.' },
        { country: 'Canada', note: 'Provincial engineering licensure (P.Eng) is a recognised route for experienced engineers.' },
      ],
    },
    evidence: [
      {
        source: 'Propeida editorial review',
        title: 'V1 opportunity assessment (curated)',
        url: null,
        publishedAt: null,
        accessedAt: '2026-08-19',
        claim: 'Demand and outlook labels for this career are editorial assessments for V1. They will be replaced with cited sources as evidence is collected.',
      },
    ],
    lastReviewed: '2026-08-19',
  },
}

export function getCareerOpportunity(careerSlug: string): CareerOpportunity | null {
  return OPPORTUNITIES[careerSlug] ?? null
}

export function demandLabel(level: DemandLevel): string {
  return DEMAND_LABELS[level]
}

export function sectorNames(slugs: string[]): string[] {
  return slugs.map((slug) => SECTORS[slug]?.name ?? slug)
}

export function employerTypeNames(slugs: string[]): string[] {
  return slugs.map((slug) => EMPLOYER_TYPES[slug] ?? slug)
}

export function firstSentence(text: string): string {
  const dot = text.indexOf('. ')
  if (dot === -1) return text
  return text.slice(0, dot + 1)
}
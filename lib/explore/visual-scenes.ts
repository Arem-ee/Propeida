export type SceneKey =
  | 'power'
  | 'solar'
  | 'telecom'
  | 'factory'
  | 'oilgas'
  | 'construction'
  | 'automation'
  | 'circuit'
  | 'health'
  | 'lab'
  | 'court'
  | 'code'
  | 'devices'
  | 'finance'
  | 'education'
  | 'media'
  | 'estate'
  | 'retail'
  | 'transport'
  | 'research'
  | 'mining'
  | 'public'
  | 'agriculture'
  | 'startup'
  | 'seedling'
  | 'tools'
  | 'compass'
  | 'briefcase'
  | 'rocket'
  | 'generic'

export const SCENE_NAMES: Record<SceneKey, string> = {
  power: 'Power grid',
  solar: 'Solar fields',
  telecom: 'Telecommunications',
  factory: 'Manufacturing',
  oilgas: 'Oil and gas',
  construction: 'Construction',
  automation: 'Automation and control',
  circuit: 'Electronics',
  health: 'Healthcare',
  lab: 'Laboratory',
  court: 'Law and justice',
  code: 'Software',
  devices: 'Connected devices',
  finance: 'Banking and finance',
  education: 'Education',
  media: 'Media and communication',
  estate: 'Real estate',
  retail: 'Commerce',
  transport: 'Transport and logistics',
  research: 'Research',
  mining: 'Mining and minerals',
  public: 'Public service',
  agriculture: 'Agriculture',
  startup: 'Startups',
  seedling: 'Early foundations',
  tools: 'Building skills',
  compass: 'Choosing a direction',
  briefcase: 'Professional work',
  rocket: 'Launching',
  generic: 'Open horizon',
}

export const DEFAULT_SCENE: SceneKey = 'generic'

export const SECTOR_SCENES: Record<string, SceneKey> = {
  'power-energy': 'power',
  'renewable-energy': 'solar',
  telecommunications: 'telecom',
  manufacturing: 'factory',
  'oil-gas': 'oilgas',
  construction: 'construction',
  'automation-control': 'automation',
  technology: 'code',
  infrastructure: 'transport',
  research: 'lab',
  'banking-finance': 'finance',
  healthcare: 'health',
  agriculture: 'agriculture',
  education: 'education',
  'public-service': 'public',
  'media-communication': 'media',
  'real-estate': 'estate',
  'e-commerce': 'retail',
  fmcg: 'retail',
  'transport-logistics': 'transport',
  startups: 'startup',
  'mining-solid-minerals': 'mining',
}

export const STAGE_SCENES: Record<'foundation' | 'build' | 'specialize' | 'employable', SceneKey> = {
  foundation: 'seedling',
  build: 'tools',
  specialize: 'compass',
  employable: 'briefcase',
}

export const PROJECT_SCENES: Record<'beginner' | 'intermediate' | 'advanced', SceneKey> = {
  beginner: 'seedling',
  intermediate: 'tools',
  advanced: 'rocket',
}

export const CAREER_SCENES: Record<string, SceneKey> = {
  'software-engineer': 'code',
  'medical-doctor': 'health',
  lawyer: 'court',
  'electrical-engineer': 'power',
}

export const CATEGORY_SCENES: Record<string, SceneKey> = {
  Technology: 'code',
  Engineering: 'circuit',
  'Medicine & Health': 'health',
  'Business & Finance': 'finance',
  Law: 'court',
  'Science & Research': 'lab',
  'Arts & Design': 'devices',
  'Media & Communication': 'media',
  Education: 'education',
  Agriculture: 'agriculture',
  'Public Service': 'public',
}

export type AccentKey =
  | 'amber'
  | 'violet'
  | 'teal'
  | 'indigo'
  | 'emerald'
  | 'sky'
  | 'fuchsia'
  | 'rose'
  | 'cyan'
  | 'lime'
  | 'slate'
  | 'blue'

export interface AccentStyles {
  solid: string
  deep: string
  soft: string
  icon: string
  chip: string
  gradient: string
  ring: string
}

export const ACCENT_STYLES: Record<AccentKey, AccentStyles> = {
  amber: {
    solid: 'bg-amber-500',
    deep: 'text-amber-700',
    soft: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-700',
    chip: 'bg-amber-50 text-amber-800',
    gradient: 'from-amber-50 to-white',
    ring: 'ring-amber-200',
  },
  violet: {
    solid: 'bg-violet-500',
    deep: 'text-violet-700',
    soft: 'bg-violet-50',
    icon: 'bg-violet-100 text-violet-700',
    chip: 'bg-violet-50 text-violet-800',
    gradient: 'from-violet-50 to-white',
    ring: 'ring-violet-200',
  },
  teal: {
    solid: 'bg-teal-500',
    deep: 'text-teal-700',
    soft: 'bg-teal-50',
    icon: 'bg-teal-100 text-teal-700',
    chip: 'bg-teal-50 text-teal-800',
    gradient: 'from-teal-50 to-white',
    ring: 'ring-teal-200',
  },
  indigo: {
    solid: 'bg-indigo-500',
    deep: 'text-indigo-700',
    soft: 'bg-indigo-50',
    icon: 'bg-indigo-100 text-indigo-700',
    chip: 'bg-indigo-50 text-indigo-800',
    gradient: 'from-indigo-50 to-white',
    ring: 'ring-indigo-200',
  },
  emerald: {
    solid: 'bg-emerald-500',
    deep: 'text-emerald-700',
    soft: 'bg-emerald-50',
    icon: 'bg-emerald-100 text-emerald-700',
    chip: 'bg-emerald-50 text-emerald-800',
    gradient: 'from-emerald-50 to-white',
    ring: 'ring-emerald-200',
  },
  sky: {
    solid: 'bg-sky-500',
    deep: 'text-sky-700',
    soft: 'bg-sky-50',
    icon: 'bg-sky-100 text-sky-700',
    chip: 'bg-sky-50 text-sky-800',
    gradient: 'from-sky-50 to-white',
    ring: 'ring-sky-200',
  },
  fuchsia: {
    solid: 'bg-fuchsia-500',
    deep: 'text-fuchsia-700',
    soft: 'bg-fuchsia-50',
    icon: 'bg-fuchsia-100 text-fuchsia-700',
    chip: 'bg-fuchsia-50 text-fuchsia-800',
    gradient: 'from-fuchsia-50 to-white',
    ring: 'ring-fuchsia-200',
  },
  rose: {
    solid: 'bg-rose-500',
    deep: 'text-rose-700',
    soft: 'bg-rose-50',
    icon: 'bg-rose-100 text-rose-700',
    chip: 'bg-rose-50 text-rose-800',
    gradient: 'from-rose-50 to-white',
    ring: 'ring-rose-200',
  },
  cyan: {
    solid: 'bg-cyan-500',
    deep: 'text-cyan-700',
    soft: 'bg-cyan-50',
    icon: 'bg-cyan-100 text-cyan-700',
    chip: 'bg-cyan-50 text-cyan-800',
    gradient: 'from-cyan-50 to-white',
    ring: 'ring-cyan-200',
  },
  lime: {
    solid: 'bg-lime-500',
    deep: 'text-lime-700',
    soft: 'bg-lime-50',
    icon: 'bg-lime-100 text-lime-700',
    chip: 'bg-lime-50 text-lime-800',
    gradient: 'from-lime-50 to-white',
    ring: 'ring-lime-200',
  },
  slate: {
    solid: 'bg-slate-500',
    deep: 'text-slate-700',
    soft: 'bg-slate-50',
    icon: 'bg-slate-100 text-slate-700',
    chip: 'bg-slate-50 text-slate-800',
    gradient: 'from-slate-50 to-white',
    ring: 'ring-slate-200',
  },
  blue: {
    solid: 'bg-blue-500',
    deep: 'text-blue-700',
    soft: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-700',
    chip: 'bg-blue-50 text-blue-800',
    gradient: 'from-blue-50 to-white',
    ring: 'ring-blue-200',
  },
}

export const DEFAULT_ACCENT: AccentKey = 'blue'

export const CAREER_ACCENTS: Record<string, AccentKey> = {
  'software-engineer': 'violet',
  'medical-doctor': 'teal',
  lawyer: 'indigo',
  'electrical-engineer': 'amber',
}

export const CATEGORY_ACCENTS: Record<string, AccentKey> = {
  Technology: 'violet',
  Engineering: 'amber',
  'Medicine & Health': 'teal',
  'Business & Finance': 'emerald',
  Law: 'indigo',
  'Science & Research': 'sky',
  'Arts & Design': 'fuchsia',
  'Media & Communication': 'rose',
  Education: 'cyan',
  Agriculture: 'lime',
  'Public Service': 'slate',
}

export type ResolvedVisual =
  | { kind: 'asset'; src: string; alt: string }
  | { kind: 'scene'; scene: SceneKey; alt: string }
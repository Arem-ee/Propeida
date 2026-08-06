export type OrganizationType = 'secondary_school' | 'tutorial_center' | 'foundation' | 'state' | 'university' | 'other'

export const ORGANIZATION_TYPES: { value: OrganizationType; label: string }[] = [
  { value: 'secondary_school', label: 'Secondary school' },
  { value: 'tutorial_center', label: 'Tutorial center / lesson class' },
  { value: 'foundation', label: 'Foundation / NGO' },
  { value: 'state', label: 'State / government mock exam program' },
  { value: 'other', label: 'Other' },
]

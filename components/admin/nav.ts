import {
  LayoutDashboard,
  Inbox,
  Library,
  Upload,
  BookOpen,
  GraduationCap,
  School,
  CalendarClock,
  Tags,
  Mail,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Key of a live count rendered as a badge next to the item */
  badgeKey?: 'review' | 'contact'
}

export interface AdminNavGroup {
  label: string
  items: AdminNavItem[]
}

/**
 * The admin in order of operation.
 * Overview → Content (import, review, publish) → Setup → Audience.
 * The review queue is the daily driver and carries a live count.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/questions/review', label: 'Review queue', icon: Inbox, badgeKey: 'review' },
      { href: '/admin/questions', label: 'Question bank', icon: Library },
      { href: '/admin/questions/upload', label: 'Import', icon: Upload },
      { href: '/admin/lessons', label: 'Lessons', icon: BookOpen },
    ],
  },
  {
    label: 'Setup',
    items: [
      { href: '/admin/exams', label: 'Exams', icon: GraduationCap },
      { href: '/admin/schools', label: 'Schools & screenings', icon: School },
      { href: '/admin/cycles', label: 'Exam cycles', icon: CalendarClock },
      { href: '/admin/codes', label: 'Misconception codes', icon: Tags },
    ],
  },
  {
    label: 'Audience',
    items: [
      { href: '/admin/contact-submissions', label: 'Contact messages', icon: Mail, badgeKey: 'contact' },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
]

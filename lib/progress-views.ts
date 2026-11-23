/** Shared by the server page and the client tab strip. Never import this
 *  from a 'use client' module and re-export it: client boundaries turn
 *  exports into references, not values. */

export const PROGRESS_VIEWS = [
  { id: 'overview', label: 'Overview' },
  { id: 'recall', label: 'Recall' },
  { id: 'history', label: 'History' },
] as const

export type ProgressView = (typeof PROGRESS_VIEWS)[number]['id']

export function parseProgressView(value: string | string[] | undefined): ProgressView {
  const raw = Array.isArray(value) ? value[0] : value
  return PROGRESS_VIEWS.some((view) => view.id === raw) ? (raw as ProgressView) : 'overview'
}

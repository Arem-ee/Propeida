import { cache } from 'react'
import { getLessonByPath } from '@/lib/actions/lessons'

/**
 * Request-scoped dedupe for the lesson loader.
 *
 * Next.js calls generateMetadata() and the page component separately in the
 * same request; without cache() the full lesson (blocks, enhancement,
 * ownership and paywall checks) was loaded twice. React cache() shares the
 * result for one request but never across requests or users.
 */
export const loadLessonByPath = cache(getLessonByPath)

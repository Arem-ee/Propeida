import { NextResponse } from 'next/server'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import type { FeedEntityType } from '@/lib/explore/feed-types'

export const dynamic = 'force-dynamic'

const ACTIONS = ['view', 'click', 'save', 'follow', 'dismiss', 'share'] as const
const ENTITY_TYPES: FeedEntityType[] = ['career', 'course', 'university']

function parseEntity(body: {
  entityType?: unknown
  entityId?: unknown
  action?: unknown
}): { entityType: FeedEntityType; entityId: string; action: string } | null {
  const entityType = body.entityType
  const entityId = typeof body.entityId === 'string' ? body.entityId.trim() : ''
  const action = body.action
  if (
    !ENTITY_TYPES.includes(entityType as FeedEntityType) ||
    !ACTIONS.includes(action as (typeof ACTIONS)[number]) ||
    entityId.length === 0
  ) {
    return null
  }
  return { entityType: entityType as FeedEntityType, entityId, action: action as string }
}

export async function POST(request: Request) {
  let body: { entityType?: unknown; entityId?: unknown; action?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const parsed = parseEntity(body)
  if (!parsed) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return NextResponse.json({ ok: false, requiresAuth: true }, { status: 401 })

  const { error } = await supabase
    .from('explore_interactions')
    .insert({
      user_id: user.id,
      entity_type: parsed.entityType,
      entity_id: parsed.entityId,
      action: parsed.action,
    })

  if (error && error.code !== '23505') {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = parseEntity({
    entityType: searchParams.get('entityType') ?? undefined,
    entityId: searchParams.get('entityId') ?? undefined,
    action: searchParams.get('action') ?? undefined,
  })
  if (!parsed) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return NextResponse.json({ ok: false, requiresAuth: true }, { status: 401 })

  const { error } = await supabase
    .from('explore_interactions')
    .delete()
    .eq('user_id', user.id)
    .eq('entity_type', parsed.entityType)
    .eq('entity_id', parsed.entityId)
    .eq('action', parsed.action)

  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = await createClient()
  const user = await getAuthUser(supabase)
  if (!user) return NextResponse.json({ ok: false, requiresAuth: true }, { status: 401 })

  const { data } = await supabase
    .from('explore_interactions')
    .select('entity_type, entity_id, action')
    .eq('user_id', user.id)
    .in('action', ['save', 'follow'])

  const rows = (data ?? []) as { entity_id: string; action: string }[]
  return NextResponse.json({
    savedIds: rows.filter((r) => r.action === 'save').map((r) => r.entity_id),
    followedIds: rows.filter((r) => r.action === 'follow').map((r) => r.entity_id),
  })
}
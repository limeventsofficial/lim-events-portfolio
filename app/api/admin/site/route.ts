import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/lib/models/SiteSettings'
import { destroyCloudinaryAsset } from '@/lib/cloudinary'
import { ensureDatabaseSeed } from '@/lib/seed'
import type { StatPair, ContactInfo } from '@/types/site'

export const dynamic = 'force-dynamic'

function isStatPair(x: unknown): x is StatPair {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as StatPair).num === 'string' &&
    typeof (x as StatPair).label === 'string'
  )
}

export async function PUT(req: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured' }, { status: 503 })
  }

  await connectDB()
  await ensureDatabaseSeed()

  const prev = await SiteSettings.findById('site').lean()
  const oldHeroPid = prev?.heroCoverPublicId

  const body = await req.json()

  const $set: Record<string, unknown> = {}

  if (typeof body.heroCoverUrl === 'string') $set.heroCoverUrl = body.heroCoverUrl

  if (body.heroCoverPublicId !== undefined) {
    if (body.heroCoverPublicId === null || body.heroCoverPublicId === '') {
      $set.heroCoverPublicId = undefined
    } else if (typeof body.heroCoverPublicId === 'string') {
      $set.heroCoverPublicId = body.heroCoverPublicId
    }
  }

  if (Array.isArray(body.heroStats) && body.heroStats.every(isStatPair)) {
    $set.heroStats = body.heroStats
  }

  if (Array.isArray(body.aboutStats) && body.aboutStats.every(isStatPair)) {
    $set.aboutStats = body.aboutStats
  }

  if (body.contact && typeof body.contact === 'object') {
    const c = body.contact as Partial<ContactInfo>
    const next = {
      address: typeof c.address === 'string' ? c.address : prev?.contact?.address,
      phone: typeof c.phone === 'string' ? c.phone : prev?.contact?.phone,
      email: typeof c.email === 'string' ? c.email : prev?.contact?.email,
    }
    if (next.address && next.phone && next.email) {
      $set.contact = next
    }
  }

  if (typeof body.siteYear === 'number' && Number.isFinite(body.siteYear)) {
    $set.siteYear = Math.round(body.siteYear)
  }

  const updated = await SiteSettings.findByIdAndUpdate('site', { $set }, { new: true }).lean()

  if (oldHeroPid) {
    if (typeof body.heroCoverPublicId === 'string' && body.heroCoverPublicId !== oldHeroPid) {
      await destroyCloudinaryAsset(oldHeroPid)
    } else if (body.heroCoverPublicId === null || body.heroCoverPublicId === '') {
      await destroyCloudinaryAsset(oldHeroPid)
    }
  }

  return NextResponse.json({ site: updated })
}

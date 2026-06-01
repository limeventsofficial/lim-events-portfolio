import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Work } from '@/lib/models/Work'
import { ensureDatabaseSeed } from '@/lib/seed'
import { destroyCloudinaryAsset } from '@/lib/cloudinary'
import mongoose from 'mongoose'
import { normalizeWorkTitle, normalizeWorkLine } from '@/lib/work-fields'
import { isPhoto, parseServiceId, toWorkClient, validateWorkPayload } from '@/lib/work-mapper'
import type { WorkPhoto } from '@/lib/work-constants'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }
type PhotoIn = WorkPhoto

export async function PUT(req: Request, { params }: Ctx) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured' }, { status: 503 })
  }

  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  await connectDB()
  await ensureDatabaseSeed()

  const prev = await Work.findById(params.id).lean()
  if (!prev) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const validation = validateWorkPayload(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const serviceId = parseServiceId(body.serviceId)!
  const $set: Record<string, unknown> = {
    serviceCat: new mongoose.Types.ObjectId(serviceId),
    story: typeof body.story === 'string' ? body.story.trim() : '',
  }

  if (typeof body.title === 'string') $set.title = normalizeWorkTitle(body.title)
  if (typeof body.date === 'string') $set.date = normalizeWorkLine(body.date)
  if (typeof body.venue === 'string') $set.venue = normalizeWorkLine(body.venue)
  if (typeof body.order === 'number') $set.order = body.order

  if (Array.isArray(body.photos) && body.photos.every(isPhoto)) {
    const oldPublicIds = (prev.photos || [])
      .map((p) => p.publicId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
    const nextPhotos = body.photos as PhotoIn[]
    const nextIds = new Set(
      nextPhotos.map((p: PhotoIn) => p.publicId).filter((id): id is string => typeof id === 'string' && id.length > 0)
    )
    for (let i = 0; i < oldPublicIds.length; i++) {
      const pid = oldPublicIds[i]
      if (!nextIds.has(pid)) {
        await destroyCloudinaryAsset(pid)
      }
    }
    $set.photos = nextPhotos
  }

  if (body.featured === true) {
    await Work.updateMany({ _id: { $ne: new mongoose.Types.ObjectId(params.id) } }, { $set: { featured: false } })
    $set.featured = true
  } else if (body.featured === false) {
    $set.featured = false
  }

  const updated = await Work.findByIdAndUpdate(params.id, { $set }, { new: true }).lean()

  // Revalidate public pages to show updated work immediately
  revalidatePath('/')
  revalidatePath('/services/[slug]')

  return NextResponse.json({ work: toWorkClient(updated!) })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured' }, { status: 503 })
  }

  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  await connectDB()
  const prev = await Work.findById(params.id).lean()
  if (!prev) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  for (const p of prev.photos || []) {
    await destroyCloudinaryAsset(p.publicId)
  }

  await Work.findByIdAndDelete(params.id)

  // Revalidate public pages to reflect deletion
  revalidatePath('/')
  revalidatePath('/services/[slug]')

  return NextResponse.json({ ok: true })
}

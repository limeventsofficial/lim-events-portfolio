import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Work } from '@/lib/models/Work'
import { ensureDatabaseSeed } from '@/lib/seed'
import { normalizeWorkTitle, normalizeWorkLine } from '@/lib/work-fields'
import { parseServiceId, toWorkClient, validateWorkPayload } from '@/lib/work-mapper'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured' }, { status: 503 })
  }

  await connectDB()
  await ensureDatabaseSeed()

  const body = await req.json()
  const validation = validateWorkPayload(body)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const serviceId = parseServiceId(body.serviceId)!
  const { story, featured, order, photos } = body

  const title = normalizeWorkTitle(body.title)
  const date = normalizeWorkLine(body.date)
  const venue = normalizeWorkLine(body.venue)

  const maxOrder = await Work.findOne().sort({ order: -1 }).select('order').lean()
  const nextOrder = typeof order === 'number' ? order : (maxOrder?.order ?? -1) + 1

  if (featured === true) {
    await Work.updateMany({}, { $set: { featured: false } })
  }

  const doc = await Work.create({
    title,
    date,
    venue,
    serviceCat: new mongoose.Types.ObjectId(serviceId),
    story: story.trim(),
    photos,
    featured: Boolean(featured),
    order: nextOrder,
  })

  return NextResponse.json({ work: toWorkClient(doc.toObject()) })
}

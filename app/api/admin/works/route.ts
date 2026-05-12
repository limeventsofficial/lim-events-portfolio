import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Work } from '@/lib/models/Work'
import { ensureDatabaseSeed } from '@/lib/seed'
import { normalizeWorkTitle, normalizeWorkLine } from '@/lib/work-fields'

export const dynamic = 'force-dynamic'

type PhotoIn = { url: string; publicId?: string }

function isPhoto(x: unknown): x is PhotoIn {
  return typeof x === 'object' && x !== null && typeof (x as PhotoIn).url === 'string'
}

export async function POST(req: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured' }, { status: 503 })
  }

  await connectDB()
  await ensureDatabaseSeed()

  const body = await req.json()
  const { story, featured, order, photos } = body

  const title = normalizeWorkTitle(body.title)
  const date = normalizeWorkLine(body.date)
  const venue = normalizeWorkLine(body.venue)

  const photoList: PhotoIn[] = Array.isArray(photos) && photos.every(isPhoto) ? photos : []

  const maxOrder = await Work.findOne().sort({ order: -1 }).select('order').lean()
  const nextOrder = typeof order === 'number' ? order : (maxOrder?.order ?? -1) + 1

  if (featured === true) {
    await Work.updateMany({}, { $set: { featured: false } })
  }

  const doc = await Work.create({
    title,
    date,
    venue,
    story: typeof story === 'string' ? story : '',
    photos: photoList,
    featured: Boolean(featured),
    order: nextOrder,
  })

  return NextResponse.json({ work: doc.toObject() })
}

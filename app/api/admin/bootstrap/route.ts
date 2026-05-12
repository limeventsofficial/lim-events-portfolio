import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import { SiteSettings } from '@/lib/models/SiteSettings'
import { Service } from '@/lib/models/Service'
import { Work } from '@/lib/models/Work'
import { ensureDatabaseSeed } from '@/lib/seed'

export const dynamic = 'force-dynamic'

export async function GET() {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured' }, { status: 503 })
  }

  await connectDB()
  await ensureDatabaseSeed()

  const site = await SiteSettings.findById('site').lean()
  const services = await Service.find().sort({ order: 1 }).lean()
  const works = await Work.find().sort({ order: 1, createdAt: -1 }).lean()

  return NextResponse.json({
    site,
    services,
    works,
  })
}

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Service } from '@/lib/models/Service'
import { ensureDatabaseSeed } from '@/lib/seed'

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
  const { icon, title, desc, color, order } = body

  if (typeof title !== 'string' || typeof desc !== 'string') {
    return NextResponse.json({ error: 'Invalid service payload' }, { status: 400 })
  }

  const maxOrder = await Service.findOne().sort({ order: -1 }).select('order').lean()
  const nextOrder = typeof order === 'number' ? order : (maxOrder?.order ?? -1) + 1

  const doc = await Service.create({
    order: nextOrder,
    icon: typeof icon === 'string' ? icon : '✦',
    title,
    desc,
    color: typeof color === 'string' ? color : '#fde8d8',
  })

  return NextResponse.json({ service: doc.toObject() })
}

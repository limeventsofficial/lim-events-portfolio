import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Service } from '@/lib/models/Service'
import { ensureDatabaseSeed } from '@/lib/seed'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

type Ctx = { params: { id: string } }

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

  const body = await req.json()
  const $set: Record<string, unknown> = {}

  if (typeof body.icon === 'string') $set.icon = body.icon
  if (typeof body.title === 'string') $set.title = body.title
  if (typeof body.desc === 'string') $set.desc = body.desc
  if (typeof body.color === 'string') $set.color = body.color
  if (typeof body.order === 'number') $set.order = body.order

  const updated = await Service.findByIdAndUpdate(params.id, { $set }, { new: true }).lean()
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ service: updated })
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
  await Service.findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}

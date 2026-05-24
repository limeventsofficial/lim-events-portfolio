import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { Service } from '@/lib/models/Service'
import { ensureDatabaseSeed } from '@/lib/seed'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured' }, { status: 503 })
  }

  await connectDB()
  await ensureDatabaseSeed()

  const body = await req.json()
  const ids = body.ids

  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string' && mongoose.isValidObjectId(id))) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
  }

  const ops = ids.map((id: string, index: number) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id) },
      update: { $set: { order: index } },
    },
  }))

  if (ops.length > 0) {
    await Service.bulkWrite(ops)
  }

  const services = await Service.find().sort({ order: 1 }).lean()

  return NextResponse.json({
    services: services.map((s) => ({ ...s, _id: String(s._id) })),
  })
}

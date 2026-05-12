import { NextResponse } from 'next/server'
import { isAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const ok = await isAdminSession()
  return NextResponse.json({ ok })
}

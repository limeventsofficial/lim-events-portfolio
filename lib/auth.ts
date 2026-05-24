import { SignJWT, jwtVerify } from 'jose'
import { timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE = 'lim_admin_session'

function getSecret() {
  const s = process.env.SESSION_SECRET
  if (process.env.NODE_ENV === 'development' && (!s || s.length < 16)) {
    return new TextEncoder().encode('lim-events-dev-session-secret-key')
  }
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET must be set (min 16 characters)')
  }
  return new TextEncoder().encode(s)
}

export function verifyPassword(plain: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  console.log(expected, plain)
  if (!expected || !plain) return false
  const a = Buffer.from(plain, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function isAdminSession(): Promise<boolean> {
  const token = cookies().get(COOKIE)?.value
  if (!token) return false
  return verifySessionToken(token)
}

export function sessionCookieName() {
  return COOKIE 
}

export async function requireAdmin(): Promise<NextResponse | null> {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

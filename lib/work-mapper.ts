import mongoose from 'mongoose'
import { MAX_WORK_PHOTOS, type WorkPhoto } from '@/lib/work-constants'

export type { WorkPhoto }
export { MAX_WORK_PHOTOS }

export type WorkClient = {
  _id: string
  title: string
  date: string
  venue: string
  photos: WorkPhoto[]
  story: string
  featured: boolean
  order: number
  serviceId: string
}

type WorkLean = {
  _id: unknown
  title?: string
  date?: string
  venue?: string
  photos?: WorkPhoto[]
  story?: string
  featured?: boolean
  order?: number
  serviceCat?: unknown
}

export function toWorkClient(doc: WorkLean): WorkClient {
  return {
    _id: String(doc._id),
    title: doc.title ?? '',
    date: doc.date ?? '',
    venue: doc.venue ?? '',
    photos: (doc.photos ?? []).map((p) => ({ url: p.url, publicId: p.publicId })),
    story: doc.story ?? '',
    featured: Boolean(doc.featured),
    order: doc.order ?? 0,
    serviceId: doc.serviceCat ? String(doc.serviceCat) : '',
  }
}

export function parseServiceId(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  if (!mongoose.isValidObjectId(value)) return null
  return value
}

export function isPhoto(x: unknown): x is WorkPhoto {
  return typeof x === 'object' && x !== null && typeof (x as WorkPhoto).url === 'string'
}

export function validateWorkPayload(body: {
  serviceId?: unknown
  story?: unknown
  photos?: unknown
}): { ok: true } | { ok: false; error: string } {
  const serviceId = parseServiceId(body.serviceId)
  if (!serviceId) return { ok: false, error: 'Service is required' }

  if (typeof body.story !== 'string' || !body.story.trim()) {
    return { ok: false, error: 'Description is required' }
  }

  if (!Array.isArray(body.photos) || !body.photos.every(isPhoto)) {
    return { ok: false, error: 'Invalid photos' }
  }

  if (body.photos.length < 1) return { ok: false, error: 'At least 1 image required' }
  if (body.photos.length > MAX_WORK_PHOTOS) return { ok: false, error: 'No more than 3 photos allowed' }

  return { ok: true }
}

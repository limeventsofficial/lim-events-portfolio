import type { WorkPhoto } from '@/lib/work-constants'

export type StatPair = { num: string; label: string }
export type ContactInfo = { address: string; phone: string; email: string }

export type SiteDoc = {
  _id?: string
  heroCoverUrl: string
  heroCoverPublicId?: string
  heroStats: StatPair[]
  aboutStats: StatPair[]
  contact: ContactInfo
  siteYear: number
}

export type ServiceDoc = {
  _id: string
  order: number
  icon: string
  title: string
  desc: string
  color: string
}

export type WorkDoc = {
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

export type Tab = 'site' | 'services' | 'works'

export type DeleteTarget =
  | { type: 'service'; id: string; label: string }
  | { type: 'work'; id: string; label: string }

export type ServiceDraft = {
  icon: string
  title: string
  desc: string
}

export type WorkDraft = {
  serviceId: string
  story: string
  photos: WorkPhoto[]
  title: string
  date: string
  venue: string
  featured: boolean
  order: number
}

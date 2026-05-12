import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/lib/models/SiteSettings'
import { Service } from '@/lib/models/Service'
import { Work } from '@/lib/models/Work'
import { ensureDatabaseSeed } from '@/lib/seed'
import {
  defaultSiteSettings,
  defaultServicesSeed,
  defaultHeroCard,
  DEFAULT_HERO_COVER,
} from '@/lib/defaults'
import type { PublicSiteData, ServiceDTO, WorkDTO, SiteSettingsDTO } from '@/types/site'

function toServiceDTO(doc: {
  _id: unknown
  order: number
  icon: string
  title: string
  desc: string
  color: string
}): ServiceDTO {
  return {
    _id: String(doc._id),
    order: doc.order,
    icon: doc.icon,
    title: doc.title,
    desc: doc.desc,
    color: doc.color,
  }
}

function toWorkDTO(doc: {
  _id: unknown
  title: string
  date: string
  venue: string
  photos: { url: string; publicId?: string }[]
  story: string
  featured: boolean
  order: number
}): WorkDTO {
  return {
    _id: String(doc._id),
    title: doc.title,
    date: doc.date,
    venue: doc.venue,
    photos: (doc.photos || []).map((p) => ({ url: p.url, publicId: p.publicId })),
    story: doc.story,
    featured: doc.featured,
    order: doc.order,
  }
}

function staticFallback(): PublicSiteData {
  return {
    site: { ...defaultSiteSettings },
    heroCard: { ...defaultHeroCard },
    services: defaultServicesSeed.map((s, i) => ({
      _id: `local-${i}`,
      ...s,
    })),
    works: [],
  }
}

export async function loadPublicSiteData(): Promise<PublicSiteData> {
  if (!process.env.MONGODB_URI) {
    return staticFallback()
  }

  await connectDB()
  await ensureDatabaseSeed()

  const siteDoc = await SiteSettings.findById('site').lean()
  const site: SiteSettingsDTO = siteDoc
    ? {
        heroCoverUrl: siteDoc.heroCoverUrl || DEFAULT_HERO_COVER,
        heroCoverPublicId: siteDoc.heroCoverPublicId,
        heroStats: siteDoc.heroStats?.length ? siteDoc.heroStats : defaultSiteSettings.heroStats,
        aboutStats: siteDoc.aboutStats?.length ? siteDoc.aboutStats : defaultSiteSettings.aboutStats,
        contact: siteDoc.contact || defaultSiteSettings.contact,
        siteYear: siteDoc.siteYear ?? defaultSiteSettings.siteYear,
      }
    : defaultSiteSettings

  const servicesRaw = await Service.find().sort({ order: 1 }).lean()
  const worksRaw = await Work.find().sort({ order: 1, createdAt: -1 }).lean()

  const services: ServiceDTO[] = servicesRaw.map(toServiceDTO)
  const works: WorkDTO[] = worksRaw.map(toWorkDTO)

  const featured = works.find((w) => w.featured)
  const heroCard = featured
    ? { title: featured.title, subtitle: `${featured.date} · ${featured.venue}` }
    : defaultHeroCard

  return {
    site,
    heroCard,
    services,
    works,
  }
}

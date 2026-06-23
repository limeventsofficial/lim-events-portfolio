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
import mongoose from 'mongoose'
function toServiceDTO(
  doc: {
    _id: unknown
    order: number
    icon: string
    title: string
    desc: string
    color: string
  },
  firstWorkImage?: string,
  workCount?: number
): ServiceDTO {
  return {
    _id: String(doc._id),
    order: doc.order,
    icon: doc.icon,
    title: doc.title,
    desc: doc.desc,
    color: doc.color,
    firstWorkImage: firstWorkImage ?? null,
    workCount: workCount ?? 0,
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
  serviceCat?: unknown
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
    serviceId: doc.serviceCat ? String(doc.serviceCat) : '',
  }
}

function staticFallback(): PublicSiteData {
  return {
    site: { ...defaultSiteSettings },
    heroCard: { ...defaultHeroCard },
    services: defaultServicesSeed.map((s, i) => ({
      _id: `local-${i}`,
      firstWorkImage: null,
      workCount: 0,   // ✅ add this
      ...s,
    })),
    works: [],
  }
}

export async function loadPublicSiteData(
  options?: { includeWorks?: boolean; serviceId?: string }
): Promise<PublicSiteData> {
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
// Fetch first work image + count per service in one query
  const serviceIds = servicesRaw.map((s) => s._id)
  const firstWorks = await Work.aggregate([
    { $match: { serviceCat: { $in: serviceIds } } },
    { $sort: { order: 1, createdAt: -1 } },
    {
      $group: {
        _id: '$serviceCat',
        firstPhoto: { $first: '$photos' },
        workCount: { $sum: 1 },
      },
    },
  ])

  // Build maps: serviceId → first image URL & work count
  const imageMap = new Map<string, string>()
  const countMap = new Map<string, number>()
  for (const w of firstWorks) {
    const url = w.firstPhoto?.[0]?.url
    if (url) imageMap.set(String(w._id), url)
    countMap.set(String(w._id), w.workCount)
  }

 const services: ServiceDTO[] = servicesRaw
  .map((s) => toServiceDTO(s, imageMap.get(String(s._id)), countMap.get(String(s._id)) ?? 0))
  .filter((s) => s.workCount > 0)  // ← only services with at least one work

  let works: WorkDTO[] = []
  let heroCard = defaultHeroCard

  if (options?.includeWorks !== false) {
    let worksRaw
    if (options?.serviceId) {
      worksRaw = await Work.find({ serviceCat: new mongoose.Types.ObjectId(options.serviceId) })
        .sort({ order: 1, createdAt: -1 })
        .lean()
    } else {
      worksRaw = await Work.find().sort({ order: 1, createdAt: -1 }).lean()
    }
    works = worksRaw.map(toWorkDTO)
    const featured = works.find((w) => w.featured)
    heroCard = featured
      ? { title: featured.title, subtitle: `${featured.date} · ${featured.venue}` }
      : defaultHeroCard
  } else {
    const featuredRaw = await Work.findOne({ featured: true }).lean()
    if (featuredRaw) {
      const featured = toWorkDTO(featuredRaw)
      heroCard = { title: featured.title, subtitle: `${featured.date} · ${featured.venue}` }
    }
  }

  return {
    site,
    heroCard,
    services,
    works,
  }
}
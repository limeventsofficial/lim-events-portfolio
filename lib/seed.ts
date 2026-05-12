import { connectDB } from '@/lib/mongodb'
import { SiteSettings } from '@/lib/models/SiteSettings'
import { Service } from '@/lib/models/Service'
import { defaultSiteSettings, defaultServicesSeed } from '@/lib/defaults'

/** Creates default site + services documents when collections are empty. */
export async function ensureDatabaseSeed(): Promise<void> {
  await connectDB()
  const existing = await SiteSettings.findById('site').lean()
  if (!existing) {
    await SiteSettings.create({ _id: 'site', ...defaultSiteSettings })
  }
  const count = await Service.countDocuments()
  if (count === 0) {
    await Service.insertMany(defaultServicesSeed)
  }
}

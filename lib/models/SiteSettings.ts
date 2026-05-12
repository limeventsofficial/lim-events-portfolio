import mongoose, { Schema, type Model } from 'mongoose'
import type { SiteSettingsDTO } from '@/types/site'

type SiteDocument = SiteSettingsDTO & { _id: string }

const SiteSettingsSchema = new Schema<SiteDocument>(
  {
    _id: { type: String, default: 'site' },
    heroCoverUrl: { type: String, required: true },
    heroCoverPublicId: { type: String },
    heroStats: [
      {
        num: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
    aboutStats: [
      {
        num: { type: String, required: true },
        label: { type: String, required: true },
      },
    ],
    contact: {
      address: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    siteYear: { type: Number, required: true },
  }
)

export const SiteSettings: Model<SiteDocument> =
  mongoose.models.SiteSettings || mongoose.model<SiteDocument>('SiteSettings', SiteSettingsSchema)

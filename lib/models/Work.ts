import mongoose, { Schema, type Model } from 'mongoose'

const WorkPhotoSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
  },
  { _id: false }
)

export type WorkDoc = {
  _id: mongoose.Types.ObjectId
  title: string
  date: string
  venue: string
  serviceCat: mongoose.Types.ObjectId
  photos: { url: string; publicId?: string }[]
  story: string
  featured: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const WorkSchema = new Schema<WorkDoc>(
  {
    title: { type: String, default: '' },
    date: { type: String, default: '' },
    venue: { type: String, default: '' },
    serviceCat: {type: mongoose.Types.ObjectId, required: true},
    photos: { type: [WorkPhotoSchema], default: [] },
    story: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Work: Model<WorkDoc> = mongoose.models.Work || mongoose.model<WorkDoc>('Work', WorkSchema)

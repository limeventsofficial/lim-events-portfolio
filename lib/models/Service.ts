import mongoose, { Schema, type Model } from 'mongoose'

export type ServiceDoc = {
  _id: mongoose.Types.ObjectId
  order: number
  icon: string
  title: string
  desc: string
  color: string
}

const ServiceSchema = new Schema<ServiceDoc>(
  {
    order: { type: Number, default: 0 },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true }
)

export const Service: Model<ServiceDoc> =
  mongoose.models.Service || mongoose.model<ServiceDoc>('Service', ServiceSchema)

import mongoose from 'mongoose'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var -- Next.js hot reload pattern
  var mongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null }

if (process.env.NODE_ENV !== 'production') {
  global.mongooseCache = cache
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI
  console.log(uri,'uri')
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }
  if (cache.conn) return cache.conn
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri)
  }
  cache.conn = await cache.promise
  return cache.conn
}

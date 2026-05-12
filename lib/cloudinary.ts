import { v2 as cloudinary } from 'cloudinary'

export function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary env vars are not set (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)')
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  })
  return cloudinary
}

export async function destroyCloudinaryAsset(publicId: string | undefined | null) {
  if (!publicId) return
  const c = configureCloudinary()
  try {
    await c.uploader.destroy(publicId)
  } catch {
    // ignore missing assets
  }
}

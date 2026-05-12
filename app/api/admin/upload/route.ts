import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { configureCloudinary } from '@/lib/cloudinary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const unauthorized = await requireAdmin()
  if (unauthorized) return unauthorized

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 })
    }

    const folderField = formData.get('folder')
    const folder =
      typeof folderField === 'string' && folderField.length > 0 ? folderField : 'lim-events/misc'

    const buffer = Buffer.from(await file.arrayBuffer())
    const mime = file.type || 'image/jpeg'
    const base64 = `data:${mime};base64,${buffer.toString('base64')}`
    const c = configureCloudinary()
    const result = await c.uploader.upload(base64, {
      folder,
      resource_type: 'auto',
    })

    return NextResponse.json({
      url: result.secure_url as string,
      publicId: result.public_id as string,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

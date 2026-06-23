// components/CropModal.tsx
'use client'
import { useState, useRef } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import styles from '@/app/admin/admin.module.css'

type Props = {
  src: string
  onDone: (blob: Blob) => void
  onCancel: () => void
}

function centerAspectCrop(width: number, height: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
    width,
    height
  )
}

export function CropModal({ src, onDone, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completing, setCompleting] = useState(false)

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setCrop(centerAspectCrop(w, h))
  }

  async function handleDone() {
    const img = imgRef.current
    if (!img || !crop) return
    setCompleting(true)

    const canvas = document.createElement('canvas')
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    // Convert % crop to pixels
    const pixelCrop = {
      x: (crop.x / 100) * img.width * scaleX,
      y: (crop.y / 100) * img.height * scaleY,
      width: (crop.width / 100) * img.width * scaleX,
      height: (crop.height / 100) * img.height * scaleY,
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      img,
      pixelCrop.x, pixelCrop.y,
      pixelCrop.width, pixelCrop.height,
      0, 0,
      pixelCrop.width, pixelCrop.height
    )

    canvas.toBlob((blob) => {
      if (blob) onDone(blob)
      setCompleting(false)
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className={styles.cropBackdrop}>
      <div className={styles.cropModal}>
        <p className={styles.cropHint}>Drag to adjust crop</p>

        <div className={styles.cropArea}>
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            aspect={undefined}
            minWidth={10}
            minHeight={10}
          >
            <img
              ref={imgRef}
              src={src}
              onLoad={onImageLoad}
              style={{ maxWidth: '100%', maxHeight: '60vh', display: 'block' }}
              alt="Crop preview"
            />
          </ReactCrop>
        </div>

        <div className={styles.cropActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleDone}
            disabled={completing || !crop}
          >
            {completing ? 'Applying…' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  )
}
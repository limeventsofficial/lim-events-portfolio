'use client'

import { useCallback, useRef, useState } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { MAX_WORK_PHOTOS, type WorkPhoto } from '@/lib/work-constants'
import { workPhotoCountLabel } from './validation'
import styles from '@/app/admin/admin.module.css'

type ImageUploadProps = {
  photos: WorkPhoto[]
  onChange: (photos: WorkPhoto[]) => void
  onUpload: (file: File) => Promise<WorkPhoto>
  maxPhotos?: number
  uploading?: boolean
}

// ── Crop modal ────────────────────────────────────────────────────────────────

function centerDefaultCrop(w: number, h: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, w / h, w, h),
    w,
    h
  )
}

type CropModalProps = {
  src: string
  onDone: (blob: Blob) => void
  onCancel: () => void
}

function CropModal({ src, onDone, onCancel }: CropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [applying, setApplying] = useState(false)

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setCrop(centerDefaultCrop(w, h))
  }

  async function handleApply() {
    const img = imgRef.current
    if (!img || !crop) return
    setApplying(true)

    const canvas = document.createElement('canvas')
    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    const px = {
      x: (crop.x / 100) * img.width * scaleX,
      y: (crop.y / 100) * img.height * scaleY,
      w: (crop.width / 100) * img.width * scaleX,
      h: (crop.height / 100) * img.height * scaleY,
    }

    canvas.width = px.w
    canvas.height = px.h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, px.x, px.y, px.w, px.h, 0, 0, px.w, px.h)

    canvas.toBlob(
      (blob) => {
        if (blob) onDone(blob)
        setApplying(false)
      },
      'image/jpeg',
      0.92
    )
  }

  return (
    <div className={styles.cropBackdrop}>
      <div className={styles.cropModal}>
        <p className={styles.cropHint}>Drag corners to crop, then apply</p>

        <div className={styles.cropArea}>
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            minWidth={10}
            minHeight={10}
          >
            <img
              ref={imgRef}
              src={src}
              onLoad={onImageLoad}
              alt="Crop preview"
              style={{ maxWidth: '100%', maxHeight: '58vh', display: 'block' }}
            />
          </ReactCrop>
        </div>

        <div className={styles.cropActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
            disabled={applying}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleApply}
            disabled={applying || !crop}
          >
            {applying ? 'Applying…' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ImageUpload({
  photos,
  onChange,
  onUpload,
  maxPhotos = MAX_WORK_PHOTOS,
  uploading = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [cropUploading, setCropUploading] = useState(false)

  const atMax = photos.length >= maxPhotos
  const isUploading = uploading || cropUploading
  const showMinError = photos.length === 0 && message === 'min'

  // Open crop modal for a single file
  const openCrop = useCallback((file: File) => {
    const url = URL.createObjectURL(file)
    setPendingFile(file)
    setCropSrc(url)
  }, [])

  // After crop is applied — upload the blob
  const handleCropDone = useCallback(
    async (blob: Blob) => {
      if (!pendingFile) return
      const croppedFile = new File([blob], pendingFile.name, { type: 'image/jpeg' })

      // Cleanup
      if (cropSrc) URL.revokeObjectURL(cropSrc)
      setCropSrc(null)
      setPendingFile(null)

      setCropUploading(true)
      try {
        const uploaded = await onUpload(croppedFile)
        onChange([...photos, uploaded])
        setMessage(null)
      } catch {
        setMessage('upload')
      } finally {
        setCropUploading(false)
      }
    },
    [cropSrc, onUpload, onChange, pendingFile, photos]
  )

  const handleCropCancel = useCallback(() => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPendingFile(null)
  }, [cropSrc])

  // Pick first valid image and open crop — multiple files queue not needed
  // since each needs individual crop; just take the first one
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (!list.length) return

      if (atMax) {
        setMessage('max')
        return
      }

      // Open crop for the first file; user can add more after
      openCrop(list[0])
    },
    [atMax, openCrop]
  )

  const removeAt = (idx: number) => {
    onChange(photos.filter((_, i) => i !== idx))
    setMessage(null)
  }

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= photos.length || to >= photos.length) return
    const next = [...photos]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (atMax || isUploading) { setMessage('max'); return }
    addFiles(e.dataTransfer.files)
  }

  let statusMessage: string | null = null
  if (message === 'max') statusMessage = 'No more than 3 photos allowed'
  else if (message === 'min' || showMinError) statusMessage = 'At least 1 image required'
  else if (message === 'upload') statusMessage = 'Upload failed — please try again'

  return (
    <div className={styles.imageUpload}>
      <div className={styles.imageUploadHeader}>
        <span className={styles.label}>Photos</span>
        <span className={styles.imageCount} aria-live="polite">
          {workPhotoCountLabel(photos.length, maxPhotos)}
        </span>
      </div>

      <div
        className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''} ${atMax ? styles.dropZoneDisabled : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (!atMax && !isUploading) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !atMax && !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!atMax && !isUploading) inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={atMax || isUploading ? -1 : 0}
        aria-disabled={atMax || isUploading}
        aria-label="Upload photos. Drag and drop or click to browse."
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.dropZoneInput}
          disabled={atMax || isUploading}
          onChange={(e) => { addFiles(e.target.files ?? []); e.target.value = '' }}
        />
        <span className={styles.dropZoneIcon} aria-hidden>↑</span>
        <p className={styles.dropZoneTitle}>
          {atMax ? 'Maximum photos reached' : 'Drag photos here or click to upload'}
        </p>
        <p className={styles.dropZoneHint}>Up to {maxPhotos} images · JPG, PNG, WebP</p>
      </div>

      {statusMessage && (
        <p className={styles.fieldError} role="alert">{statusMessage}</p>
      )}

      {photos.length > 0 && (
        <div className={styles.photoGrid} role="list" aria-label="Uploaded photos">
          {photos.map((p, i) => (
            <div
              key={`${p.url}-${i}`}
              className={`${styles.photoCard} ${dragIndex === i ? styles.photoCardDragging : ''}`}
              role="listitem"
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (dragIndex !== null) reorder(dragIndex, i)
                setDragIndex(null)
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Photo ${i + 1}`} className={styles.photoThumb} />
              <button
                type="button"
                className={styles.photoRemove}
                onClick={() => removeAt(i)}
                aria-label={`Remove photo ${i + 1}`}
              >
                ×
              </button>
              <span className={styles.photoDragHint} aria-hidden>⠿</span>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <p className={styles.fieldHint} aria-live="polite">Uploading…</p>
      )}

      {/* Crop modal — portal-like, rendered at end of component */}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
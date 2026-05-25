'use client'

import { useCallback, useRef, useState } from 'react'
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

  const atMax = photos.length >= maxPhotos
  const showMinError = photos.length === 0 && message === 'min'

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (!list.length) return

      const slots = maxPhotos - photos.length
      if (slots <= 0) {
        setMessage('max')
        return
      }

      const toAdd = list.slice(0, slots)
      if (list.length > slots) setMessage('max')

      const next = [...photos]
      for (const file of toAdd) {
        try {
          const uploaded = await onUpload(file)
          if (next.length < maxPhotos) next.push(uploaded)
        } catch {
          setMessage('upload')
        }
      }
      onChange(next)
      setMessage(null)
    },
    [maxPhotos, onChange, onUpload, photos]
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
    if (atMax || uploading) {
      setMessage('max')
      return
    }
    void addFiles(e.dataTransfer.files)
  }

  let statusMessage: string | null = null
  if (message === 'max') statusMessage = 'No more than 3 photos allowed'
  else if (message === 'min' || showMinError) statusMessage = 'At least 1 image required'
  else if (message === 'upload') statusMessage = 'Upload failed'

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
        onDragOver={(e) => {
          e.preventDefault()
          if (!atMax && !uploading) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !atMax && !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!atMax && !uploading) inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={atMax || uploading ? -1 : 0}
        aria-disabled={atMax || uploading}
        aria-label="Upload photos. Drag and drop or click to browse."
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.dropZoneInput}
          disabled={atMax || uploading}
          onChange={(e) => {
            void addFiles(e.target.files ?? [])
            e.target.value = ''
          }}
        />
        <span className={styles.dropZoneIcon} aria-hidden>↑</span>
        <p className={styles.dropZoneTitle}>
          {atMax ? 'Maximum photos reached' : 'Drag photos here or click to upload'}
        </p>
        <p className={styles.dropZoneHint}>Up to {maxPhotos} images · JPG, PNG, WebP</p>
      </div>

      {statusMessage && (
        <p className={styles.fieldError} role="alert">
          {statusMessage}
        </p>
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

      {uploading && (
        <p className={styles.fieldHint} aria-live="polite">
          Uploading…
        </p>
      )}
    </div>
  )
}

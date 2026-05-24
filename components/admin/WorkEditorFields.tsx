'use client'

import type { ServiceDoc, WorkDoc } from './types'
import { AdminTextarea } from './AdminTextarea'
import { ImageUpload } from './ImageUpload'
import type { WorkPhoto } from '@/lib/work-constants'
import styles from '@/app/admin/admin.module.css'

type WorkEditorFieldsProps = {
  work: Pick<WorkDoc, 'serviceId' | 'story' | 'photos'>
  services: ServiceDoc[]
  onChange: (patch: Partial<Pick<WorkDoc, 'serviceId' | 'story' | 'photos'>>) => void
  onUploadPhoto: (file: File) => Promise<WorkPhoto>
  uploading?: boolean
  showValidation?: boolean
}

export function WorkEditorFields({
  work,
  services,
  onChange,
  onUploadPhoto,
  uploading = false,
  showValidation = false,
}: WorkEditorFieldsProps) {
  const serviceInvalid = showValidation && !work.serviceId.trim()
  const storyInvalid = showValidation && !work.story.trim()
  const photosInvalid = showValidation && work.photos.length < 1

  return (
    <>
      <div className={styles.fieldGroup}>
        <label htmlFor="work-service-edit" className={styles.label}>
          Service <span className={styles.required}>*</span>
        </label>
        <select
          id="work-service-edit"
          className={`${styles.select} ${serviceInvalid ? styles.inputInvalid : ''}`}
          value={work.serviceId}
          onChange={(e) => onChange({ serviceId: e.target.value })}
          aria-invalid={serviceInvalid || undefined}
          aria-required
        >
          <option value="">— Select a service —</option>
          {services.map((s) => (
            <option key={s._id} value={s._id}>
              {s.icon} {s.title}
            </option>
          ))}
        </select>
        {serviceInvalid && (
          <p className={styles.fieldError} role="alert">
            Please select a service
          </p>
        )}
      </div>

      <AdminTextarea
        id="work-story-edit"
        label="Description"
        required
        rows={4}
        value={work.story}
        invalid={storyInvalid}
        error={storyInvalid ? 'Description is required' : undefined}
        onChange={(e) => onChange({ story: e.target.value })}
        placeholder="What made this event special..."
      />

      <ImageUpload
        photos={work.photos}
        onChange={(photos) => onChange({ photos })}
        onUpload={onUploadPhoto}
        uploading={uploading}
      />
      {photosInvalid && (
        <p className={styles.fieldError} role="alert" style={{ marginTop: '-0.5rem' }}>
          At least 1 image required
        </p>
      )}
    </>
  )
}

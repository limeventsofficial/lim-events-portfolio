'use client'

import type { ServiceDoc, WorkDraft } from './types'
import { AdminTextarea } from './AdminTextarea'
import { ImageUpload } from './ImageUpload'
import type { WorkPhoto } from '@/lib/work-constants'
import styles from '@/app/admin/admin.module.css'

export type WorkAddDraft = Pick<WorkDraft, 'serviceId' | 'story' | 'photos'>

type WorkAddFieldsProps = {
  draft: WorkAddDraft
  services: ServiceDoc[]
  onChange: (patch: Partial<WorkAddDraft>) => void
  onUploadPhoto: (file: File) => Promise<WorkPhoto>
  uploading?: boolean
  showValidation?: boolean
  serviceSelectId?: string
}

export function WorkAddFields({
  draft,
  services,
  onChange,
  onUploadPhoto,
  uploading = false,
  showValidation = false,
  serviceSelectId = 'work-service-add',
}: WorkAddFieldsProps) {
  const serviceInvalid = showValidation && !draft.serviceId.trim()
  const storyInvalid = showValidation && !draft.story.trim()
  const photosInvalid = showValidation && draft.photos.length < 1

  return (
    <>
      <div className={styles.fieldGroup}>
        <label htmlFor={serviceSelectId} className={styles.label}>
          Service <span className={styles.required}>*</span>
        </label>
        <select
          id={serviceSelectId}
          className={`${styles.select} ${serviceInvalid ? styles.inputInvalid : ''}`}
          value={draft.serviceId}
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
        id="work-story-add"
        label="Description"
        required
        rows={4}
        value={draft.story}
        invalid={storyInvalid}
        error={storyInvalid ? 'Description is required' : undefined}
        onChange={(e) => onChange({ story: e.target.value })}
        placeholder="What made this event special..."
      />

      <ImageUpload
        photos={draft.photos}
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

export function emptyWorkAddDraft(): WorkAddDraft {
  return {
    serviceId: '',
    story: '',
    photos: [],
  }
}

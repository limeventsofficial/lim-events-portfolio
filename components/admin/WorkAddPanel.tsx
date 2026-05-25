'use client'

import { motion } from 'framer-motion'
import type { ServiceDoc } from './types'
import type { WorkAddDraft } from './WorkAddFields'
import { WorkAddFields } from './WorkAddFields'
import { isWorkDraftValid } from './validation'
import { AdminButton } from './AdminButton'
import { AdminCard } from './AdminCard'
import type { WorkPhoto } from '@/lib/work-constants'
import styles from '@/app/admin/admin.module.css'

type WorkAddPanelProps = {
  draft: WorkAddDraft
  services: ServiceDoc[]
  onChange: (patch: Partial<WorkAddDraft>) => void
  onCancel: () => void
  onSave: () => void
  onUploadPhoto: (file: File) => Promise<WorkPhoto>
  saving?: boolean
  uploading?: boolean
  showValidation?: boolean
}

export function WorkAddPanel({
  draft,
  services,
  onChange,
  onCancel,
  onSave,
  onUploadPhoto,
  saving = false,
  uploading = false,
  showValidation = false,
}: WorkAddPanelProps) {
  const valid = isWorkDraftValid(draft)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <AdminCard className={styles.createPanel}>
        <h3 className={styles.createPanelTitle}>Add portfolio work</h3>
        <p className={styles.createPanelDesc}>
          Choose a service, write a short description, and upload 1–3 photos.
        </p>

        <WorkAddFields
          draft={draft}
          services={services}
          onChange={onChange}
          onUploadPhoto={onUploadPhoto}
          uploading={uploading}
          showValidation={showValidation}
        />

        <div className={styles.createPanelActions}>
          <AdminButton type="button" variant="ghost" onClick={onCancel} disabled={saving || uploading}>
            Cancel
          </AdminButton>
          <AdminButton
            type="button"
            variant="primary"
            onClick={onSave}
            disabled={!valid}
            loading={saving}
            aria-disabled={!valid}
          >
            Save portfolio item
          </AdminButton>
        </div>
      </AdminCard>
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ServiceDoc, WorkDoc } from './types'
import { isWorkDocValid } from './validation'
import { WorkEditorFields } from './WorkEditorFields'
import { AdminButton } from './AdminButton'
import { AdminCard } from './AdminCard'
import type { WorkPhoto } from '@/lib/work-constants'
import styles from '@/app/admin/admin.module.css'

type WorkCardProps = {
  work: WorkDoc
  services: ServiceDoc[]
  onUpdate: (patch: Partial<WorkDoc>) => void
  onSave: () => void
  onDelete: () => void
  onUploadPhoto: (file: File) => Promise<WorkPhoto>
  uploading?: boolean
}

export function WorkCard({
  work,
  services,
  onUpdate,
  onSave,
  onDelete,
  onUploadPhoto,
  uploading = false,
}: WorkCardProps) {
  const [open, setOpen] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [saving, setSaving] = useState(false)

  const valid = isWorkDocValid(work)

  const thumbs = work.photos.slice(0, 2)
  const overflow = work.photos.length - 2
  const displayTitle = work.story.trim().slice(0, 56) || 'Portfolio item'

  const handleSave = async () => {
    if (!valid) {
      setShowValidation(true)
      return
    }
    setSaving(true)
    try {
      await onSave()
      setOpen(false)
      setShowValidation(false)
    } catch {
      /* toast handled in parent */
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminCard editing={open} className={styles.workCardOuter}>
      <div className={styles.workCardRow}>
        <div
          className={styles.workCardMain}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen((o) => !o)
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={open}
        >
          <div className={styles.workCardThumbStrip}>
            {thumbs.length > 0 ? (
              thumbs.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p.url} alt="" className={styles.workCardThumb} />
              ))
            ) : (
              <div className={styles.workCardThumbEmpty}>◎</div>
            )}
            {overflow > 0 && <div className={styles.workCardThumbMore}>+{overflow}</div>}
          </div>

          <div className={styles.workCardInfo}>
            <div className={styles.workCardTitle}>{displayTitle}</div>
            {work.story && <span className={styles.workCardDesc}>{work.story}</span>}
          </div>
        </div>

        <div className={styles.workCardActions} onClick={(e) => e.stopPropagation()}>
          <AdminButton type="button" variant="danger" small onClick={onDelete}>
            Delete
          </AdminButton>
          <AdminButton type="button" small onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? 'Close' : 'Edit'}
          </AdminButton>
        </div>

        <span className={styles.workCardChevron} data-open={open} aria-hidden>
          ▾
        </span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.workCardEdit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.workCardEditInner}>
              <WorkEditorFields
                work={work}
                services={services}
                onChange={(patch) => onUpdate(patch)}
                onUploadPhoto={onUploadPhoto}
                uploading={uploading}
                showValidation={showValidation}
              />

              <div className={styles.workEditActions}>
                <span className={styles.spacer} />
                <AdminButton type="button" variant="ghost" small onClick={() => setOpen(false)}>
                  Cancel
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="primary"
                  small
                  onClick={() => void handleSave()}
                  disabled={!valid}
                  loading={saving}
                  aria-disabled={!valid}
                >
                  Save portfolio item
                </AdminButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminCard>
  )
}

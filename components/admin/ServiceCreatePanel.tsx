'use client'

import { motion } from 'framer-motion'
import type { ServiceDraft } from './types'
import { isServiceDraftValid } from './validation'
import { AdminInput } from './AdminInput'
import { AdminTextarea } from './AdminTextarea'
import { AdminButton } from './AdminButton'
import { AdminCard } from './AdminCard'
import styles from '@/app/admin/admin.module.css'

type ServiceCreatePanelProps = {
  draft: ServiceDraft
  onChange: (patch: Partial<ServiceDraft>) => void
  onCancel: () => void
  onCreate: () => void
  saving?: boolean
  showValidation?: boolean
}

export function ServiceCreatePanel({
  draft,
  onChange,
  onCancel,
  onCreate,
  saving = false,
  showValidation = false,
}: ServiceCreatePanelProps) {
  const valid = isServiceDraftValid(draft)
  const titleInvalid = showValidation && !draft.title.trim()
  const descInvalid = showValidation && !draft.desc.trim()

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <AdminCard className={styles.createPanel}>
        <h3 className={styles.createPanelTitle}>New service</h3>
        <p className={styles.createPanelDesc}>
          Add a title and description. Drag to reorder after creating.
        </p>

        <AdminInput
          label="Service title"
          required
          value={draft.title}
          invalid={titleInvalid}
          error={titleInvalid ? 'Title is required' : undefined}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Weddings"
          autoFocus
        />

        <AdminTextarea
          label="Description"
          required
          rows={3}
          value={draft.desc}
          invalid={descInvalid}
          error={descInvalid ? 'Description is required' : undefined}
          onChange={(e) => onChange({ desc: e.target.value })}
          placeholder="What this service includes..."
        />

        <AdminInput
          label="Icon (emoji)"
          value={draft.icon}
          onChange={(e) => onChange({ icon: e.target.value })}
          placeholder="✦"
        />

        <div className={styles.createPanelActions}>
          <AdminButton type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </AdminButton>
          <AdminButton
            type="button"
            variant="primary"
            onClick={onCreate}
            disabled={!valid}
            loading={saving}
          >
            Create service
          </AdminButton>
        </div>
      </AdminCard>
    </motion.div>
  )
}

export function emptyServiceDraft(): ServiceDraft {
  return { icon: '✦', title: '', desc: '' }
}

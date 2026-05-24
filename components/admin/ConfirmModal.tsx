'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/app/admin/admin.module.css'
import { AdminButton } from './AdminButton'

type ConfirmModalProps = {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title = 'Delete item?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const prevOverflowRef = useRef<string | null>(null)

  useEffect(() => {
    setPortalRoot(typeof document !== 'undefined' ? document.body : null)
  }, [])

  useEffect(() => {
    if (!open || !portalRoot) return

    cancelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }

    document.addEventListener('keydown', onKey)
    prevOverflowRef.current = portalRoot.style.overflow
    portalRoot.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      if (portalRoot) {
        portalRoot.style.overflow = prevOverflowRef.current ?? ''
      }
      prevOverflowRef.current = null
    }
  }, [open, loading, onCancel, portalRoot])

  if (!portalRoot) return null

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <div
          key="confirm-modal"
          className={styles.modalRoot}
          role="presentation"
          onClick={loading ? undefined : onCancel}
        >
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
            className={styles.modalPanel}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-modal-title" className={styles.modalTitle}>
              {title}
            </h2>
            <p id="confirm-modal-desc" className={styles.modalDesc}>
              {description}
            </p>
            <div className={styles.modalActions}>
              <AdminButton
                ref={cancelRef}
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </AdminButton>
              <AdminButton
                variant="dangerOutline"
                onClick={onConfirm}
                loading={loading}
                aria-label={confirmLabel}
              >
                {confirmLabel}
              </AdminButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalRoot
  )
}

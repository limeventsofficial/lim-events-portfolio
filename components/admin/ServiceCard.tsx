'use client'

import { useEffect, useState } from 'react'
import type { ServiceDoc } from './types'
import { AdminInput } from './AdminInput'
import { AdminTextarea } from './AdminTextarea'
import { AdminButton } from './AdminButton'
import { AdminCard } from './AdminCard'
import styles from '@/app/admin/admin.module.css'

type DragHandleProps = Record<string, unknown>

type ServiceCardRowProps = {
  service: ServiceDoc
  position?: number
  dragHandleProps?: DragHandleProps
  open?: boolean
  onToggleOpen?: () => void
  onDelete?: () => void
  listDragActive?: boolean
  preview?: boolean
}

function ServiceCardRow({
  service,
  position,
  dragHandleProps,
  open = false,
  onToggleOpen,
  onDelete,
  listDragActive = false,
  preview = false,
}: ServiceCardRowProps) {
  return (
    <div className={styles.serviceCardRow}>
      <button
        type="button"
        className={styles.dragHandle}
        aria-label={`Drag to reorder ${service.title || 'service'}`}
        onClick={(e) => e.stopPropagation()}
        disabled={listDragActive && !preview}
        {...(dragHandleProps ?? {})}
      >
        <span className={styles.dragHandleIcon} aria-hidden>
          ⠿
        </span>
        {position != null && <span className={styles.dragHandleIndex}>{position}</span>}
      </button>

      <div
        className={styles.serviceCardMain}
        onClick={preview ? undefined : onToggleOpen}
        onKeyDown={
          preview
            ? undefined
            : (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggleOpen?.()
                }
              }
        }
        role={preview ? undefined : 'button'}
        tabIndex={preview ? undefined : 0}
        aria-expanded={preview ? undefined : open}
      >
        <div
          className={styles.serviceCardEmoji}
          style={{ background: `${service.color}33`, border: `1px solid ${service.color}66` }}
        >
          {service.icon || '◇'}
        </div>

        <div className={styles.serviceCardInfo}>
          <div className={styles.serviceCardTitle}>{service.title || 'Untitled service'}</div>
          {service.desc && <span className={styles.serviceCardDesc}>{service.desc}</span>}
        </div>
      </div>

      {!preview && onDelete && onToggleOpen && (
        <div className={styles.serviceCardActions} onClick={(e) => e.stopPropagation()}>
          <AdminButton type="button" variant="danger" small onClick={onDelete}>
            Delete
          </AdminButton>
          <AdminButton type="button" small onClick={onToggleOpen} aria-expanded={open}>
            {open ? 'Close' : 'Edit'}
          </AdminButton>
        </div>
      )}

      {!preview && (
        <span className={styles.serviceCardChevron} data-open={open} aria-hidden>
          ▾
        </span>
      )}
    </div>
  )
}

export function ServiceCardPreview({ service, position }: { service: ServiceDoc; position: number }) {
  return (
    <div className={`${styles.serviceCardOuter} ${styles.serviceCardOverlay}`}>
      <ServiceCardRow service={service} position={position} preview />
    </div>
  )
}

type ServiceCardProps = {
  service: ServiceDoc
  position?: number
  onUpdate: (patch: Partial<ServiceDoc>) => void
  onSave: () => void
  onDelete: () => void
  defaultOpen?: boolean
  dragHandleProps?: DragHandleProps
  isDragging?: boolean
  listDragActive?: boolean
}

export function ServiceCard({
  service,
  position,
  onUpdate,
  onSave,
  onDelete,
  defaultOpen = false,
  dragHandleProps,
  isDragging = false,
  listDragActive = false,
}: ServiceCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const motionEnabled = !listDragActive && !isDragging

  useEffect(() => {
    if (defaultOpen && !listDragActive) setOpen(true)
  }, [defaultOpen, listDragActive])

  useEffect(() => {
    if (listDragActive || isDragging) setOpen(false)
  }, [listDragActive, isDragging])

  return (
    <AdminCard editing={open && motionEnabled} className={styles.serviceCardOuter}>
      <ServiceCardRow
        service={service}
        position={position}
        dragHandleProps={dragHandleProps}
        open={open}
        onToggleOpen={() => setOpen((o) => !o)}
        onDelete={onDelete}
        listDragActive={listDragActive}
      />

      {open && motionEnabled && (
        <div className={styles.serviceCardEdit}>
          <div className={styles.serviceCardEditInner}>
            <div className={styles.row2} style={{ marginBottom: '1rem' }}>
              <AdminInput
                label="Icon (emoji)"
                value={service.icon}
                onChange={(e) => onUpdate({ icon: e.target.value })}
              />
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Card colour</label>
                <div className={styles.colorRow}>
                  <input
                    type="color"
                    value={service.color}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    className={styles.colorPicker}
                    aria-label="Card colour"
                  />
                  <input
                    className={styles.input}
                    value={service.color}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    style={{ marginBottom: 0 }}
                  />
                </div>
              </div>
            </div>

            <AdminInput
              label="Title"
              value={service.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
            />

            <AdminTextarea
              label="Description"
              value={service.desc}
              rows={3}
              onChange={(e) => onUpdate({ desc: e.target.value })}
            />

            <div className={styles.serviceEditActions}>
              <span className={styles.spacer} />
              <AdminButton type="button" variant="ghost" small onClick={() => setOpen(false)}>
                Cancel
              </AdminButton>
              <AdminButton
                type="button"
                variant="primary"
                small
                onClick={() => {
                  onSave()
                  setOpen(false)
                }}
              >
                Save service
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </AdminCard>
  )
}

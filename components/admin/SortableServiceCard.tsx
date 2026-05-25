'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ServiceCard } from './ServiceCard'
import type { ServiceDoc } from './types'
import styles from '@/app/admin/admin.module.css'

type SortableServiceCardProps = {
  service: ServiceDoc
  position: number
  onUpdate: (patch: Partial<ServiceDoc>) => void
  onSave: () => void
  onDelete: () => void
  defaultOpen?: boolean
  listDragActive?: boolean
  setWrapRef?: (el: HTMLLIElement | null) => void
}

export function SortableServiceCard({
  service,
  position,
  onUpdate,
  onSave,
  onDelete,
  defaultOpen,
  listDragActive = false,
  setWrapRef,
}: SortableServiceCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: service._id,
    animateLayoutChanges: () => false,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  }

  const setRef = (el: HTMLLIElement | null) => {
    setNodeRef(el)
    setWrapRef?.(el)
  }

  return (
    <li
      ref={setRef}
      style={style}
      className={[
        styles.sortableItem,
        isDragging ? styles.sortableItemGhost : '',
        isOver && !isDragging ? styles.sortableItemOver : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ServiceCard
        service={service}
        position={position}
        onUpdate={onUpdate}
        onSave={onSave}
        onDelete={onDelete}
        defaultOpen={defaultOpen}
        listDragActive={listDragActive}
        isDragging={isDragging}
        dragHandleProps={listDragActive ? undefined : { ...attributes, ...listeners }}
      />
    </li>
  )
}

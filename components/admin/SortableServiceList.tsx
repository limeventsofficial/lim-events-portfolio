'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { ServiceDoc } from './types'
import { SortableServiceCard } from './SortableServiceCard'
import { ServiceCardPreview } from './ServiceCard'
import styles from '@/app/admin/admin.module.css'

type SortableServiceListProps = {
  services: ServiceDoc[]
  onReorder: (services: ServiceDoc[]) => void
  onUpdate: (id: string, patch: Partial<ServiceDoc>) => void
  onSave: (service: ServiceDoc) => void
  onDelete: (id: string) => void
  highlightId?: string | null
  setItemRef?: (id: string, el: HTMLLIElement | null) => void
  onDragStateChange?: (dragging: boolean) => void
}

export function SortableServiceList({
  services,
  onReorder,
  onUpdate,
  onSave,
  onDelete,
  highlightId,
  setItemRef,
  onDragStateChange,
}: SortableServiceListProps) {
  const mountedRef = useRef(true)
  const dragSessionRef = useRef(0)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...services].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    [services]
  )
  const ids = useMemo(() => sorted.map((s) => s._id), [sorted])
  const activeService = useMemo(
    () => (activeId ? sorted.find((s) => s._id === activeId) ?? null : null),
    [activeId, sorted]
  )
  const activePosition = useMemo(() => {
    if (!activeId) return null
    const idx = sorted.findIndex((s) => s._id === activeId)
    return idx >= 0 ? idx + 1 : null
  }, [activeId, sorted])

  const listDragActive = activeId !== null

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      dragSessionRef.current += 1
      setActiveId(null)
      onDragStateChange?.(false)
    }
  }, [onDragStateChange])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 280, tolerance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const finishDrag = useCallback(() => {
    setActiveId(null)
    onDragStateChange?.(false)
  }, [onDragStateChange])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      dragSessionRef.current += 1
      setActiveId(String(event.active.id))
      onDragStateChange?.(true)
    },
    [onDragStateChange]
  )

  const handleDragCancel = useCallback(
    (_event: DragCancelEvent) => {
      finishDrag()
    },
    [finishDrag]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const session = dragSessionRef.current
      finishDrag()

      if (!mountedRef.current) return

      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = sorted.findIndex((s) => s._id === active.id)
      const newIndex = sorted.findIndex((s) => s._id === over.id)
      if (oldIndex < 0 || newIndex < 0) return

      const moved = arrayMove(sorted, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }))

      requestAnimationFrame(() => {
        if (!mountedRef.current || session !== dragSessionRef.current) return
        onReorder(moved)
      })
    },
    [finishDrag, onReorder, sorted]
  )

  const handleItemRef = useCallback(
    (id: string, el: HTMLLIElement | null) => {
      if (!mountedRef.current) return
      setItemRef?.(id, el)
    },
    [setItemRef]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={styles.sortableList} aria-label="Services — drag to reorder">
          {sorted.map((service, index) => (
            <SortableServiceCard
              key={service._id}
              service={service}
              position={index + 1}
              defaultOpen={highlightId === service._id && !listDragActive}
              listDragActive={listDragActive}
              setWrapRef={(el) => handleItemRef(service._id, el)}
              onUpdate={(patch) => onUpdate(service._id, patch)}
              onSave={() => onSave(service)}
              onDelete={() => onDelete(service._id)}
            />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay dropAnimation={null} adjustScale={false}>
        {activeService && activePosition != null ? (
          <ServiceCardPreview service={activeService} position={activePosition} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

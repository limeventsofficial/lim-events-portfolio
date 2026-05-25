'use client'

import type { ReactNode } from 'react'
import styles from '@/app/admin/admin.module.css'

type EmptyStateProps = {
  icon: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon} aria-hidden>{icon}</span>
      <p className={styles.emptyTitle}>{title}</p>
      {description && <p className={styles.emptyDesc}>{description}</p>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  )
}

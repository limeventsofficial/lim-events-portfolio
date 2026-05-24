'use client'

import type { ReactNode } from 'react'
import styles from '@/app/admin/admin.module.css'

type AdminCardProps = {
  children: ReactNode
  className?: string
  editing?: boolean
  as?: 'section' | 'div'
}

export function AdminCard({ children, className = '', editing, as: Tag = 'div' }: AdminCardProps) {
  return (
    <Tag className={className} data-editing={editing ? 'true' : undefined}>
      {children}
    </Tag>
  )
}

export function AdminSectionCard({
  icon,
  title,
  desc,
  children,
}: {
  icon: string
  title: string
  desc: string
  children: ReactNode
}) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionCardHeader}>
        <span className={styles.sectionCardIcon}>{icon}</span>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.sectionDesc}>{desc}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

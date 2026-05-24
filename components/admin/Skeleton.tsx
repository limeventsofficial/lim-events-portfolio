'use client'

import styles from '@/app/admin/admin.module.css'

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return <div className={styles.skeletonLine} style={{ width }} aria-hidden />
}

export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard} aria-hidden>
      <div className={styles.skeletonThumb} />
      <div className={styles.skeletonBody}>
        <SkeletonLine width="55%" />
        <SkeletonLine width="35%" />
      </div>
    </div>
  )
}

export function AdminListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={styles.skeletonList} aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

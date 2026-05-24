'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import styles from '@/app/admin/admin.module.css'

type AdminButtonVariant = 'default' | 'primary' | 'ghost' | 'danger' | 'dangerOutline'

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant
  loading?: boolean
  small?: boolean
}

const variantClass: Record<AdminButtonVariant, string> = {
  default: '',
  primary: styles.btnPrimary,
  ghost: styles.btnGhost,
  danger: styles.btnDanger,
  dangerOutline: styles.btnDangerOutline,
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(function AdminButton(
  { variant = 'default', loading = false, small = false, className = '', disabled, children, ...props },
  ref
) {
  const classes = [
    styles.btn,
    variantClass[variant],
    small ? styles.smallBtn : '',
    loading ? styles.btnLoading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className={styles.btnSpinner} aria-hidden />}
      <span className={loading ? styles.btnLabelLoading : undefined}>{children}</span>
    </button>
  )
})

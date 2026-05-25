'use client'

import { forwardRef, type TextareaHTMLAttributes } from 'react'
import styles from '@/app/admin/admin.module.css'

type AdminTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
  required?: boolean
  invalid?: boolean
  error?: string
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(function AdminTextarea(
  { label, hint, required, invalid, error, id, className = '', ...props },
  ref
) {
  const inputId = id || `admin-textarea-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      <textarea
        ref={ref}
        id={inputId}
        className={`${styles.textarea} ${invalid ? styles.inputInvalid : ''} ${className}`.trim()}
        aria-invalid={invalid || undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className={styles.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

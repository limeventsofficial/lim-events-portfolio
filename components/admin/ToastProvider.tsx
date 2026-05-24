'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      closeButton
      richColors={false}
      toastOptions={{
        classNames: {
          success: 'admin-toast-success',
          error: 'admin-toast-error',
          loading: 'admin-toast-loading',
        },
      }}
    />
  )
}

export { toast } from 'sonner'

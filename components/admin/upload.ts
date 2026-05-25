export async function uploadFile(file: File, folder: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data as { url: string; publicId: string }
}

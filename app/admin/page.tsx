'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './admin.module.css'

// ── Types ───────────────────────────────────────────────────────────────────
type StatPair  = { num: string; label: string }
type ContactInfo = { address: string; phone: string; email: string }
type WorkPhoto = { url: string; publicId?: string }

type SiteDoc = {
  _id?: string
  heroCoverUrl: string
  heroCoverPublicId?: string
  heroStats: StatPair[]
  aboutStats: StatPair[]
  contact: ContactInfo
  siteYear: number
}

type ServiceDoc = {
  _id: string
  order: number
  icon: string
  title: string
  desc: string
  color: string
}

type WorkDoc = {
  _id: string
  title: string
  date: string
  venue: string
  photos: WorkPhoto[]
  story: string
  featured: boolean
  order: number
  serviceId?: string
}

type Tab   = 'site' | 'services' | 'works'
type Toast = { text: string; type: 'ok' | 'err' } | null

const NAV_ITEMS: { id: Tab; label: string; desc: string; icon: string }[] = [
  { id: 'site',     label: 'Site & Hero',  desc: 'Cover, stats, contact & year', icon: '✦' },
  { id: 'services', label: 'Services',     desc: 'Homepage service cards',        icon: '◇' },
  { id: 'works',    label: 'Portfolio',    desc: 'Past events & photos',           icon: '◎' },
]

// ── Upload helper ────────────────────────────────────────────────────────────
async function uploadFile(file: File, folder: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data as { url: string; publicId: string }
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: AdminSite
// ════════════════════════════════════════════════════════════════════════════
function AdminSite({
  site, setSite, onSave, onHeroFile,
}: {
  site: SiteDoc
  setSite: (s: SiteDoc) => void
  onSave: (e: React.FormEvent) => void
  onHeroFile: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const updateStat = (section: 'heroStats' | 'aboutStats', i: number, field: keyof StatPair, val: string) =>
    setSite({ ...site, [section]: site[section].map((s, idx) => idx === i ? { ...s, [field]: val } : s) })
  const addStat = (section: 'heroStats' | 'aboutStats') =>
    setSite({ ...site, [section]: [...site[section], { num: '', label: '' }] })
  const removeStat = (section: 'heroStats' | 'aboutStats', i: number) =>
    setSite({ ...site, [section]: site[section].filter((_, idx) => idx !== i) })

  return (
    <form onSubmit={onSave}>
      {/* Hero cover */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.sectionCardIcon}>🖼</span>
          <div>
            <h2 className={styles.sectionTitle}>Hero Cover</h2>
            <p className={styles.sectionDesc}>Full-width image shown at the top of the site</p>
          </div>
        </div>
        <label className={styles.label}>Upload new cover image</label>
        <input type="file" accept="image/*" onChange={onHeroFile} className={styles.fileInput} />
        {site.heroCoverUrl && (
          <div className={styles.preview}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.heroCoverUrl} alt="Hero cover preview" />
          </div>
        )}
        <label className={styles.label} style={{ marginTop: '1rem' }}>Current image URL</label>
        <input className={styles.input} value={site.heroCoverUrl} readOnly />
      </div>

      {/* Hero stats */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.sectionCardIcon}>📊</span>
          <div>
            <h2 className={styles.sectionTitle}>Hero Stats</h2>
            <p className={styles.sectionDesc}>Numbers displayed in the hero section</p>
          </div>
        </div>
        <div className={styles.statGrid}>
          {site.heroStats.map((s, i) => (
            <div key={`h-${i}`} className={styles.statRow}>
              <div className={styles.statFields}>
                <div>
                  <label className={styles.label}>Number</label>
                  <input className={styles.input} value={s.num} onChange={e => updateStat('heroStats', i, 'num', e.target.value)} />
                </div>
                <div>
                  <label className={styles.label}>Label</label>
                  <input className={styles.input} value={s.label} onChange={e => updateStat('heroStats', i, 'label', e.target.value)} />
                </div>
              </div>
              <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.smallBtn}`} onClick={() => removeStat('heroStats', i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className={styles.btn} onClick={() => addStat('heroStats')}>+ Add hero stat</button>
      </div>

      {/* About stats */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.sectionCardIcon}>ℹ️</span>
          <div>
            <h2 className={styles.sectionTitle}>About Stats</h2>
            <p className={styles.sectionDesc}>Numbers shown in the about section</p>
          </div>
        </div>
        <div className={styles.statGrid}>
          {site.aboutStats.map((s, i) => (
            <div key={`a-${i}`} className={styles.statRow}>
              <div className={styles.statFields}>
                <div>
                  <label className={styles.label}>Number</label>
                  <input className={styles.input} value={s.num} onChange={e => updateStat('aboutStats', i, 'num', e.target.value)} />
                </div>
                <div>
                  <label className={styles.label}>Label</label>
                  <input className={styles.input} value={s.label} onChange={e => updateStat('aboutStats', i, 'label', e.target.value)} />
                </div>
              </div>
              <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.smallBtn}`} onClick={() => removeStat('aboutStats', i)}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className={styles.btn} onClick={() => addStat('aboutStats')}>+ Add about stat</button>
      </div>

      {/* Contact & footer */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.sectionCardIcon}>📞</span>
          <div>
            <h2 className={styles.sectionTitle}>Contact & Footer</h2>
            <p className={styles.sectionDesc}>Address, phone (used for WhatsApp), email and copyright year</p>
          </div>
        </div>
        <label className={styles.label}>Address</label>
        <input className={styles.input} value={site.contact.address} onChange={e => setSite({ ...site, contact: { ...site.contact, address: e.target.value } })} />
        <label className={styles.label}>Phone — include country code e.g. 919876543210</label>
        <input className={styles.input} value={site.contact.phone} onChange={e => setSite({ ...site, contact: { ...site.contact, phone: e.target.value } })} placeholder="919876543210" />
        <label className={styles.label}>Email</label>
        <input className={styles.input} value={site.contact.email} onChange={e => setSite({ ...site, contact: { ...site.contact, email: e.target.value } })} />
        <label className={styles.label}>Footer year (©)</label>
        <input className={styles.input} type="number" value={site.siteYear} onChange={e => setSite({ ...site, siteYear: Number(e.target.value) || site.siteYear })} />
      </div>

      <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ minWidth: 180 }}>
        Save site settings
      </button>
    </form>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: ServiceCard — collapsed card with inline expand-to-edit
// ════════════════════════════════════════════════════════════════════════════
function ServiceCard({
  service, onUpdate, onSave, onDelete,
}: {
  service: ServiceDoc
  onUpdate: (patch: Partial<ServiceDoc>) => void
  onSave: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.serviceCardOuter} data-editing={open}>
      {/* ── Collapsed row ── */}
      <div className={styles.serviceCardRow} onClick={() => setOpen(o => !o)}>
        <div
          className={styles.serviceCardEmoji}
          style={{ background: `${service.color}33`, border: `1px solid ${service.color}66` }}
        >
          {service.icon || '◇'}
        </div>

        <div className={styles.serviceCardInfo}>
          <div className={styles.serviceCardTitle}>{service.title || 'Untitled service'}</div>
          <div className={styles.serviceCardMeta}>
            <span className={styles.serviceCardOrder}>Order #{service.order}</span>
            {service.desc && (
              <span className={styles.serviceCardDesc}>{service.desc}</span>
            )}
          </div>
        </div>

        <div
          className={styles.serviceCardActions}
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger} ${styles.smallBtn}`}
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.smallBtn}`}
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Collapse' : 'Edit'}
          >
            {open ? 'Close' : 'Edit'}
          </button>
        </div>

        <span className={styles.serviceCardChevron} data-open={open}>▾</span>
      </div>

      {/* ── Expanded edit form ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.serviceCardEdit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.serviceCardEditInner}>
              <div className={styles.row3} style={{ marginBottom: '1rem' }}>
                <div>
                  <label className={styles.label}>Icon (emoji)</label>
                  <input
                    className={styles.input}
                    value={service.icon}
                    onChange={e => onUpdate({ icon: e.target.value })}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div>
                  <label className={styles.label}>Sort order</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={service.order}
                    onChange={e => onUpdate({ order: Number(e.target.value) })}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div>
                  <label className={styles.label}>Card colour</label>
                  <div className={styles.colorRow}>
                    <input
                      type="color"
                      value={service.color}
                      onChange={e => onUpdate({ color: e.target.value })}
                      className={styles.colorPicker}
                    />
                    <input
                      className={styles.input}
                      value={service.color}
                      onChange={e => onUpdate({ color: e.target.value })}
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                </div>
              </div>

              <label className={styles.label}>Title</label>
              <input
                className={styles.input}
                value={service.title}
                onChange={e => onUpdate({ title: e.target.value })}
              />

              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                value={service.desc}
                rows={3}
                onChange={e => onUpdate({ desc: e.target.value })}
              />

              <div className={styles.serviceEditActions}>
                <span className={styles.spacer} />
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost} ${styles.smallBtn}`}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.smallBtn}`}
                  onClick={() => { onSave(); setOpen(false) }}
                >
                  Save service
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: AdminServices
// ════════════════════════════════════════════════════════════════════════════
function AdminServices({
  services, setServices, onSave, onDelete, onCreate,
}: {
  services: ServiceDoc[]
  setServices: (s: ServiceDoc[]) => void
  onSave: (s: ServiceDoc) => void
  onDelete: (id: string) => void
  onCreate: () => void
}) {
  const update = (id: string, patch: Partial<ServiceDoc>) =>
    setServices(services.map(s => s._id === id ? { ...s, ...patch } : s))

  return (
    <div>
      <div className={styles.listHeader}>
        <p className={styles.muted}>Service cards appear on the homepage carousel. Click a card to edit it.</p>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onCreate}>
          + Add service
        </button>
      </div>

      {services.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>◇</span>
          <p>No services yet. Add your first one above.</p>
        </div>
      )}

      {services.map(s => (
        <ServiceCard
          key={s._id}
          service={s}
          onUpdate={patch => update(s._id, patch)}
          onSave={() => onSave(s)}
          onDelete={() => onDelete(s._id)}
        />
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: WorkCard — collapsed card with inline expand-to-edit
// ════════════════════════════════════════════════════════════════════════════
function WorkCard({
  work, services, onUpdate, onSave, onDelete, onAddPhotos, onRemovePhoto,
}: {
  work: WorkDoc
  services: ServiceDoc[]
  onUpdate: (patch: Partial<WorkDoc>) => void
  onSave: () => void
  onDelete: () => void
  onAddPhotos: (files: FileList | null) => void
  onRemovePhoto: (idx: number) => void
}) {
  const [open, setOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleFeatured = (checked: boolean) => onUpdate({ featured: checked })

  // Thumb strip: show up to 2 photos + overflow count
  const thumbs  = work.photos.slice(0, 2)
  const overflow = work.photos.length - 2

  return (
    <div className={styles.workCardOuter} data-editing={open}>
      {/* ── Collapsed row ── */}
      <div className={styles.workCardRow} onClick={() => setOpen(o => !o)}>
        {/* Image thumbnails */}
        <div className={styles.workCardThumbStrip}>
          {thumbs.length > 0
            ? thumbs.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={p.url} alt="" className={styles.workCardThumb} />
              ))
            : <div className={styles.workCardThumbEmpty}>◎</div>
          }
          {overflow > 0 && (
            <div className={styles.workCardThumbMore}>+{overflow}</div>
          )}
        </div>

        <div className={styles.workCardInfo}>
          <div className={styles.workCardTitle}>{work.title || 'Untitled work'}</div>
          <div className={styles.workCardMeta}>
            <span className={styles.workCardOrder}>Order #{work.order}</span>
            {work.featured && <span className={styles.workFeaturedBadge}>★ Featured</span>}
            {work.story && (
              <span className={styles.workCardDesc}>{work.story}</span>
            )}
          </div>
        </div>

        <div
          className={styles.workCardActions}
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger} ${styles.smallBtn}`}
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.smallBtn}`}
            onClick={() => setOpen(o => !o)}
          >
            {open ? 'Close' : 'Edit'}
          </button>
        </div>

        <span className={styles.workCardChevron} data-open={open}>▾</span>
      </div>

      {/* ── Expanded edit form ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.workCardEdit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.workCardEditInner}>
              {/* Service selector */}
              <label className={styles.label}>
                Link to service <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={work.serviceId ?? ''}
                onChange={e => onUpdate({ serviceId: e.target.value || undefined })}
              >
                <option value="">— Select a service —</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.icon} {s.title}</option>
                ))}
              </select>

              <label className={styles.label}>Title</label>
              <input
                className={styles.input}
                value={work.title}
                onChange={e => onUpdate({ title: e.target.value })}
              />

              <div className={styles.row2}>
                <div>
                  <label className={styles.label}>Date</label>
                  <input
                    className={styles.input}
                    value={work.date}
                    onChange={e => onUpdate({ date: e.target.value })}
                    placeholder="e.g. March 2024"
                  />
                </div>
                <div>
                  <label className={styles.label}>Venue</label>
                  <input
                    className={styles.input}
                    value={work.venue}
                    onChange={e => onUpdate({ venue: e.target.value })}
                    placeholder="e.g. Grand Hyatt, Kochi"
                  />
                </div>
              </div>

              <label className={styles.label}>Story / Description</label>
              <textarea
                className={styles.textarea}
                value={work.story}
                rows={3}
                onChange={e => onUpdate({ story: e.target.value })}
                placeholder="What made this event special..."
              />

              <div className={styles.row2}>
                <div>
                  <label className={styles.label}>Sort order</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={work.order}
                    onChange={e => onUpdate({ order: Number(e.target.value) })}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.1rem' }}>
                  <label className={styles.chk}>
                    <input
                      type="checkbox"
                      checked={work.featured}
                      onChange={e => toggleFeatured(e.target.checked)}
                    />
                    <span>Mark as featured</span>
                    <span className={styles.chkHint}>(drives hero card)</span>
                  </label>
                </div>
              </div>

              {/* Photos */}
              <label className={styles.label} style={{ marginTop: '1rem' }}>
                Photos <span className={styles.chkHint}>(first 3 shown on work card)</span>
              </label>
              <input
                ref={fileRef}
                type="file" accept="image/*" multiple
                className={styles.fileInput}
                onChange={e => onAddPhotos(e.target.files)}
              />
              {work.photos.length > 0 && (
                <div className={styles.photoGrid}>
                  {work.photos.map((p, i) => (
                    <div key={`${p.url}-${i}`} className={styles.photoCard}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={`Photo ${i + 1}`} className={styles.photoThumb} />
                      <button
                        type="button"
                        className={styles.photoRemove}
                        onClick={() => onRemovePhoto(i)}
                        aria-label="Remove photo"
                      >×</button>
                      {i < 3 && <span className={styles.photoLabel}>On card</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.workEditActions}>
                <span className={styles.spacer} />
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost} ${styles.smallBtn}`}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.smallBtn}`}
                  onClick={() => { onSave(); setOpen(false) }}
                >
                  Save portfolio item
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: AdminWorks
// ════════════════════════════════════════════════════════════════════════════
function AdminWorks({
  works, services, setWorks, onSave, onDelete, onCreate, onAddPhotos, onRemovePhoto,
}: {
  works: WorkDoc[]
  services: ServiceDoc[]
  setWorks: (w: WorkDoc[]) => void
  onSave: (w: WorkDoc) => void
  onDelete: (id: string) => void
  onCreate: () => void
  onAddPhotos: (workId: string, files: FileList | null) => void
  onRemovePhoto: (workId: string, idx: number) => void
}) {
  const update = (id: string, patch: Partial<WorkDoc>) =>
    setWorks(works.map(w => w._id === id ? { ...w, ...patch } : w))

  return (
    <div>
      <div className={styles.listHeader}>
        <p className={styles.muted}>Each portfolio item links to a service. Click a card to edit it.</p>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onCreate}>
          + Add work
        </button>
      </div>

      {works.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>◎</span>
          <p>No portfolio items yet. Add your first one above.</p>
        </div>
      )}

      {works.map(w => (
        <WorkCard
          key={w._id}
          work={w}
          services={services}
          onUpdate={patch => update(w._id, patch)}
          onSave={() => onSave(w)}
          onDelete={() => onDelete(w._id)}
          onAddPhotos={files => onAddPhotos(w._id, files)}
          onRemovePhoto={idx => onRemovePhoto(w._id, idx)}
        />
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN: AdminPage
// ════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [tab, setTab]               = useState<Tab>('site')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionOk, setSessionOk]   = useState<boolean | null>(null)
  const [password, setPassword]     = useState('')
  const [loginError, setLoginError] = useState('')
  const [toast, setToast]           = useState<Toast>(null)

  const [site, setSite]         = useState<SiteDoc | null>(null)
  const [services, setServices] = useState<ServiceDoc[]>([])
  const [works, setWorks]       = useState<WorkDoc[]>([])

  const showToast = (text: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Data fetching ─────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/bootstrap', { credentials: 'include' })
    if (res.status === 401) { setSessionOk(false); return }
    if (!res.ok) { showToast('Could not load data — check MONGODB_URI.', 'err'); return }
    const data = await res.json()
    setSite(data.site)
    setServices(data.services || [])
    setWorks(data.works || [])
    setSessionOk(true)
  }, [])

  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/auth/session', { credentials: 'include' })
      const j = await r.json()
      if (j.ok) { setSessionOk(true); await refresh() }
      else setSessionOk(false)
    })()
  }, [refresh])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)')
    const onChange = () => { if (mq.matches) setSidebarOpen(false) }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // ── Auth ──────────────────────────────────────────────────────────────
  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include',
    })
    if (!res.ok) { setLoginError('Invalid password — please try again.'); return }
    setPassword('')
    setSessionOk(true)
    await refresh()
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setSessionOk(false)
    setSite(null); setServices([]); setWorks([])
  }

  // ── Site handlers ─────────────────────────────────────────────────────
  const saveSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!site) return
    const res = await fetch('/api/admin/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        heroCoverUrl: site.heroCoverUrl,
        heroCoverPublicId: site.heroCoverPublicId ?? null,
        heroStats: site.heroStats,
        aboutStats: site.aboutStats,
        contact: site.contact,
        siteYear: site.siteYear,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { showToast(data.error || 'Save failed', 'err'); return }
    setSite(data.site)
    showToast('Site settings saved ✓')
  }

  const onHeroFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !site) return
    try {
      const { url, publicId } = await uploadFile(f, 'lim-events/hero')
      setSite({ ...site, heroCoverUrl: url, heroCoverPublicId: publicId })
      showToast('Cover uploaded — click Save to publish.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed', 'err')
    }
    e.target.value = ''
  }

  // ── Service handlers ──────────────────────────────────────────────────
  const saveService = async (s: ServiceDoc) => {
    const res = await fetch(`/api/admin/services/${s._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ icon: s.icon, title: s.title, desc: s.desc, color: s.color, order: s.order }),
    })
    if (!res.ok) { showToast('Could not save service', 'err'); return }
    showToast('Service saved ✓')
    await refresh()
  }

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service? Works linked to it will become unlinked.')) return
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE', credentials: 'include' })
    await refresh()
  }

  const createService = async () => {
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ icon: '✦', title: 'New service', desc: 'Description', color: '#fde8d8' }),
    })
    if (res.ok) await refresh()
  }

  // ── Work handlers ─────────────────────────────────────────────────────
  const saveWork = async (w: WorkDoc) => {
    const res = await fetch(`/api/admin/works/${w._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: w.title, date: w.date, venue: w.venue, story: w.story,
        photos: w.photos, featured: w.featured, order: w.order,
        serviceId: w.serviceId ?? null,
      }),
    })
    if (!res.ok) { showToast('Could not save portfolio item', 'err'); return }
    showToast('Portfolio item saved ✓')
    await refresh()
  }

  const deleteWork = async (id: string) => {
    if (!confirm('Delete this portfolio item and its photos?')) return
    await fetch(`/api/admin/works/${id}`, { method: 'DELETE', credentials: 'include' })
    await refresh()
  }

  const createWork = async () => {
    const res = await fetch('/api/admin/works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title: 'New event', date: 'TBC', venue: 'TBC', story: '', photos: [], featured: false, serviceId: null }),
    })
    if (res.ok) await refresh()
  }

  const addWorkPhotos = async (workId: string, files: FileList | null) => {
    if (!files?.length) return
    const w = works.find(x => x._id === workId)
    if (!w) return
    const nextPhotos = [...w.photos]
    for (let i = 0; i < files.length; i++) {
      try {
        const up = await uploadFile(files[i], 'lim-events/work')
        nextPhotos.push({ url: up.url, publicId: up.publicId })
      } catch { showToast('One or more uploads failed', 'err') }
    }
    setWorks(works.map(x => x._id === workId ? { ...x, photos: nextPhotos } : x))
    showToast('Photos added — click Save to publish.')
  }

  const removeWorkPhoto = (workId: string, photoIdx: number) =>
    setWorks(works.map(w => w._id === workId ? { ...w, photos: w.photos.filter((_, i) => i !== photoIdx) } : w))

  // ── Loading ───────────────────────────────────────────────────────────
  if (sessionOk === null) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingPulse} aria-hidden />
        <p className={styles.loadingText}>Loading studio…</p>
      </div>
    )
  }

  // ── Login ─────────────────────────────────────────────────────────────
  if (!sessionOk) {
    return (
      <div className={styles.loginPage}>
        <motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.loginBrand}>
            <div className={styles.loginBrandMark}>✦</div>
            <div className={styles.loginBrandText}>
              <strong>Lim Events</strong>
              <span>Content Studio</span>
            </div>
          </div>
          <p className={styles.muted} style={{ marginBottom: '1.65rem', lineHeight: 1.7 }}>
            Sign in with your admin password. Changes sync to the live site instantly.
          </p>
          <form onSubmit={login}>
            <label className={styles.label}>Admin password</label>
            <input
              className={styles.input} type="password"
              value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="current-password" placeholder="Enter password"
            />
            {loginError && <p className={styles.error}>{loginError}</p>}
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ marginTop: '0.6rem', width: '100%', padding: '0.72rem' }}
            >
              Sign in →
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  const activeNav = NAV_ITEMS.find(n => n.id === tab) ?? NAV_ITEMS[0]

  // ── Dashboard ─────────────────────────────────────────────────────────
  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarGlow} aria-hidden />

        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>L</div>
          <div>
            <div className={styles.sidebarTitle}>Lim Events</div>
            <div className={styles.sidebarSubtitle}>Content Studio</div>
          </div>
        </div>

        <div className={styles.navSectionLabel}>Manage</div>
        <nav className={styles.navList} aria-label="Admin sections">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id} type="button"
              className={styles.navItem}
              data-active={tab === item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false) }}
            >
              {tab === item.id && (
                <motion.span
                  layoutId="admin-nav-pill"
                  className={styles.navActiveBg}
                  transition={{ type: 'spring', stiffness: 460, damping: 38 }}
                />
              )}
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>
                <span className={styles.navLabel}>{item.label}</span>
                <span className={styles.navDesc}>{item.desc}</span>
              </span>
              {item.id === 'services' && <span className={styles.navCount}>{services.length}</span>}
              {item.id === 'works'    && <span className={styles.navCount}>{works.length}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.sidebarFooterLink} target="_blank" rel="noopener noreferrer">
            ↗ View live site
          </Link>
          <button type="button" className={styles.sidebarLogout} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button" className={styles.menuBtn}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setSidebarOpen(o => !o)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {sidebarOpen
                  ? <path d="M18 6L6 18M6 6l12 12" />
                  : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
            <div>
              <div className={styles.headerEyebrow}>Dashboard</div>
              <h1 className={styles.headerTitle}>{activeNav.label}</h1>
              <p className={styles.headerDesc}>{activeNav.desc}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/" className={`${styles.btn} ${styles.btnGhost}`} target="_blank" rel="noopener noreferrer">
              Live site ↗
            </Link>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.contentInner}>
            {/* Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  key="toast"
                  className={`${styles.toast} ${toast.type === 'err' ? styles.toastErr : ''}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ duration: 0.26 }}
                >
                  <span>{toast.type === 'ok' ? '✓' : '⚠'}</span>
                  {toast.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab panels */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {tab === 'site' && site && (
                  <AdminSite site={site} setSite={setSite} onSave={saveSite} onHeroFile={onHeroFile} />
                )}
                {tab === 'services' && (
                  <AdminServices
                    services={services} setServices={setServices}
                    onSave={saveService} onDelete={deleteService} onCreate={createService}
                  />
                )}
                {tab === 'works' && (
                  <AdminWorks
                    works={works} services={services} setWorks={setWorks}
                    onSave={saveWork} onDelete={deleteWork} onCreate={createWork}
                    onAddPhotos={addWorkPhotos} onRemovePhoto={removeWorkPhoto}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './admin.module.css'
import { ToastProvider, toast } from '@/components/admin/ToastProvider'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { AdminButton } from '@/components/admin/AdminButton'
import { EmptyState } from '@/components/admin/EmptyState'
import { AdminListSkeleton } from '@/components/admin/Skeleton'
import { SortableServiceList } from '@/components/admin/SortableServiceList'
import { WorkCard } from '@/components/admin/WorkCard'
import { ServiceCreatePanel, emptyServiceDraft } from '@/components/admin/ServiceCreatePanel'
import { WorkAddPanel } from '@/components/admin/WorkAddPanel'
import FilterSelect from '@/components/admin/FilterSelect'
import { emptyWorkAddDraft, type WorkAddDraft } from '@/components/admin/WorkAddFields'
import { uploadFile } from '@/components/admin/upload'
import { isServiceDraftValid, isWorkDraftValid } from '@/components/admin/validation'
import type {
  DeleteTarget,
  ServiceDoc,
  ServiceDraft,
  SiteDoc,
  StatPair,
  Tab,
  WorkDoc,
} from '@/components/admin/types'

const NAV_ITEMS: { id: Tab; label: string; desc: string; icon: string }[] = [
  { id: 'site', label: 'Site & Hero', desc: 'Cover, stats, contact & year', icon: '✦' },
  { id: 'services', label: 'Services', desc: 'Homepage service cards', icon: '◇' },
  { id: 'works', label: 'Portfolio', desc: 'Past events & photos', icon: '◎' },
]

function AdminSite({
  site,
  setSite,
  onSave,
  onHeroFile,
  saving,
}: {
  site: SiteDoc
  setSite: (s: SiteDoc) => void
  onSave: (e: React.FormEvent) => void
  onHeroFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  saving?: boolean
}) {
  const updateStat = (section: 'heroStats' | 'aboutStats', i: number, field: keyof StatPair, val: string) =>
    setSite({ ...site, [section]: site[section].map((s, idx) => (idx === i ? { ...s, [field]: val } : s)) })
  const addStat = (section: 'heroStats' | 'aboutStats') =>
    setSite({ ...site, [section]: [...site[section], { num: '', label: '' }] })
  const removeStat = (section: 'heroStats' | 'aboutStats', i: number) =>
    setSite({ ...site, [section]: site[section].filter((_, idx) => idx !== i) })

  return (
    <form onSubmit={onSave}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.sectionCardIcon}>🖼</span>
          <div>
            <h2 className={styles.sectionTitle}>Hero Cover</h2>
            <p className={styles.sectionDesc}>Full-width image shown at the top of the site</p>
          </div>
        </div>
        <label className={styles.label}>Cover image</label>
        <label className={styles.uploadBtn} aria-label="Upload new cover image">
          <input
            type="file"
            accept="image/*"
            onChange={onHeroFile}
            className={styles.uploadBtnInput}
          />
          <span className={styles.uploadBtnIcon}>↑</span>
          Upload new cover
        </label>
        {site.heroCoverUrl && (
          <div className={styles.preview}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.heroCoverUrl} alt="Hero cover preview" />
          </div>
        )}
        
      </div>

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
                  <input
                    className={styles.input}
                    value={s.num}
                    onChange={(e) => updateStat('heroStats', i, 'num', e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.label}>Label</label>
                  <input
                    className={styles.input}
                    value={s.label}
                    onChange={(e) => updateStat('heroStats', i, 'label', e.target.value)}
                  />
                </div>
              </div>
              <AdminButton type="button" variant="danger" small onClick={() => removeStat('heroStats', i)}>
                Remove
              </AdminButton>
            </div>
          ))}
        </div>
        <AdminButton type="button" onClick={() => addStat('heroStats')}>
          + Add hero stat
        </AdminButton>
      </div>

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
                  <input
                    className={styles.input}
                    value={s.num}
                    onChange={(e) => updateStat('aboutStats', i, 'num', e.target.value)}
                  />
                </div>
                <div>
                  <label className={styles.label}>Label</label>
                  <input
                    className={styles.input}
                    value={s.label}
                    onChange={(e) => updateStat('aboutStats', i, 'label', e.target.value)}
                  />
                </div>
              </div>
              <AdminButton type="button" variant="danger" small onClick={() => removeStat('aboutStats', i)}>
                Remove
              </AdminButton>
            </div>
          ))}
        </div>
        <AdminButton type="button" onClick={() => addStat('aboutStats')}>
          + Add about stat
        </AdminButton>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionCardHeader}>
          <span className={styles.sectionCardIcon}>📞</span>
          <div>
            <h2 className={styles.sectionTitle}>Contact & Footer</h2>
            <p className={styles.sectionDesc}>Address, phone, email and copyright year</p>
          </div>
        </div>
        <label className={styles.label}>Address</label>
        <input
          className={styles.input}
          value={site.contact.address}
          onChange={(e) => setSite({ ...site, contact: { ...site.contact, address: e.target.value } })}
        />
        <label className={styles.label}>Phone — include country code e.g. 919876543210</label>
        <input
          className={styles.input}
          value={site.contact.phone}
          onChange={(e) => setSite({ ...site, contact: { ...site.contact, phone: e.target.value } })}
          placeholder="919876543210"
        />
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          value={site.contact.email}
          onChange={(e) => setSite({ ...site, contact: { ...site.contact, email: e.target.value } })}
        />
        <label className={styles.label}>Footer year (©)</label>
        <input
          className={styles.input}
          type="number"
          value={site.siteYear}
          onChange={(e) => setSite({ ...site, siteYear: Number(e.target.value) || site.siteYear })}
        />
      </div>

      <AdminButton type="submit" variant="primary" loading={saving} style={{ minWidth: 180 }}>
        Save site settings
      </AdminButton>
    </form>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('site')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionOk, setSessionOk] = useState<boolean | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [site, setSite] = useState<SiteDoc | null>(null)
  const [services, setServices] = useState<ServiceDoc[]>([])
  const [works, setWorks] = useState<WorkDoc[]>([])

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [siteSaving, setSiteSaving] = useState(false)

  const [creatingService, setCreatingService] = useState(false)
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(emptyServiceDraft())
  const [showServiceValidation, setShowServiceValidation] = useState(false)
  const [serviceCreateLoading, setServiceCreateLoading] = useState(false)
  const [highlightServiceId, setHighlightServiceId] = useState<string | null>(null)
  const serviceRefs = useRef<Record<string, HTMLLIElement | null>>({})

  const [addingWork, setAddingWork] = useState(false)
  const [workDraft, setWorkDraft] = useState<WorkAddDraft>(emptyWorkAddDraft())
  const [showWorkValidation, setShowWorkValidation] = useState(false)
  const [workCreateLoading, setWorkCreateLoading] = useState(false)
  const [workUploading, setWorkUploading] = useState(false)
  const [isServiceDragging, setIsServiceDragging] = useState(false)
  const [workFilterServiceId, setWorkFilterServiceId] = useState<string | null>(null)

  const filteredWorks = workFilterServiceId
    ? works.filter((w) => w.serviceId === workFilterServiceId)
    : works

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true)
    const res = await fetch('/api/admin/bootstrap', { credentials: 'include' })
    if (res.status === 401) {
      setSessionOk(false)
      setDataLoading(false)
      return
    }
    if (!res.ok) {
      toast.error('Could not load data — check MONGODB_URI.')
      setDataLoading(false)
      return
    }
    const data = await res.json()
    setSite(data.site)
    setServices(data.services || [])
    setWorks(data.works || [])
    setSessionOk(true)
    setDataLoading(false)
  }, [])

  useEffect(() => {
    ;(async () => {
      const r = await fetch('/api/auth/session', { credentials: 'include' })
      const j = await r.json()
      if (j.ok) {
        setSessionOk(true)
        await refresh()
      } else {
        setSessionOk(false)
        setDataLoading(false)
      }
    })()
  }, [refresh])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)')
    const onChange = () => {
      if (mq.matches) setSidebarOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!highlightServiceId) return
    const el = serviceRefs.current[highlightServiceId]
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    }
    const t = setTimeout(() => setHighlightServiceId(null), 4000)
    return () => clearTimeout(t)
  }, [highlightServiceId, services])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include',
    })
    if (!res.ok) {
      setLoginError('Invalid password — please try again.')
      return
    }
    setPassword('')
    setSessionOk(true)
    await refresh()
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setSessionOk(false)
    setSite(null)
    setServices([])
    setWorks([])
  }

  const saveSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!site) return
    setSiteSaving(true)
    const toastId = toast.loading('Saving…')
    try {
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
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSite(data.site)
      toast.success('Saved successfully', { id: toastId })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed', { id: toastId })
    } finally {
      setSiteSaving(false)
    }
  }

  const onHeroFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !site) return
    const toastId = toast.loading('Uploading…')
    try {
      const { url, publicId } = await uploadFile(f, 'lim-events/hero')
      setSite({ ...site, heroCoverUrl: url, heroCoverPublicId: publicId })
      toast.success('Cover uploaded — click Save to publish.', { id: toastId })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed', { id: toastId })
    }
    e.target.value = ''
  }

  const reorderServices = async (reordered: ServiceDoc[]) => {
    const previous = services
    setServices(reordered)
    try {
      const res = await fetch('/api/admin/services/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: reordered.map((s) => s._id) }),
      })
      if (!res.ok) throw new Error('Reorder failed')
      toast.success('Service order updated')
    } catch {
      setServices(previous)
      toast.error('Could not update order')
    }
  }

  const saveService = async (s: ServiceDoc) => {
    const toastId = toast.loading('Saving…')
    try {
      const res = await fetch(`/api/admin/services/${s._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ icon: s.icon, title: s.title, desc: s.desc, color: s.color, order: s.order }),
      })
      if (!res.ok) throw new Error('Could not save service')
      setServices((prev) => prev.map((x) => (x._id === s._id ? s : x)))
      toast.success('Saved successfully', { id: toastId })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed', { id: toastId })
    }
  }

  const submitCreateService = async () => {
    if (!isServiceDraftValid(serviceDraft)) {
      setShowServiceValidation(true)
      return
    }
    setServiceCreateLoading(true)
    const toastId = toast.loading('Saving…')
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          icon: serviceDraft.icon || '✦',
          title: serviceDraft.title.trim(),
          desc: serviceDraft.desc.trim(),
          color: '#fde8d8',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not create service')
      const created = data.service as ServiceDoc
      setServices((prev) => [...prev, { ...created, _id: String(created._id) }])
      setCreatingService(false)
      setServiceDraft(emptyServiceDraft())
      setShowServiceValidation(false)
      setHighlightServiceId(String(created._id))
      toast.success('Service added successfully', { id: toastId })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed', { id: toastId })
    } finally {
      setServiceCreateLoading(false)
    }
  }

  const saveWork = async (w: WorkDoc) => {
    const toastId = toast.loading('Saving…')
    try {
      const res = await fetch(`/api/admin/works/${w._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          story: w.story,
          photos: w.photos,
          serviceId: w.serviceId,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save portfolio item')
      const updated = data.work as WorkDoc
      setWorks((prev) => prev.map((x) => (x._id === w._id ? updated : x)))
      toast.success('Saved successfully', { id: toastId })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed', { id: toastId })
      throw err
    }
  }

  const submitCreateWork = async () => {
    if (!isWorkDraftValid(workDraft)) {
      setShowWorkValidation(true)
      return
    }
    setWorkCreateLoading(true)
    const toastId = toast.loading('Saving…')
    try {
      const res = await fetch('/api/admin/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceId: workDraft.serviceId,
          story: workDraft.story.trim(),
          photos: workDraft.photos,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save portfolio item')
      const created = data.work as WorkDoc
      setWorks((prev) => [created, ...prev])
      setAddingWork(false)
      setWorkDraft(emptyWorkAddDraft())
      setShowWorkValidation(false)
      toast.success('Portfolio added successfully', { id: toastId })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed', { id: toastId })
    } finally {
      setWorkCreateLoading(false)
    }
  }

  const uploadWorkPhotoForId = async (workId: string, file: File) => {
    const up = await uploadFile(file, 'lim-events/work')
    setWorks((prev) =>
      prev.map((w) => {
        if (w._id !== workId) return w
        if (w.photos.length >= 3) return w
        return { ...w, photos: [...w.photos, up] }
      })
    )
    return up
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const toastId = toast.loading('Deleting…')
    try {
      if (deleteTarget.type === 'service') {
        const res = await fetch(`/api/admin/services/${deleteTarget.id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Delete failed')
        setServices((prev) => prev.filter((s) => s._id !== deleteTarget.id))
        setWorks((prev) =>
          prev.map((w) => (w.serviceId === deleteTarget.id ? { ...w, serviceId: '' } : w))
        )
      } else {
        const res = await fetch(`/api/admin/works/${deleteTarget.id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Delete failed')
        setWorks((prev) => prev.filter((w) => w._id !== deleteTarget.id))
      }
      toast.success('Deleted successfully', { id: toastId })
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed', { id: toastId })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (sessionOk === null) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingPulse} aria-hidden />
        <p className={styles.loadingText}>Loading studio…</p>
      </div>
    )
  }

  if (!sessionOk) {
    return (
      <>
        <ToastProvider />
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
              <label className={styles.label} htmlFor="admin-password">
                Admin password
              </label>
              <input
                id="admin-password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
              />
              {loginError && (
                <p className={styles.error} role="alert">
                  {loginError}
                </p>
              )}
              <AdminButton type="submit" variant="primary" style={{ marginTop: '0.6rem', width: '100%' }}>
                Sign in →
              </AdminButton>
            </form>
          </motion.div>
        </div>
      </>
    )
  }

  const activeNav = NAV_ITEMS.find((n) => n.id === tab) ?? NAV_ITEMS[0]
  const deleteDescription =
    deleteTarget?.type === 'service'
      ? 'Works linked to this service will become unlinked. This action cannot be undone.'
      : 'This action cannot be undone.'

  return (
    <div className={styles.shell}>
      <ToastProvider />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        description={deleteDescription}
        loading={deleteLoading}
        onCancel={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />

      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

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
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.navItem}
              data-active={tab === item.id}
              onClick={() => {
                if (isServiceDragging) return
                setTab(item.id)
                setSidebarOpen(false)
              }}
              aria-disabled={isServiceDragging && tab !== item.id}
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
              {item.id === 'works' && <span className={styles.navCount}>{works.length}</span>}
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

      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.menuBtn}
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {sidebarOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
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
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {tab === 'site' && site && (
                  <AdminSite site={site} setSite={setSite} onSave={saveSite} onHeroFile={onHeroFile} saving={siteSaving} />
                )}

                {tab === 'services' && (
                  <div>
                    <div className={styles.listHeader}>
                      <p className={styles.muted}>
                        Service cards appear on the homepage carousel. Drag{' '}
                        <span className={styles.inlineDragHint}>⠿</span> to reorder — order saves automatically.
                      </p>
                      {!creatingService && (
                        <AdminButton
                          type="button"
                          variant="primary"
                          onClick={() => {
                            setCreatingService(true)
                            setServiceDraft(emptyServiceDraft())
                            setShowServiceValidation(false)
                          }}
                        >
                          + Add service
                        </AdminButton>
                      )}
                    </div>

                    <AnimatePresence>
                      {creatingService && (
                        <ServiceCreatePanel
                          draft={serviceDraft}
                          onChange={(patch) => setServiceDraft((d) => ({ ...d, ...patch }))}
                          onCancel={() => {
                            setCreatingService(false)
                            setShowServiceValidation(false)
                          }}
                          onCreate={() => void submitCreateService()}
                          saving={serviceCreateLoading}
                          showValidation={showServiceValidation}
                        />
                      )}
                    </AnimatePresence>

                    {dataLoading ? (
                      <AdminListSkeleton count={3} />
                    ) : services.length === 0 && !creatingService ? (
                      <EmptyState
                        icon="◇"
                        title="No services yet"
                        description="Add your first service to show on the homepage carousel."
                        action={
                          <AdminButton
                            type="button"
                            variant="primary"
                            onClick={() => {
                              setCreatingService(true)
                              setServiceDraft(emptyServiceDraft())
                            }}
                          >
                            + Add service
                          </AdminButton>
                        }
                      />
                    ) : (
                      <SortableServiceList
                        services={services}
                        highlightId={highlightServiceId}
                        onDragStateChange={setIsServiceDragging}
                        setItemRef={(id, el) => {
                          serviceRefs.current[id] = el
                        }}
                        onReorder={(reordered) => void reorderServices(reordered)}
                        onUpdate={(id, patch) =>
                          setServices((prev) => prev.map((x) => (x._id === id ? { ...x, ...patch } : x)))
                        }
                        onSave={saveService}
                        onDelete={(id) => {
                          const s = services.find((x) => x._id === id)
                          setDeleteTarget({
                            type: 'service',
                            id,
                            label: s?.title || 'this service',
                          })
                        }}
                      />
                    )}
                  </div>
                )}

                {tab === 'works' && (
                  <div>
                    <div className={styles.listHeader}>
                      <div style={{ flex: 1, minWidth: 'min(100%, 220px)' }}>
                        <p className={styles.muted}>
                          Each portfolio item links to a service. Required: service, description, and 1–3 photos.
                        </p>
                        {services.length > 0 && (
                          <div className={styles.filterRow}>
                            <label className={styles.label} htmlFor="work-filter">
                              Filter by Service
                            </label>
                            <FilterSelect
                              value={workFilterServiceId}
                              onChange={setWorkFilterServiceId}
                              options={services.map((s) => ({ value: s._id, label: s.title }))}
                              placeholder="All Services"
                            />
                          </div>
                        )}
                      </div>
                      {!addingWork && (
                        <AdminButton
                          type="button"
                          variant="primary"
                          onClick={() => {
                            setAddingWork(true)
                            setWorkDraft(emptyWorkAddDraft())
                            setShowWorkValidation(false)
                          }}
                          disabled={services.length === 0}
                        >
                          + Add work
                        </AdminButton>
                      )}
                    </div>

                    {services.length === 0 && (
                      <p className={styles.fieldHint} style={{ marginBottom: '1rem' }}>
                        Create at least one service before adding portfolio work.
                      </p>
                    )}

                    <AnimatePresence>
                      {addingWork && (
                        <WorkAddPanel
                          draft={workDraft}
                          services={services}
                          onChange={(patch) => setWorkDraft((d) => ({ ...d, ...patch }))}
                          onCancel={() => {
                            setAddingWork(false)
                            setShowWorkValidation(false)
                          }}
                          onSave={() => void submitCreateWork()}
                          onUploadPhoto={async (file) => {
                            setWorkUploading(true)
                            try {
                              const up = await uploadFile(file, 'lim-events/work')
                              setWorkDraft((d) => ({
                                ...d,
                                photos: [...d.photos, up].slice(0, 3),
                              }))
                              return up
                            } finally {
                              setWorkUploading(false)
                            }
                          }}
                          saving={workCreateLoading}
                          uploading={workUploading}
                          showValidation={showWorkValidation}
                        />
                      )}
                    </AnimatePresence>

                    {dataLoading ? (
                      <AdminListSkeleton count={3} />
                    ) : works.length === 0 && !addingWork ? (
                      <EmptyState
                        icon="◎"
                        title="No portfolio items yet"
                        description="Showcase past events with photos and a short story."
                        action={
                          <AdminButton
                            type="button"
                            variant="primary"
                            disabled={services.length === 0}
                            onClick={() => {
                              setAddingWork(true)
                              setWorkDraft(emptyWorkAddDraft())
                            }}
                          >
                            + Add work
                          </AdminButton>
                        }
                      />
                    ) : filteredWorks.length === 0 && !addingWork ? (
                      <EmptyState
                        icon="◎"
                        title="No portfolio items found"
                        description={
                          workFilterServiceId
                            ? `No portfolio items linked to the selected service.`
                            : 'Showcase past events with photos and a short story.'
                        }
                        action={
                          workFilterServiceId ? (
                            <AdminButton
                              type="button"
                              variant="ghost"
                              onClick={() => setWorkFilterServiceId(null)}
                            >
                              Clear filter
                            </AdminButton>
                          ) : (
                            <AdminButton
                              type="button"
                              variant="primary"
                              disabled={services.length === 0}
                              onClick={() => {
                                setAddingWork(true)
                                setWorkDraft(emptyWorkAddDraft())
                              }}
                            >
                              + Add work
                            </AdminButton>
                          )
                        }
                      />
                    ) : (
                      filteredWorks.map((w) => (
                        <WorkCard
                          key={w._id}
                          work={w}
                          services={services}
                          onUpdate={(patch) =>
                            setWorks((prev) => prev.map((x) => (x._id === w._id ? { ...x, ...patch } : x)))
                          }
                          onSave={() => saveWork(w)}
                          onDelete={() =>
                            setDeleteTarget({
                              type: 'work',
                              id: w._id,
                              label: w.title || 'this portfolio item',
                            })
                          }
                          onUploadPhoto={(file) => uploadWorkPhotoForId(w._id, file)}
                        />
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

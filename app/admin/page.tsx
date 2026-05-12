'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import styles from './admin.module.css'
import type { StatPair, ContactInfo } from '@/types/site'

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

type WorkPhoto = { url: string; publicId?: string }

type WorkDoc = {
  _id: string
  title: string
  date: string
  venue: string
  photos: WorkPhoto[]
  story: string
  featured: boolean
  order: number
}

type Tab = 'site' | 'services' | 'works'

const NAV_ITEMS: { id: Tab; label: string; desc: string; icon: string }[] = [
  { id: 'site', label: 'Site & hero', desc: 'Cover image, stats, contact & year', icon: '✦' },
  { id: 'services', label: 'Services', desc: 'Homepage service cards', icon: '◇' },
  { id: 'works', label: 'Portfolio', desc: 'Past events & featured item', icon: '◎' },
]

async function uploadFile(file: File, folder: string) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data as { url: string; publicId: string }
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('site')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessionOk, setSessionOk] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [message, setMessage] = useState('')

  const [site, setSite] = useState<SiteDoc | null>(null)
  const [services, setServices] = useState<ServiceDoc[]>([])
  const [works, setWorks] = useState<WorkDoc[]>([])

  const refresh = useCallback(async () => {
    const res = await fetch('/api/admin/bootstrap', { credentials: 'include' })
    if (res.status === 401) {
      setSessionOk(false)
      return
    }
    if (!res.ok) {
      setMessage('Could not load admin data. Check MONGODB_URI and database access.')
      return
    }
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
      if (j.ok) {
        setSessionOk(true)
        await refresh()
      } else {
        setSessionOk(false)
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
      setLoginError('Invalid password.')
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
    setMessage('')
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
    if (!res.ok) {
      setMessage(data.error || 'Save failed')
      return
    }
    setSite(data.site)
    setMessage('Saved.')
  }

  const onHeroFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !site) return
    setMessage('')
    try {
      const { url, publicId } = await uploadFile(f, 'lim-events/hero')
      setSite({
        ...site,
        heroCoverUrl: url,
        heroCoverPublicId: publicId,
      })
      setMessage('Cover uploaded — click Save site to publish.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed')
    }
    e.target.value = ''
  }

  const updateStat = (
    section: 'heroStats' | 'aboutStats',
    index: number,
    field: keyof StatPair,
    value: string
  ) => {
    if (!site) return
    const next = site[section].map((s, i) => (i === index ? { ...s, [field]: value } : s))
    setSite({ ...site, [section]: next })
  }

  const addStat = (section: 'heroStats' | 'aboutStats') => {
    if (!site) return
    setSite({
      ...site,
      [section]: [...site[section], { num: '', label: '' }],
    })
  }

  const removeStat = (section: 'heroStats' | 'aboutStats', index: number) => {
    if (!site) return
    setSite({
      ...site,
      [section]: site[section].filter((_, i) => i !== index),
    })
  }

  const saveService = async (s: ServiceDoc) => {
    setMessage('')
    const res = await fetch(`/api/admin/services/${s._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        icon: s.icon,
        title: s.title,
        desc: s.desc,
        color: s.color,
        order: s.order,
      }),
    })
    if (!res.ok) {
      setMessage('Could not save service')
      return
    }
    setMessage('Service saved.')
    await refresh()
  }

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE', credentials: 'include' })
    await refresh()
  }

  const createService = async () => {
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        icon: '✦',
        title: 'New service',
        desc: 'Description',
        color: '#fde8d8',
      }),
    })
    if (res.ok) await refresh()
  }

  const saveWork = async (w: WorkDoc) => {
    setMessage('')
    const res = await fetch(`/api/admin/works/${w._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: w.title,
        date: w.date,
        venue: w.venue,
        story: w.story,
        photos: w.photos,
        featured: w.featured,
        order: w.order,
      }),
    })
    if (!res.ok) {
      setMessage('Could not save portfolio item')
      return
    }
    setMessage('Portfolio item saved.')
    await refresh()
  }

  const deleteWork = async (id: string) => {
    if (!confirm('Delete this portfolio item and its Cloudinary photos?')) return
    await fetch(`/api/admin/works/${id}`, { method: 'DELETE', credentials: 'include' })
    await refresh()
  }

  const createWork = async () => {
    const res = await fetch('/api/admin/works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: 'New event',
        date: 'TBC',
        venue: 'TBC',
        story: '',
        photos: [],
        featured: false,
      }),
    })
    if (res.ok) await refresh()
  }

  const addWorkPhotos = async (workId: string, files: FileList | null) => {
    if (!files?.length) return
    const w = works.find((x) => x._id === workId)
    if (!w) return
    const nextPhotos = [...w.photos]
    for (let i = 0; i < files.length; i++) {
      try {
        const up = await uploadFile(files[i], 'lim-events/work')
        nextPhotos.push({ url: up.url, publicId: up.publicId })
      } catch {
        setMessage('One or more uploads failed')
      }
    }
    setWorks(works.map((x) => (x._id === workId ? { ...x, photos: nextPhotos } : x)))
    setMessage('Photos added — click Save on this item to publish.')
  }

  if (sessionOk === null) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingPulse} aria-hidden />
      </div>
    )
  }

  if (!sessionOk) {
    return (
      <div className={styles.loginPage}>
        <motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.loginBrand}>
            <div className={styles.loginBrandMark}>✦</div>
            <div className={styles.loginBrandText}>
              <strong>Lim Events</strong>
              <span>Administration</span>
            </div>
          </div>
          <p className={styles.muted} style={{ marginBottom: '1.25rem' }}>
            Sign in with your admin password. Changes sync to the live site instantly.
          </p>
          <form onSubmit={login}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {loginError && <p className={styles.error}>{loginError}</p>}
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: '0.35rem', width: '100%' }}>
              Sign in
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  const activeNav = NAV_ITEMS.find((n) => n.id === tab) ?? NAV_ITEMS[0]

  return (
    <div className={styles.shell}>
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
            <div className={styles.sidebarSubtitle}>Content studio</div>
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
                setTab(item.id)
                setSidebarOpen(false)
              }}
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
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.sidebarFooterLink} target="_blank" rel="noopener noreferrer">
            ↗ View live site
          </Link>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {sidebarOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </>
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
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={logout}>
              Log out
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.contentInner}>
            <AnimatePresence>
              {message ? (
                <motion.p
                  key="toast"
                  className={styles.panelMessage}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.28 }}
                >
                  {message}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
        {tab === 'site' && site && (
          <form className={styles.card} onSubmit={saveSite}>
            <h2 className={styles.h1} style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Hero cover (hero section image)
            </h2>
            <label className={styles.label}>Upload new cover</label>
            <input type="file" accept="image/*" onChange={onHeroFile} />
            {site.heroCoverUrl && (
              <div className={styles.preview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={site.heroCoverUrl} alt="" />
              </div>
            )}
            <label className={styles.label} style={{ marginTop: '1rem' }}>
              Image URL (read-only reference)
            </label>
            <input className={styles.input} value={site.heroCoverUrl} readOnly />

            <h3 className={styles.h1} style={{ fontSize: '1.1rem', margin: '1.25rem 0 0.75rem' }}>
              Hero stats
            </h3>
            <div className={styles.statGrid}>
              {site.heroStats.map((s, i) => (
                <div key={`h-${i}`} className={styles.row2}>
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
                  <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.smallBtn}`} onClick={() => removeStat('heroStats', i)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.btn} style={{ marginTop: '0.5rem' }} onClick={() => addStat('heroStats')}>
              Add hero stat
            </button>

            <h3 className={styles.h1} style={{ fontSize: '1.1rem', margin: '1.5rem 0 0.75rem' }}>
              About stats
            </h3>
            <div className={styles.statGrid}>
              {site.aboutStats.map((s, i) => (
                <div key={`a-${i}`} className={styles.row2}>
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
                  <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.smallBtn}`} onClick={() => removeStat('aboutStats', i)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.btn} style={{ marginTop: '0.5rem' }} onClick={() => addStat('aboutStats')}>
              Add about stat
            </button>

            <h3 className={styles.h1} style={{ fontSize: '1.1rem', margin: '1.5rem 0 0.75rem' }}>
              Contact & footer
            </h3>
            <label className={styles.label}>Address</label>
            <input
              className={styles.input}
              value={site.contact.address}
              onChange={(e) => setSite({ ...site, contact: { ...site.contact, address: e.target.value } })}
            />
            <label className={styles.label}>Phone</label>
            <input
              className={styles.input}
              value={site.contact.phone}
              onChange={(e) => setSite({ ...site, contact: { ...site.contact, phone: e.target.value } })}
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

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: '1rem' }}>
              Save site
            </button>
          </form>
        )}

        {tab === 'services' && (
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.h1} style={{ fontSize: '1.25rem' }}>
                Services
              </h2>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={createService}>
                Add service
              </button>
            </div>
            {services.map((s) => (
              <div key={s._id} className={styles.serviceItem}>
                <div className={styles.row2}>
                  <div>
                    <label className={styles.label}>Icon (emoji)</label>
                    <input
                      className={styles.input}
                      value={s.icon}
                      onChange={(e) =>
                        setServices(services.map((x) => (x._id === s._id ? { ...x, icon: e.target.value } : x)))
                      }
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Order</label>
                    <input
                      className={styles.input}
                      type="number"
                      value={s.order}
                      onChange={(e) =>
                        setServices(
                          services.map((x) => (x._id === s._id ? { ...x, order: Number(e.target.value) } : x))
                        )
                      }
                    />
                  </div>
                </div>
                <label className={styles.label}>Title</label>
                <input
                  className={styles.input}
                  value={s.title}
                  onChange={(e) =>
                    setServices(services.map((x) => (x._id === s._id ? { ...x, title: e.target.value } : x)))
                  }
                />
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={s.desc}
                  onChange={(e) =>
                    setServices(services.map((x) => (x._id === s._id ? { ...x, desc: e.target.value } : x)))
                  }
                />
                <label className={styles.label}>Card tint (CSS color)</label>
                <input
                  className={styles.input}
                  value={s.color}
                  onChange={(e) =>
                    setServices(services.map((x) => (x._id === s._id ? { ...x, color: e.target.value } : x)))
                  }
                />
                <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.smallBtn}`} onClick={() => saveService(s)}>
                  Save
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.smallBtn}`} onClick={() => deleteService(s._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'works' && (
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.h1} style={{ fontSize: '1.25rem' }}>
                Portfolio
              </h2>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={createWork}>
                Add work
              </button>
            </div>
            <p className={styles.muted} style={{ marginBottom: '1rem' }}>
              Featured item drives the hero card title and subtitle. Only one featured item applies.
            </p>
            {works.map((w) => (
              <div key={w._id} className={styles.workItem}>
                <div className={styles.workHead}>
                  <strong>{w.title || 'Untitled'}</strong>
                  <label className={styles.chk}>
                    <input
                      type="checkbox"
                      checked={w.featured}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setWorks(
                          works.map((x) => {
                            if (x._id === w._id) return { ...x, featured: checked }
                            if (checked) return { ...x, featured: false }
                            return x
                          })
                        )
                      }}
                    />
                    Featured
                  </label>
                </div>
                <label className={styles.label}>Title</label>
                <input
                  className={styles.input}
                  value={w.title}
                  onChange={(e) => setWorks(works.map((x) => (x._id === w._id ? { ...x, title: e.target.value } : x)))}
                />
                <div className={styles.row2}>
                  <div>
                    <label className={styles.label}>Date</label>
                    <input
                      className={styles.input}
                      value={w.date}
                      onChange={(e) => setWorks(works.map((x) => (x._id === w._id ? { ...x, date: e.target.value } : x)))}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Venue</label>
                    <input
                      className={styles.input}
                      value={w.venue}
                      onChange={(e) => setWorks(works.map((x) => (x._id === w._id ? { ...x, venue: e.target.value } : x)))}
                    />
                  </div>
                </div>
                <label className={styles.label}>Short story</label>
                <textarea
                  className={styles.textarea}
                  value={w.story}
                  onChange={(e) => setWorks(works.map((x) => (x._id === w._id ? { ...x, story: e.target.value } : x)))}
                />
                <label className={styles.label}>Sort order</label>
                <input
                  className={styles.input}
                  type="number"
                  value={w.order}
                  onChange={(e) =>
                    setWorks(works.map((x) => (x._id === w._id ? { ...x, order: Number(e.target.value) } : x)))
                  }
                />
                <label className={styles.label}>Photos</label>
                <input type="file" accept="image/*" multiple onChange={(e) => addWorkPhotos(w._id, e.target.files)} />
                <div className={styles.photoList}>
                  {w.photos.map((p, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={`${p.url}-${idx}`} src={p.url} alt="" className={styles.photoThumb} />
                  ))}
                </div>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.smallBtn}`} onClick={() => saveWork(w)}>
                  Save
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.smallBtn}`} onClick={() => deleteWork(w._id)}>
                  Delete
                </button>
              </div>
            ))}
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

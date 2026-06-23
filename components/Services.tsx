'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect, useCallback } from 'react'
import AnimateIn from './AnimateIn'
import styles from './Services.module.css'
import type { ServiceDTO } from '@/types/site'

type Props = { services: ServiceDTO[] }

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// These must match the CSS
const CARD_W = 300
const CARD_GAP = 20
const CARD_STEP = CARD_W + CARD_GAP

function getScrollForIndex(i: number, trackWidth: number) {
  return i * CARD_STEP - trackWidth / 2 + CARD_W / 2
}

export default function Services({ services }: Props) {
  const router = useRouter()
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(0)

  // Loading overlay: stores index of the card being navigated to
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)

  // ── Scroll → active index ─────────────────────────────────
  const updateActive = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const center = track.scrollLeft + track.clientWidth / 2
    const idx = Math.round((center - CARD_W / 2) / CARD_STEP)
    const clamped = Math.max(0, Math.min(idx, services.length - 1))
    if (clamped !== activeIndexRef.current) {
      activeIndexRef.current = clamped
      setActiveIndex(clamped)
    }
  }, [services.length])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.addEventListener('scroll', updateActive, { passive: true })
    return () => track.removeEventListener('scroll', updateActive)
  }, [updateActive])

  // Center first card on mount (no rAF delay — just set synchronously after paint)
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.scrollLeft = getScrollForIndex(0, track.clientWidth)
  }, [services.length])

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: getScrollForIndex(i, track.clientWidth), behavior: 'smooth' })
  }, [])

  // ── Navigate with immediate loading feedback ──────────────
  const navigateTo = useCallback(
    (title: string, sId: string, cardIndex: number) => {
      setLoadingIndex(cardIndex)          // show spinner instantly
      router.push(`/services/${slugify(title)}?sId=${sId}`)
      // Fallback: clear loading if navigation takes too long / fails
      setTimeout(() => setLoadingIndex(null), 8000)
    },
    [router],
  )

  // ── Single-click behaviour ────────────────────────────────
  // Inactive card → scroll it to center
  // Active card   → navigate immediately (no second click needed)
  const handleCardClick = useCallback(
    (i: number, s: ServiceDTO) => {
      if (i !== activeIndexRef.current) {
        scrollTo(i)
      } else {
        navigateTo(s.title, s._id, i)
      }
    },
    [scrollTo, navigateTo],
  )

  if (!services.length) return null

  return (
    <section className={styles.section} id="services">
      <div className={styles.bgOrb1} aria-hidden="true" />
      <div className={styles.bgOrb2} aria-hidden="true" />

      <div className={styles.inner}>
        <AnimateIn direction="up">
          <div className={styles.header}>
            <div className={styles.tagRow}>
              <span className={styles.tagLine} />
              <span className={styles.tag}>✦ What We Offer ✦</span>
              <span className={styles.tagLine} />
            </div>
            <h2 className={styles.title}>
              Services Crafted <em>for You</em>
            </h2>
            <p className={styles.sub}>
              Every detail, every moment — curated with care and executed with precision.
            </p>
          </div>
        </AnimateIn>

        {/* Carousel track */}
        <div className={styles.track} ref={trackRef}>
          <div className={styles.scrollRow}>
            <div className={styles.spacer} aria-hidden="true" />

            {services.map((s, i) => {
              const isActive = i === activeIndex
              const isLoading = loadingIndex === i

              return (
                <motion.div
                  key={s._id}
                  className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                  // Snappier spring — less stiffness lag on scroll
                  animate={{
                    scale: isActive ? 1.05 : 0.91,
                    opacity: isActive ? 1 : 0.65,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }}
                  onClick={() => handleCardClick(i, s)}
                >
                  {/* Background image */}
                  {s.firstWorkImage && (
                    <div
                      className={styles.cardBg}
                      style={{ backgroundImage: `url(${s.firstWorkImage})` }}
                    />
                  )}
                  <div className={styles.cardOverlay} />

                  {/* Corner ornaments */}
                  <svg className={styles.cornerTL} viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <path d="M2 26 L2 2 L26 2" stroke="var(--peach)" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="2" cy="2" r="2" fill="var(--peach)" />
                  </svg>
                  <svg className={styles.cornerBR} viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <path d="M26 2 L26 26 L2 26" stroke="var(--peach)" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="26" cy="26" r="2" fill="var(--peach)" />
                  </svg>

                  {/* Glow */}
                  <div className={styles.glow} style={{ background: s.color }} />

                  {/* Ghost number */}
                  <span className={styles.ghostNum}>{String(i + 1).padStart(2, '0')}</span>

                  {/* Icon */}
                  <div
                    className={styles.iconWrap}
                    style={{
                      background: s.firstWorkImage ? 'rgba(255,255,255,0.12)' : `${s.color}25`,
                      border: `1.5px solid ${s.firstWorkImage ? 'rgba(255,255,255,0.25)' : `${s.color}70`}`,
                    }}
                  >
                    <span className={styles.icon}>{s.icon}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{s.title}</h3>
                    <p className={styles.cardDesc}>{s.desc}</p>
                  </div>

                  {/* Work count badge */}
                  {s.workCount > 0 && (
                    <span className={styles.workCount}>
                      {s.workCount} {s.workCount === 1 ? 'work' : 'works'}
                    </span>
                  )}

                  {/* CTA */}
                  <button
                    type="button"
                    className={`${styles.ctaRow} ${isActive ? styles.ctaVisible : ''}`}
                    aria-label={`View works for ${s.title}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateTo(s.title, s._id, i)
                    }}
                  >
                    <span className={styles.ctaLabel}>View Works</span>
                    <span className={styles.ctaArrow} style={{ background: s.color }}>→</span>
                  </button>

                  {/* Bottom stripe */}
                  <div
                    className={styles.stripe}
                    style={{ background: `linear-gradient(90deg, ${s.color}cc, ${s.color}22)` }}
                  />

                  {/* ── Loading overlay (shown immediately on click) ── */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        className={styles.loadingOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <span className={styles.spinner} style={{ borderTopColor: s.color }} />
                        <span className={styles.loadingText}>Opening…</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            <div className={styles.spacer} aria-hidden="true" />
          </div>
        </div>

        {/* Dot indicators */}
        <div className={styles.dots} role="tablist" aria-label="Service indicators">
          {services.map((s, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => scrollTo(i)}
              aria-label={`Go to ${s.title}`}
            />
          ))}
        </div>

        <p className={styles.hint}>✦ swipe to explore ✦</p>
      </div>
    </section>
  )
}
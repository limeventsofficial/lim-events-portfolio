'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useRef, useState, useEffect, useCallback } from 'react'
import AnimateIn from './AnimateIn'
import styles from './Services.module.css'
import type { ServiceDTO } from '@/types/site'

type Props = { services: ServiceDTO[] }

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

const CARD_WIDTH = 272 // card width + gap approx

export default function Services({ services }: Props) {
  const router = useRouter()
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(
    Math.floor(services.length / 2)
  )
  // Keep a ref so click handlers always read the latest value
  // without needing activeIndex in their dependency/closure
  const activeIndexRef = useRef(activeIndex)

  const updateActive = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const center = track.scrollLeft + track.clientWidth / 2
    const idx = Math.round((center - CARD_WIDTH / 2) / CARD_WIDTH)
    const clamped = Math.max(0, Math.min(idx, services.length - 1))
    activeIndexRef.current = clamped
    setActiveIndex(clamped)
  }, [services.length])

  // Update active index based on scroll position
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.addEventListener('scroll', updateActive, { passive: true })
    return () => track.removeEventListener('scroll', updateActive)
  }, [updateActive])

  // Scroll to center card on mount
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const mid = Math.floor(services.length / 2)
    track.scrollLeft = mid * CARD_WIDTH - track.clientWidth / 2 + CARD_WIDTH / 2
    // Sync activeIndex after setting scroll
    updateActive()
  }, [services.length, updateActive])

  const scrollTo = useCallback((i: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({
      left: i * CARD_WIDTH - track.clientWidth / 2 + CARD_WIDTH / 2,
      behavior: 'smooth',
    })
  }, [])

  // Navigate to service page — reads from ref so always fresh
  const navigateTo = useCallback((title: string) => {
    let slug = slugify(title)
    router.push(`/services/${slug}`)
  }, [router])

  if (!services.length) return null

  return (
    <section className={styles.section} id="services">
      {/* Background decoration */}
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
            {/* Leading spacer so first card can center */}
            <div className={styles.spacer} aria-hidden="true" />

            {services.map((s, i) => {
              const isActive = i === activeIndex
              

              return (
                <motion.div
                  key={s._id}
                  className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                  animate={{
                    scale: isActive ? 1.07 : 0.93,
                    opacity: isActive ? 1 : 0.72,
                  }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  // Card click: if already active → navigate, else scroll to center
                  onClick={() => navigateTo(s.title)}
                >
                  {/* Corner ornaments */}
                  <svg className={styles.cornerTL} viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <path d="M2 26 L2 2 L26 2" stroke="var(--peach)" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="2" cy="2" r="2" fill="var(--peach)"/>
                  </svg>
                  <svg className={styles.cornerBR} viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <path d="M26 2 L26 26 L2 26" stroke="var(--peach)" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="26" cy="26" r="2" fill="var(--peach)"/>
                  </svg>

                  {/* Glow behind icon */}
                  <div className={styles.glow} style={{ background: s.color }} />

                  {/* Ghost number */}
                  <span className={styles.ghostNum}>{String(i + 1).padStart(2, '0')}</span>

                  {/* Icon */}
                  <div
                    className={styles.iconWrap}
                    style={{ background: `${s.color}25`, border: `1.5px solid ${s.color}70` }}
                  >
                    <span className={styles.icon}>{s.icon}</span>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{s.title}</h3>
                    <p className={styles.cardDesc}>{s.desc}</p>
                  </div>

                  {/* CTA — real button so it's tappable independently */}
                  <button
                    type="button"
                    className={`${styles.ctaRow} ${isActive ? styles.ctaVisible : ''}`}
                    aria-label={`View works for ${s.title}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={e => navigateTo(s.title)}
                  >
                    <span className={styles.ctaLabel}>View Works</span>
                    <span className={styles.ctaArrow} style={{ background: s.color }}>→</span>
                  </button>

                  {/* Bottom stripe */}
                  <div
                    className={styles.stripe}
                    style={{ background: `linear-gradient(90deg, ${s.color}ee, ${s.color}22)` }}
                  />
                </motion.div>
              )
            })}

            {/* Trailing spacer */}
            <div className={styles.spacer} aria-hidden="true" />
          </div>
        </div>

        {/* Dot indicators */}
        <div className={styles.dots} role="tablist" aria-label="Service indicators">
          {services.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => scrollTo(i)}
              aria-label={`Go to service ${i + 1}`}
            />
          ))}
        </div>

        <p className={styles.hint}>✦ swipe to explore ✦</p>
      </div>
    </section>
  )
}
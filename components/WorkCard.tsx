'use client'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './WorkCard.module.css'
import type { WorkDTO } from '@/types/site'

type Props = {
  work: WorkDTO
  serviceTitle: string
  whatsappNumber: string
  serviceId: string
}

const STORY_LIMIT = 90

export default function WorkCard({ work, serviceTitle, whatsappNumber, serviceId }: Props) {
  if (serviceId !== work.serviceId) return null
  console.log(whatsappNumber, work, "number has been changed or no0t")
  const photos = work.photos.slice(0, 3)
  const [expanded, setExpanded] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)

  const isLong = work.story.length > STORY_LIMIT
  const displayStory = expanded || !isLong
    ? work.story
    : work.story.slice(0, STORY_LIMIT) + '…'

  const selectedImage = work.photos?.[0]?.url ?? ''
  const waMessage = encodeURIComponent(
    `Hi! I'm interested in your *${serviceTitle}* service.\n\nI saw your work:\n*${work.title}* (${work.venue}, ${work.date})\n\nImage:\n${selectedImage}\n\nI'd love to discuss something similar for my event. 🎉`
  )
  const waLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`

  function handleScroll() {
    if (!stripRef.current) return
    const idx = Math.round(stripRef.current.scrollLeft / stripRef.current.offsetWidth)
    setActiveIdx(idx)
  }

  return (
    <>
      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* ── Image strip ── */}
        {photos.length > 0 && (
          <div className={styles.imageWrap}>
            <div
              className={styles.imageStrip}
              ref={stripRef}
              onScroll={handleScroll}
            >
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className={styles.imageSlot}
                  onClick={() => setLightbox(photo.url)}
                >
                  <Image
                    src={photo.url}
                    alt={`${work.title} photo ${idx + 1}`}
                    fill
                    className={styles.img}
                    sizes="(max-width: 600px) 80vw, 300px"
                  />
                  <span className={styles.zoomHint} aria-hidden="true">
                    <ZoomIcon />
                  </span>
                </div>
              ))}
            </div>
            {/* Dot indicators */}
            {photos.length > 1 && (
              <div className={styles.dots}>
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ''}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Body ── */}
        <div className={styles.body}>
          {work.featured && (
            <span className={styles.badge}>✦ Featured</span>
          )}

          <h3 className={styles.title}>{work.title}</h3>

          <div className={styles.metaRow}>
            <span className={styles.metaChip}>📅 {work.date}</span>
            <span className={styles.metaChip}>📍 {work.venue}</span>
          </div>

          <hr className={styles.divider} />

          <p className={styles.story}>{displayStory}</p>
          {isLong && (
            <button
              className={styles.toggleBtn}
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Show less ↑' : 'Show more ↓'}
            </button>
          )}

          <motion.a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waCta}
            whileTap={{ scale: 0.97 }}
          >
            <WhatsAppIcon />
            Connect on WhatsApp
          </motion.a>
        </div>
      </motion.article>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className={styles.lightboxOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className={styles.lightboxBox}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className={styles.lbClose}
                onClick={() => setLightbox(null)}
                aria-label="Close"
              >✕</button>
              <div className={styles.lbImgWrap}>
                <Image
                  src={lightbox}
                  alt="Enlarged view"
                  fill
                  className={styles.lbImg}
                  sizes="90vw"
                />
              </div>
              <p className={styles.lbHint}>Tap outside to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ZoomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

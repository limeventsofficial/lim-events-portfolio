'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import styles from './Hero.module.css'
import Image from 'next/image'
import type { HeroCardCopy, StatPair } from '@/types/site'

const FLOWERS = ['🌸', '🌼']

type Petal = {
  id: number
  emoji: string
  x: number
  size: number
  duration: number
  delay: number
  rotation: number
  swayAmount: number
}

export type HeroProps = {
  heroCoverUrl: string
  heroStats: StatPair[]
  heroCard: HeroCardCopy
}

function usePetals(count = 3) {
  const [petals, setPetals] = useState<Petal[]>([])
  useEffect(() => {
    setPetals(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: FLOWERS[Math.floor(Math.random() * FLOWERS.length)],
        x: 15 + (i / Math.max(count - 1, 1)) * 70,
        size: 1.2 + Math.random() * 0.8,
        duration: 9 + Math.random() * 2,
        delay: (i / count) * 10,
        rotation: Math.random() * 360,
        swayAmount: 50 + Math.random() * 50,
      }))
    )
  }, [count])
  return petals
}

export default function Hero({ heroCoverUrl, heroStats, heroCard }: HeroProps) {
  const petals = usePetals(3)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  }
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  }
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  }

  const stats = heroStats

  const avatars = ['👩', '👨', '👩‍🦱', '🧑']

  return (
    <section className={styles.hero} id="home" ref={ref}>

      {/* Petal rain */}
      <div className={styles.petalLayer} aria-hidden="true">
        <AnimatePresence>
          {petals.map((p) => (
            <motion.span
              key={p.id}
              className={styles.petal}
              style={{ left: `${p.x}%`, fontSize: `${p.size}rem` }}
              initial={{ y: '-10vh', opacity: 0, rotate: p.rotation }}
              animate={{
                y: ['-10vh', '110vh'],
                opacity: [0, 0.9, 0.9, 0],
                rotate: [p.rotation, p.rotation + 200, p.rotation + 360],
                x: [0, p.swayAmount, -p.swayAmount / 2, p.swayAmount / 3, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 4,
                ease: 'easeInOut',
                times: [0, 0.1, 0.85, 1],
              }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* ── LEFT PANEL ── */}
      <motion.div
        className={styles.left}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y: contentY, opacity }}
      >
        <motion.div className={styles.badge} variants={fadeUp}>
          <span className={styles.badgeDot} />
          Trusted by event professionals worldwide
        </motion.div>

        <motion.h1 className={styles.headline} variants={fadeUp}>
          The elegant way to
          <em className={styles.accent}> plan &amp; celebrate</em>
          <br />your events.
        </motion.h1>

        <motion.div className={styles.divider} variants={fadeUp} />

        <motion.p className={styles.sub} variants={fadeUp}>
          From intimate weddings to grand corporate galas —
          everything you need, beautifully in one place.
        </motion.p>

        <motion.div className={styles.ctas} variants={fadeUp}>
          <motion.a
            href="#contact"
            className={styles.primaryBtn}
            whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(122,59,30,0.32)' }}
            whileTap={{ scale: 0.97 }}
          >
            Create Event <span className={styles.arrow}>→</span>
          </motion.a>
          <motion.a
            href="#services"
            className={styles.ghostBtn}
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.97 }}
          >
            Explore Services ↗
          </motion.a>
        </motion.div>

        <motion.div className={styles.stats} variants={fadeUp}>
          {stats.map(({ num, label }) => (
            <div key={label} className={styles.statItem}>
              <div className={styles.statNum}>{num}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.right} aria-hidden="true">
        <div className={styles.bgText}>✦</div>

        {/* Floating metric mini card */}
        <motion.div
          className={styles.floatingMini}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.miniLabel}>Events this month</div>
          <div className={styles.miniVal}>124</div>
          <div className={styles.miniSub}>↑ 18% from last month</div>
        </motion.div>

        {/* Card stack */}
        <motion.div
          className={styles.cardStack}
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <div className={styles.cardBack} />
          <div className={styles.cardMid} />
          <div className={styles.cardMain}>
            <span className={styles.cardTag}>✦ Featured Event</span>
            <div className={styles.cameraWrap}>
              <motion.div
                  
              >
                <Image
                  src={heroCoverUrl}
                  alt=""
                  width={200}
                  height={140}
                  style={{ objectFit: 'contain', borderRadius: '10px' }}
                />
              </motion.div>
            </div>
            <div className={styles.cardTitle}>{heroCard.title}</div>
            <div className={styles.cardSub}>{heroCard.subtitle}</div>
            <div className={styles.cardFooter}>
              <div className={styles.avatarsSm}>
                {avatars.map((e, i) => (
                  <motion.span
                    key={i}
                    className={styles.av}
                    style={{ zIndex: avatars.length - i }}
                    whileHover={{ y: -4, scale: 1.15, zIndex: 10 }}
                  >
                    {e}
                  </motion.span>
                ))}
                <span className={`${styles.av} ${styles.avPlus}`}>+9</span>
              </div>
              <motion.div
                className={styles.cardAction}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.95 }}
              >
                →
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Live events pill */}
        <motion.div
          className={styles.floatingPill}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.pillDot} />
          3 events happening now
        </motion.div>
      </div>
    </section>
  )
}
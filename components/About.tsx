'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import AnimateIn from './AnimateIn'
import styles from './About.module.css'
import type { StatPair } from '@/types/site'

type Props = { aboutStats: StatPair[] }

export default function About({ aboutStats: stats }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section className={styles.section} id="about" ref={ref}>
      <motion.div className={styles.bgLayer} style={{ y: bgY }} />

      <div className={styles.inner}>
        <AnimateIn direction="left">
          <div className={styles.left}>
            <div className={styles.imageBox}>
              <motion.div
                className={styles.imagePlaceholder}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🌺
                </motion.span>
                <p>Your Story,<br />Our Craft</p>
              </motion.div>

              <motion.div
                className={styles.floatingCard}
                initial={{ opacity: 0, x: 30, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(122,59,30,0.16)' }}
              >
                <span className={styles.floatEmoji}>🏆</span>
                <div>
                  <strong>Award Winning</strong>
                  <p>Best Event Agency 2024</p>
                </div>
              </motion.div>
            </div>
          </div>
        </AnimateIn>

        <div className={styles.right}>
          <AnimateIn direction="right" delay={0.1}>
            <span className={styles.tag}>✦ Our Story ✦</span>
            <h2 className={styles.title}>
              Where Every Event Becomes <em>a Memory</em>
            </h2>
          </AnimateIn>
          <AnimateIn direction="right" delay={0.2}>
            <p className={styles.body}>
              At Lim Events, we believe that great events don't just happen — they're carefully
              composed, like a piece of music that moves you. Since our founding, we've dedicated
              ourselves to crafting experiences that linger long after the last guest has gone home.
            </p>
          </AnimateIn>
          <AnimateIn direction="right" delay={0.3}>
            <p className={styles.body}>
              Our team of passionate planners, designers, and coordinators work in harmony
              to bring your vision to life — no matter how grand or intimate.
            </p>
          </AnimateIn>

          <div className={styles.stats}>
            {stats.map((s, i) => (
              <AnimateIn key={s.label} direction="up" delay={0.3 + i * 0.07}>
                <div className={styles.stat}>
                  <motion.span
                    className={styles.statNum}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 200 }}
                  >
                    {s.num}
                  </motion.span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn direction="up" delay={0.5}>
            <motion.a
              href="#contact"
              className={styles.btn}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Meet Our Team →
            </motion.a>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}

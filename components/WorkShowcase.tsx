'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimateIn from './AnimateIn'
import styles from './WorkShowcase.module.css'
import type { WorkDTO } from '@/types/site'

type Props = {
  works: WorkDTO[]
}

export default function WorkShowcase({ works }: Props) {
  if (!works.length) {
    return null
  }

  return (
    <section className={styles.section} id="work">
      <div className={styles.inner}>
        <AnimateIn direction="up">
          <div className={styles.header}>
            <span className={styles.tag}>✦ Our Work ✦</span>
            <h2 className={styles.title}>
              Celebrations We&apos;ve <em>Crafted</em>
            </h2>
            <p className={styles.sub}>
              A glimpse of recent events — each one planned with heart and delivered with precision.
            </p>
          </div>
        </AnimateIn>

        <div className={styles.grid}>
          {works.map((w, i) => {
            const cover = w.photos[0]?.url
            return (
              <AnimateIn key={w._id} direction="up" delay={i * 0.06}>
                <motion.article
                  className={styles.card}
                  whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(122,59,30,0.12)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  {cover ? (
                    <div className={styles.thumb}>
                      <Image
                        src={cover}
                        alt=""
                        width={640}
                        height={400}
                        className={styles.thumbImg}
                        sizes="(max-width: 900px) 100vw, 33vw"
                      />
                      {w.featured && <span className={styles.badge}>Featured</span>}
                    </div>
                  ) : (
                    <div className={styles.thumbPlaceholder}>
                      {w.featured && <span className={styles.badge}>Featured</span>}
                      <span className={styles.placeholderIcon}>✦</span>
                    </div>
                  )}
                  <div className={styles.body}>
                    <h3 className={styles.cardTitle}>{w.title}</h3>
                    <p className={styles.meta}>
                      {w.date}
                      <span className={styles.dot}>·</span>
                      {w.venue}
                    </p>
                    <p className={styles.story}>{w.story}</p>
                  </div>
                </motion.article>
              </AnimateIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

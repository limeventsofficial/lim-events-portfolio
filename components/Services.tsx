'use client'
import { motion } from 'framer-motion'
import AnimateIn from './AnimateIn'
import styles from './Services.module.css'
import type { ServiceDTO } from '@/types/site'

type Props = { services: ServiceDTO[] }

export default function Services({ services }: Props) {
  if (!services.length) return null

  return (
    <section className={styles.section} id="services">
      <div className={styles.inner}>
        <AnimateIn direction="up">
          <div className={styles.header}>
            <span className={styles.tag}>✦ What We Offer ✦</span>
            <h2 className={styles.title}>Services Crafted <em>for You</em></h2>
            <p className={styles.sub}>Every detail, every moment — curated with care and executed with precision.</p>
          </div>
        </AnimateIn>

        <div className={styles.grid}>
          {services.map((s, i) => (
            <AnimateIn key={s._id} direction="up" delay={i * 0.08}>
              <motion.div
                className={styles.card}
                whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(122,59,30,0.13)', borderColor: 'rgba(242,169,126,0.5)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.div
                  className={styles.iconWrap}
                  style={{ background: s.color }}
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className={styles.icon}>{s.icon}</span>
                </motion.div>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p className={styles.cardDesc}>{s.desc}</p>
                <motion.a
                  href="#contact"
                  className={styles.cardLink}
                  whileHover={{ x: 4 }}
                >
                  Learn more →
                </motion.a>
              </motion.div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}

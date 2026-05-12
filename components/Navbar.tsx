'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Home', hash: 'home' },
    { label: 'Services', hash: 'services' },
    { label: 'Work', hash: 'work' },
    { label: 'About', hash: 'about' },
    { label: 'Contact', hash: 'contact' },
  ]

  return (
    <div className={`${styles.navWrapper} ${scrolled ? styles.wrapperScrolled : ''}`}>
      <motion.nav
        className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.a href="#" className={styles.logo} whileHover={{ scale: 1.03 }}>
          <span className={`${styles.logoMark} ${scrolled ? styles.logoMarkScrolled : ''}`}>✦</span>
          <span className={styles.logoText}>Lim Events</span>
        </motion.a>

        {/* Nav links */}
        <ul className={styles.links}>
          {links.map((link, i) => (
            <motion.li
              key={link.hash}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
            >
              <a href={`#${link.hash}`}>{link.label}</a>
            </motion.li>
          ))}
        </ul>

        {/* CTA */}
        <motion.a
          href="#contact"
          className={`${styles.ctaBtn} ${scrolled ? styles.ctaBtnScrolled : ''}`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          Let&apos;s Talk
          <span className={styles.ctaArrow}>→</span>
        </motion.a>

        {/* Hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }} />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} />
        </button>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {links.map((link, i) => (
              <motion.a
                key={link.hash}
                href={`#${link.hash}`}
                className={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className={styles.mobileLinkNum}>0{i + 1}</span>
                {link.label}
              </motion.a>
            ))}
            <a href="#contact" className={styles.mobileCta} onClick={() => setMenuOpen(false)}>
              Let&apos;s Talk →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
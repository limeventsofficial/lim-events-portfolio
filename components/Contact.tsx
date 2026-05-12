'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimateIn from './AnimateIn'
import styles from './Contact.module.css'
import type { ContactInfo } from '@/types/site'

type Props = { contact: ContactInfo; siteYear: number }

export default function Contact({ contact, siteYear }: Props) {
  const [form, setForm] = useState({ name: '', email: '', event: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  const details = [
    { icon: '📍', label: 'Visit Us', val: contact.address },
    { icon: '📞', label: 'Call Us', val: contact.phone },
    { icon: '✉️', label: 'Email Us', val: contact.email },
  ]

  return (
    <section className={styles.section} id="contact">
      <div className={styles.inner}>
        <AnimateIn direction="left">
          <div className={styles.left}>
            <span className={styles.tag}>✦ Get in Touch ✦</span>
            <h2 className={styles.title}>
              Let's Plan Something <em>Beautiful</em>
            </h2>
            <p className={styles.sub}>
              Ready to bring your dream event to life? Tell us about your vision and we'll make it happen.
            </p>
            <div className={styles.contactDetails}>
              {details.map((d, i) => (
                <motion.div
                  key={d.label}
                  className={styles.detail}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  whileHover={{ x: 6 }}
                >
                  <span className={styles.detailIcon}>{d.icon}</span>
                  <div>
                    <strong>{d.label}</strong>
                    <p>{d.val}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </AnimateIn>

        <AnimateIn direction="right" delay={0.15}>
          <div className={styles.right}>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  className={styles.success}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.span
                    className={styles.successEmoji}
                    animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8 }}
                  >
                    🎉
                  </motion.span>
                  <h3>Thank you!</h3>
                  <p>We've received your message and will be in touch within 24 hours.</p>
                  <motion.button
                    className={styles.resetBtn}
                    onClick={() => { setSent(false); setForm({ name: '', email: '', event: '', message: '' }) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send Another
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className={styles.formWrapper}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[
                    { label: 'Your Name',    name: 'name',    type: 'text',  placeholder: 'e.g. Sarah Johnson' },
                    { label: 'Email Address',name: 'email',   type: 'email', placeholder: 'you@example.com' },
                  ].map((f, i) => (
                    <motion.div
                      key={f.name}
                      className={styles.formGroup}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <label>{f.label}</label>
                      <input
                        type={f.type}
                        name={f.name}
                        placeholder={f.placeholder}
                        value={(form as any)[f.name]}
                        onChange={handleChange}
                      />
                    </motion.div>
                  ))}

                  <motion.div
                    className={styles.formGroup}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.16 }}
                  >
                    <label>Event Type</label>
                    <select name="event" value={form.event} onChange={handleChange}>
                      <option value="">Select event type...</option>
                      {['Wedding', 'Corporate Event', 'Private Party', 'Other'].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    className={styles.formGroup}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.22 }}
                  >
                    <label>Tell Us Your Vision</label>
                    <textarea name="message" rows={4} placeholder="Describe your dream event..." value={form.message} onChange={handleChange} />
                  </motion.div>

                  <motion.button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.04, y: -2, boxShadow: '0 10px 30px rgba(122,59,30,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Send Message ✦
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AnimateIn>
      </div>

      <motion.div
        className={styles.footer}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p>
          © {siteYear} Lim Events. Crafted with <span>♥</span> for unforgettable moments.
        </p>
        <div className={styles.footerLinks}>
          {['Privacy', 'Terms', 'Instagram', 'Pinterest'].map(l => (
            <motion.a key={l} href="#" whileHover={{ y: -2, color: 'var(--brown)' }}>
              {l}
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
